pub use reqwest;

use std::cell::Cell;
use std::fmt;
use std::fmt::Debug;
use std::sync::Arc;
use std::time::{Duration, Instant};

use clap::ValueEnum;
use reqwest::{IntoUrl, Method, RequestBuilder, Url};
use serde::{Deserialize, Serialize};
use serde::de::DeserializeOwned;
use serde_json::Value;

pub use articles::{
    ArticlesArgs,
    ArticlesIter,
    ArticlesTypeEnum,
};
pub use authorization_code::{
    AuthorizationCodeRequestsArgs,
    AuthorizationCodeRequestsSortAttribute,
    AuthorizationCodeRequestsIter
};
pub use contact::{
    ContactsArgs,
    ContactsSortAttribute,
    ContactsIter,
};
pub use dnssec::{
    DnsSec,
    DnsSecAlgorithm,
    DnsSecDigestType,
};
pub use domain::{
    DomainsArgs,
    DomainsCreateArgs,
    DomainCreateExtensionsArgs,
    DomainsRenewArgs,
    DomainsUpdateArgs,
    DomainsAssociatedToHostIter,
    DomainsIter,
    DomainsSearchFieldEnum,
    DomainEppStatus,
    DomainContactRole,
    DnsSecDomainUpdate,
    DomainUpdateExtensionsArgs,
};
pub use host::{
    HostsArgs,
    HostsCreateArgs,
    HostsUpdateArgs,
    HostsSortAttribute,
    HostsIter,
    HostEppStatus,
    IpAddress,
};
pub use app::{ApplicationError, client_for_cli};

mod articles;
mod authorization_code;
mod contact;
mod dnssec;
mod domain;
mod host;
mod pager;
mod app;

const DEFAULT_CLIENT_ID: &str = "registrars-api-client";

#[derive(Debug)]
pub enum Error {
    Reqwest(reqwest::Error),
    Json(serde_json::Error),
    Api((reqwest::Error, Value))
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Reqwest(e) => Some(e),
            Self::Json(e) => Some(e),
            Self::Api(_) => None,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::Reqwest(e) => write!(f, "error while calling Afnic API: {}", e),
            Self::Json(e) => write!(f, "error with JSON data: {}", e),
            Self::Api((e, j)) => write!(
                f,
                "error while calling Afnic API error={}, body={}",
                e,
                j
            ),
        }
    }
}

impl From<reqwest::Error> for Error {
    fn from(src: reqwest::Error) -> Self {
        Self::Reqwest(src)
    }
}

impl From<serde_json::Error> for Error {
    fn from(src: serde_json::Error) -> Self {
        Self::Json(src)
    }
}

pub type Result<T, E = Error> = std::result::Result<T, E>;

/// One of the registries managed by Afnic
#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, PartialOrd, Ord)]
pub enum Registry {
    /// The sandbox used for testing the .fr TLD
    FrSandbox
}

impl Registry {
    /// Returns the `Url` used for the registries managed by Afnic.
    /// The first one is the login URL, the second one is the API URL.
    ///
    ///
    /// Examples
    /// ========
    ///
    /// ```
    /// assert!(
    ///     ! afnic::Registry::FrSandbox.endpoints().0.cannot_be_a_base(),
    /// );
    pub fn endpoints(&self) -> (Url, Url) {
        match self {
            Self::FrSandbox => (
                "https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token"
                    .parse()
                    .unwrap(),
                "https://api-sandbox.nic.fr/v1/"
                    .parse().unwrap()
            )
        }
    }
}


/// An OAuth2 token
#[derive(Clone, Deserialize, Debug, Default, Hash, PartialEq)]
pub struct AfnicTokenResponse {
    access_token: String,
    token_type: String,
    expires_in: Option<u64>,
}

/// A Client to access the Afnic's Open API. Because it embeds an
/// access_token that later has to be released, it is *not* `Clone`.
pub struct Client {
    client: reqwest::Client,
    login_url: Url,
    openapi_url: Url,
    client_id: String,
    login: String,
    password: String,
    token: Cell<Option<(Instant, AfnicTokenResponse)>>
}

impl fmt::Debug for Client {
    // XXX Be careful to not reveal secrets
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let token = self.token.take();
        let display_token = Cell::new(token.as_ref().map(|(i, _)| (*i, "xxxxxxxx")));
        self.token.set(token);
        write!(
            f,
            "Client {{ client: {:?}, login_url: {:?}, openapi_url: {:?}, client_id: {:?}, login: {:?}, password: {:?}, token: {:?} }}",
            self.client,
            self.login_url,
            self.openapi_url,
            self.client_id,
            self.login,
            "XXXXXXXX".to_string(),
            display_token
        )
    }
}

impl Client {
    /// Create a new `Client` from URL, login and password.
    ///
    /// Examples
    /// ========
    ///
    /// ```
    /// let client = afnic::Client::from_parts(
    ///     "https://localhost/auth/".parse().unwrap(),
    ///     "https://localhost/v1/".parse().unwrap(),
    ///     "my-login",
    ///     "my-password",
    /// );
    /// ```
    pub fn from_parts<S: ToString, T: ToString, U: ToString>(
        login_url: Url,
        openapi_url: Url,
        client_id: S,
        login: T,
        password: U
    ) -> Self
    {
        Self {
            login_url,
            openapi_url,
            client_id: client_id.to_string(),
            client: reqwest::Client::new(),
            login: login.to_string(),
            password: password.to_string(),
            token: Default::default()
        }
    }

    /// Create a new `Client` from a configuration file.
    ///
    /// The configuration file must consist of 2 to 5 lines:
    /// * the `username`,
    /// * the `password`,
    /// * (optionnal) the authorization endpoint. Defaults to
    ///   `https://login-sandbox.nic.fr/auth/realms/fr/protocol/openid-connect/token`
    ///   if empty or omitted,
    /// * (optionnal) the service endpoint. Defaults to
    ///   `https://api-sandbox.nic.fr/v1/` if empty or omitted.
    /// * (optionnal) the `client_id`. Defaults to
    ///   `registrars-api-client` if empty or omitted,
    pub fn from_file<P: AsRef<std::path::Path>>(path: P) -> Result<Self, std::io::Error> {
        use std::io::{Error, ErrorKind::Other};
        let content = std::fs::read_to_string(path)?;
        let mut lines = content.lines();
        let username = lines.next()
            .ok_or_else(
                || Error::new(Other, "Configuration file is missing username")
            )?;
        let password = lines.next()
            .ok_or_else(
               || Error::new(Other, "Configuration file is missing password")
            )?;
        let login_url = lines.next().unwrap_or("");
        let login_url = if login_url.is_empty() {
            Registry::FrSandbox.endpoints().0
        } else {
            login_url.parse().map_err(|e| Error::new(Other, e))?
        };
        let openapi_url = lines.next().unwrap_or("");
        let openapi_url = if openapi_url.is_empty() {
            Registry::FrSandbox.endpoints().1
        } else {
            openapi_url.parse().map_err(|e| Error::new(Other, e))?
        };
        let client_id = lines.next().unwrap_or("");
        let client_id = if client_id.is_empty() {
            DEFAULT_CLIENT_ID
        } else {
            client_id
        };
        let client = Self::from_parts(login_url, openapi_url, client_id, username, password);
        Ok(client)
    }

    /// Create a new `Client` using one of the endpoints provided by
    /// Afnic.
    ///
    /// Examples
    /// ========
    ///
    /// ```
    /// let client = afnic::Client::new(
    ///     afnic::Registry::FrSandbox,
    ///     "my-password",
    ///     "my-login"
    /// );
    /// ```
    pub fn new<T, U>(registry: Registry, login: T, password: U) -> Self
    where T: ToString,
          U: ToString
    {
        let (login_url, openapi_url) = registry.endpoints();
        Self::from_parts(login_url, openapi_url, DEFAULT_CLIENT_ID, login, password)
    }

    /// List of articles by type
    pub async fn articles_iter(self: Arc<Self>, args: ArticlesArgs) -> ArticlesIter {
        let url = self.url("registrar/articles");
        ArticlesIter::new(self, args, url)
    }

    /// List registrar's sponsored domains
    pub async fn domains(&self) -> Result<Value> {
        self.query_domains(&Default::default()).await
    }

    /// Create a domain
    pub async fn domains_create(
        &self,
        domain: &DomainsCreateArgs
    ) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.post(self.url("domains")).await?
                .json(domain)
                .send().await?
        ).await?;
        Ok(res)
    }

    /// Renew domain operations
    pub async fn domains_renew(
        &self,
        args: &DomainsRenewArgs
    ) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.post(self.url("domains/renew")).await?
                .json(args)
                .send().await?
        ).await?;
        Ok(res)
    }

    /// List registrar's sponsored domains
    pub async fn query_domains(&self, args: &DomainsArgs) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.get(self.url("domains")).await?
                .query(args)
                .send().await?
        )
            .await?;
        Ok(res)
    }

    /// Returns a `DomainsIter` that can be used to iterate over all
    /// domains returned, automatically handling paging and making
    /// queries for subsequent pages.
    ///
    /// The returned `DomainsIter` is *not* a proper Rust iterator
    /// because they are not yet stable for async. So you have to
    /// manually call `next()` on it to get at each domain.
    ///
    /// Examples
    /// ========
    ///
    /// ```no_run
    /// # use afnic::{Client, DomainsArgs, Registry};
    /// # let client = Client::new(Registry::FrSandbox, "my-login", "my-password");
    /// # async {
    /// let client = std::sync::Arc::new(client);
    /// let mut iter = client.query_domains_iter(DomainsArgs::default())
    ///     .await;
    /// while let Some(domain) = iter.next().await.transpose().unwrap() {
    ///     println!("{}", domain["name"]);
    /// }
    /// # };
    /// ```
    pub async fn query_domains_iter(
        self: Arc<Self>,
        args: DomainsArgs
    ) -> DomainsIter {
        let url = self.url("domains");
        DomainsIter::new(self, args, url)
    }

    pub async fn domains_associated_to_host<S: AsRef<str>>(
        self: Arc<Self>,
        host_name: S
    ) -> DomainsAssociatedToHostIter {
        let mut url = self.url("domains/associated-to-host");
        url.path_segments_mut().unwrap().push(host_name.as_ref());
        DomainsAssociatedToHostIter::new(self, (), url)
    }

    pub async fn domains_by_name(&self, name: &str) -> Result<Value> {
        let mut url = self.url("domains");
        url.path_segments_mut().unwrap().push(name);
        let (_, res) = response_error_for_status(
            self.get(url).await?
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn domains_check<I, S>(
        &self, into_names: I
    ) -> Result<Value>
    where I: IntoIterator<Item=S>,
          S: AsRef<str> + Serialize
    {
        let names: Vec<_> = into_names.into_iter().collect();
        let (_, res) = response_error_for_status(
            self.post(self.url("domains/check")).await?
                .json(&serde_json::json!({"names": &names}))
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn domains_update(&self, args: &DomainsUpdateArgs) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.patch(self.url("domains")).await?
                .json(args)
                .send().await?
        ).await?;
        Ok(res)
    }

    /// List registrar's sponsored contacts
    pub async fn contacts_iter(self: Arc<Self>, args: ContactsArgs) -> ContactsIter {
        let url = self.url("contacts");
        ContactsIter::new(self, args, url)
    }

    pub async fn contacts_create<S>(&self, contact: &S) -> Result<Value>
    where S: Serialize
    {
        let (_, res) = response_error_for_status(
            self.post(self.url("contacts")).await?
                .json(contact)
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn hosts_by_name<S: AsRef<str>>(&self, name: S) -> Result<Value> {
        let mut url = self.url("hosts");
        url.path_segments_mut().unwrap().push(name.as_ref());
        let (_, res) = response_error_for_status(
            self.get(url).await?
                .send().await?
        ).await?;
        Ok(res)
    }

    /// List registrar's sponsored hosts
    pub async fn hosts_iter(self: Arc<Self>, args: HostsArgs) -> HostsIter {
        let url = self.url("hosts");
        HostsIter::new(self, args, url)
    }

    /// Create a HOST object
    pub async fn hosts_create(&self, args: &HostsCreateArgs) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.post(self.url("hosts")).await?
                .json(args)
                .send().await?
        ).await?;
        Ok(res)
    }

    /// Update a HOST object
    pub async fn hosts_update(&self, args: &HostsUpdateArgs) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.patch(self.url("hosts")).await?
                .json(args)
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn registrar_authorization_code<S>(&self, roid: S) -> Result<Value>
    where S: AsRef<str>
    {
        let roid = roid.as_ref();
        let mut url = self.url("registrar/authorization-code-requests");
        url.path_segments_mut().expect("URL is a base")
            .push(roid);
        let (_, res) = response_error_for_status(
            self.get(url).await?
                .send().await?
        ).await?;
        Ok(res)
    }

    /// Request authorization code for a domain
    ///
    /// Example
    /// =======
    ///
    /// ```no_run
    /// # use afnic::{Client, DomainsArgs, Registry};
    /// # let client = Client::new(Registry::FrSandbox, "my-login", "my-password");
    /// # async {
    /// client.registrar_authorization_code_request(
    ///     "example-of-domain-that-requires-authorization-code.fr",
    ///     "XX123",
    ///     "Justification text"
    /// ).await.unwrap();
    /// # };
    /// ```
    pub async fn registrar_authorization_code_request<T, U, V>(
        &self,
        name: T,
        registrant: U,
        justification: V
    ) -> Result<Value>
    where T: AsRef<str>,
          U: AsRef<str>,
          V: AsRef<str>
    {
        let (_, res) = response_error_for_status(
            self.post(self.url("registrar/authorization-code-requests")).await?
                .json(&serde_json::json!({
                    "domainName": name.as_ref(),
                    "registrantClientId": registrant.as_ref(),
                    "justification": justification.as_ref()
                }))
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn registrar_authorization_code_requests(
        &self,
        args: &AuthorizationCodeRequestsArgs
    ) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.get(self.url("registrar/authorization-code-requests")).await?
                .query(args)
                .send().await?
        ).await?;
        Ok(res)
    }

    pub async fn registrar_authorization_code_requests_iter(
        self: Arc<Self>,
        args: AuthorizationCodeRequestsArgs
    ) -> AuthorizationCodeRequestsIter {
        let url = self.url("registrar/authorization-code-requests");
        AuthorizationCodeRequestsIter::new(self, args, url)
    }

    pub async fn token(&self) -> Result<String> {
        fn result(
            client: &Client,
            now: Instant,
            token: AfnicTokenResponse
        ) -> Result<String> {
            let access_token = token.access_token.clone();
            client.token.replace(Some((now, token)));
            Ok(access_token)
        }
        if let Some((instant, token_response)) = self.token.take() {
            let elapsed = instant.elapsed();
            let expires_in = token_response.expires_in.unwrap_or(300);
            let expires_in = Duration::from_secs(expires_in);
            if elapsed * 10 < expires_in * 9 {
                return result(self, instant, token_response);
            }
            else {
                let token = reqwest::Client::new().post(self.login_url.as_str())
                    .form(&[
                        ("grant_type", "password"),
                        ("client_id", &self.client_id),
                        ("username", &self.login),
                        ("password", &self.password)
                    ])
                    .send().await?
                    .json().await?;
                return result(self, Instant::now(), token);
            }
        } else {
            let token = reqwest::Client::new().post(self.login_url.as_str())
                .form(&[
                    ("grant_type", "password"),
                    ("client_id", &self.client_id),
                    ("username", &self.login),
                    ("password", &self.password)
                ])
                .send().await?
                .json().await?;
            return result(self, Instant::now(), token);
        }
    }

    fn url(&self, path: &str) -> reqwest::Url {
        self.openapi_url.join(path).unwrap()
    }

    async fn request<U: IntoUrl>(
        &self,
        method: reqwest::Method,
        url: U
    ) -> Result<RequestBuilder>
    {
        self.token().await
            .map(
                |token| self.client.request(method, url)
                    .header(reqwest::header::AUTHORIZATION, format!("Bearer {}", token))
                    .header(reqwest::header::ACCEPT, "application/json")
                    .header("extensions", "FRNIC_V2, SECDNS_V1_1")
            )
    }

    async fn get<U>(&self, url: U) -> Result<RequestBuilder>
    where U: IntoUrl
    {
        self.request(Method::GET, url).await
    }

    async fn patch<U>(&self, url: U) -> Result<RequestBuilder>
    where U: IntoUrl
    {
        self.request(Method::PATCH, url).await
    }

    async fn post<U>(&self, url: U) -> Result<RequestBuilder>
    where U: IntoUrl
    {
        self.request(Method::POST, url).await
    }
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SortAttribute {
    Name, CreationDate, UpdateDate
}

#[derive(Clone, Copy, Debug, Serialize, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum StringSearchTypeEnum {
    Equals, Like, StartWith, EndWith
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SortDirection {
    Asc, Desc
}

// The `reqwest::Response` does not provide an easy way to obtain the
// body (`bytes()`, `text()`, `json()`) without consuming the
// `Response` itself`.
//
// See https://github.com/seanmonstar/reqwest/issues/1026
//
// This function does just that: it will read all the body from the
// `Response` and return it.
async fn response_data(
    response: &mut reqwest::Response
) -> Result<Option<Vec<u8>>> {
    match response.chunk().await? {
        None => Ok(None),
        Some(chunk) => {
            let mut body: Vec<u8> = Vec::new();
            // Do not trust content_length() too much
            // (https://github.com/seanmonstar/reqwest/issues/1136)
            if let Some(content_length) = response.content_length() {
                if let Ok(additional) = content_length.try_into() {
                    body.reserve(additional);
                }
            }
            body.extend_from_slice(&chunk);
            while let Some(chunk) = response.chunk().await? {
                body.extend_from_slice(&chunk);
            }
            Ok(Some(body))
        }
    }
}

async fn response_error_for_status<T: DeserializeOwned>(
    mut response: reqwest::Response
) -> Result<(reqwest::Response, T), Error> {
    let data = response_data(&mut response).await?
        .unwrap_or_else(|| "".into());
    match response.error_for_status() {
        Err(err) => {
            let value = serde_json::from_slice(&data)
                .unwrap_or_else(
                    |_| serde_json::Value::String(
                        String::from_utf8_lossy(&data).into_owned()
                    )
                );
            Err(Error::Api((err, value)))
        }
        Ok(response) => {
            let json = serde_json::from_slice(&data)?;
            Ok((response, json))
        }
    }
}

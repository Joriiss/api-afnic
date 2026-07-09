use serde::Serialize;

use crate::SortDirection;
use crate::pager;

pub type AuthorizationCodeRequestsIter = pager::PageIter<AuthorizationCodeRequestsArgs>;

/// Arguments to the `Client::registrar_authorization_code_requests()` method.
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthorizationCodeRequestsArgs {
    pub status: Option<String>,
    // Paging fields
    pub page_size: Option<u64>,
    pub sort_attribute: Option<AuthorizationCodeRequestsSortAttribute>,
    pub sort_direction: Option<SortDirection>,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum AuthorizationCodeRequestsSortAttribute {
    RequestRoid, RegistrantClientId, RegistrantName, DomainName,
    Justification, CreationDate, UpdateDate
}


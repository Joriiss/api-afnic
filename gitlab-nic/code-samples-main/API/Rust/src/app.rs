use std::error::Error;
use std::fmt;
use std::path::Path;
use serde::Deserialize;
use crate::Client;

pub struct ApplicationError(String);

impl Error for ApplicationError {}

impl fmt::Display for ApplicationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl fmt::Debug for ApplicationError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self)
    }
}

impl From<String> for ApplicationError {
    fn from(source: String) -> Self {
        Self(source)
    }
}

impl From<&str> for ApplicationError {
    fn from(source: &str) -> Self {
        source.to_string().into()
    }
}

impl From<crate::Error> for ApplicationError {
    fn from(source: crate::Error) -> Self {
        use crate::Error;
        // See RestErrorDto in the API
        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct ApiError {
            error_code: String,
            field_name: Option<String>,
            rejected_value: Option<String>,
            message: Option<String>
        }
        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct MultiErr {
            errors: Vec<ApiError>
        }
        match source {
            Error::Reqwest(error) => Self(format!("{}", error)),
            Error::Json(error) => Self(format!("{}", error)),
            Error::Api((error, value)) => {
                let details = ApiError::deserialize(&value)
                    .map(|api_error| vec![api_error])
                    .or_else(
                        |_| MultiErr::deserialize(&value).map(|vec| vec.errors)
                    )
                    .ok();
                // let details = match ApiError::deserialize(&value) {
                //     Ok(detail) => Some(vec![detail]),
                //     Err(_) => match MultiErr::deserialize(&value) {
                //         Ok(details) => Some(details.errors),
                //         Err(_) => None
                //     }
                // };
                if let Some(v) = details {
                    use std::fmt::Write;
                    let mut out = String::new();
                    let mut sep = "";
                    for detail in v {
                        write!(out, "{}{}", sep, detail.error_code).unwrap();
                        sep = "\n";
                        if let Some(message) = detail.message {
                            write!(out, ". {}.", message).unwrap();
                        }
                        if let Some(field) = detail.field_name {
                            write!(out, " Erroneous field: {}.", field).unwrap();
                        }
                        if let Some(rejected) = detail.rejected_value {
                            write!(out, " Rejected value: {}.", rejected).unwrap();
                        }
                    }
                    Self(out)
                } else {
                    Self(format!(
                        "{}: {}",
                        error,
                        value
                    ))

                }
            },
        }
    }
}

/// Returns an `Ok(afnic::Client)` constructed from the `auth_file`
/// configuration. If it is `None` then use `~/.afnic-api` (the file
/// `.afnic-api` found in the user's home directory) instead`.
///
/// In case of error, return a descriptive error message in `Err(String)`.
pub fn client_for_cli(auth_file: Option<&Path>) -> Result<Client, String> {
    match auth_file {
        Some(path) => Client::from_file(path).map_err(
            |e| format!("failed to read {}: {}", path.display(), e)
        ),
        None => match home::home_dir() {
            Some(mut path) => {
                path.push(".afnic-api");
                Client::from_file(&path).map_err(
                    |e| format!("failed to read {}: {}", path.display(), e)
                )
            }
            None => Err(format!("$HOME environment not present"))
        }
    }
}

// /// Returns an `afnic::Client` constructed from the `auth_file`
// /// configuration. If it is `None` then use `$HOME/.afnic-api
// /// instead`.
// ///
// /// In case of error, print a descriptive error message and exit with
// /// a code indicating erroe.
// pub fn client_for_cli(auth_file: Option<&Path>) -> Client {
//     match client_for(auth_file) {
//         Err(e) => {
//             eprintln!("{}: {}", std::env::args().next().unwrap_or("".into()), e);
//             exit(ExitCode::FAILURE);
//         }
//         Ok(client) => client
//     }
// }

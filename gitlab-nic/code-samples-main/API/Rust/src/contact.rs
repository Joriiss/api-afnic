use serde::Serialize;

use super::{SortAttribute, SortDirection};
use crate::pager::PageIter;

pub type ContactsIter = PageIter<ContactsArgs>;

/// Arguments to the `Client::contacts_iter()` method.
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ContactsArgs {
    pub name: Option<String>,
    pub roid: Option<String>,
    pub client_id: Option<String>,
    pub page_size: Option<u64>,
    pub sort_attribute: Option<ContactsSortAttribute>,
    pub sort_direction: Option<SortDirection>
}

pub type ContactsSortAttribute = SortAttribute;


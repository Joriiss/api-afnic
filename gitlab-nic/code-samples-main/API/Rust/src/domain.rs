use clap::ValueEnum;
use serde::Serialize;

use super::{SortAttribute, SortDirection, StringSearchTypeEnum};
use crate::DnsSec;
use crate::pager::PageIter;

pub type DomainsIter = PageIter<DomainsArgs>;
pub type DomainsAssociatedToHostIter = PageIter<()>;

/// Arguments to the `Client::domains()` method
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainsArgs {
    pub research: Option<String>,
    pub domain_search_field: Option<DomainsSearchFieldEnum>,
    pub string_search_type: Option<StringSearchTypeEnum>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub domain_date_field: Option<DomainDateField>,
    pub page_size: Option<u64>,
    pub sort_attribute: Option<DomainsSortAttribute>,
    pub sort_direction: Option<SortDirection>,
}

/// Arguments to the `Client::domains_create()` method.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainsCreateArgs {
    pub name: String,
    pub duration_in_years: Option<u32>,
    /// The list of name servers to associate with the domain
    pub name_servers: Vec<String>,
    pub registrant_client_id: Option<String>,
    pub contacts: Vec<DomainContact>,
    pub authorization_information: String,
    pub extensions: Option<DomainCreateExtensionsArgs>
}

impl DomainsCreateArgs {
    pub fn new(name: String, authorization_information: String) -> Self {
        Self {
            name, authorization_information,
            duration_in_years: None,
            name_servers: Vec::new(),
            registrant_client_id: None,
            contacts: Vec::new(),
            extensions: None
        }
    }
}

/// Arguments to the `Client::domains_renew()` method.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainsRenewArgs {
    pub name: String,
    pub current_expiration_date: String,
    pub duration_in_years: u32,
}

impl DomainsRenewArgs {
    pub fn new<S: ToString, T: ToString>(
        name: S,
        current_expiration_date: T,
        duration_in_years: u32
    ) -> Self {
        Self {
            name: name.to_string(),
            current_expiration_date: current_expiration_date.to_string(),
            duration_in_years
        }
    }
}

/// Arguments to the `Client::domains_update()` method.
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DomainsUpdateArgs {
    /// The domain name
    pub name: String,
    pub registrant_client_id: Option<String>,
    /// The list of name servers to be associated to the current domain
    pub name_servers_to_add: Vec<String>,
    /// The list of name servers to be unassociated to the current domain
    pub name_servers_to_remove: Vec<String>,
    /// List of Domain EPP statuses to add
    pub epp_statuses_to_add: Vec<DomainEppStatus>,
    /// List of domain EPP statuses to remove
    pub epp_statuses_to_remove: Vec<DomainEppStatus>,
    pub contacts_to_add: Vec<DomainContact>,
    pub contacts_to_remove: Vec<DomainContact>,
    pub authorization_information: Option<String>,
    pub extensions: Option<DomainUpdateExtensionsArgs>
}

pub type DomainsSortAttribute = SortAttribute;

#[derive(Clone, Copy, Debug, Serialize, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DomainsSearchFieldEnum {
    Domain,
    Contact,
    Host
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DomainDateField {
    CreationDate, UpdateDate, ExpirationDate
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DomainEppStatus {
    Ok, Inactive, PendingCreate, PendingDelete, PendingRenew,
    PendingTransfer, PendingUpdate, ClientTransferProhibited,
    ServerTransferProhibited, ClientRenewProhibited,
    ServerRenewProhibited, ClientHold, ServerHold,
    ClientDeleteProhibited, ServerDeleteProhibited,
    ClientUpdateProhibited, ServerUpdateProhibited,
    ServerRecoverProhibited, ServerTradeProhibited
}

#[derive(Clone, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "camelCase")]
pub struct DomainContact {
    client_id: String,
    role: DomainContactRole
}

impl From<(String, DomainContactRole)> for DomainContact {
    fn from((client_id, role): (String, DomainContactRole)) -> Self {
        Self { client_id, role }
    }
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DomainContactRole {
    Administrative, Billing, Technical, Registrant
}

#[derive(Clone, Debug, Serialize, Hash, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DomainCreateExtensionsArgs {
    pub dns_sec: Vec<DnsSec>,
}

#[derive(Clone, Debug, Default, Serialize, Hash, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DomainUpdateExtensionsArgs {
    pub dns_sec: Option<DnsSecDomainUpdate>,
}

#[derive(Clone, Debug, Default, Serialize, Hash, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DnsSecDomainUpdate {
    remove_all: Option<bool>,
    pub keys_to_remove: Vec<DnsSec>,
    pub keys_to_add: Vec<DnsSec>,
}

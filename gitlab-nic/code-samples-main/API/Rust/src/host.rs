use std::net::IpAddr;
use std::str::FromStr;

use clap::ValueEnum;
use serde::Serialize;

use super::{SortAttribute, SortDirection};
use crate::pager::PageIter;

pub type HostsIter = PageIter<HostsArgs>;

/// Arguments to the `Client::hosts_iter()` method.
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostsArgs {
    pub name: Option<String>,
    pub page_size: Option<u64>,
    pub sort_attribute: Option<HostsSortAttribute>,
    pub sort_direction: Option<SortDirection>
}

pub type HostsSortAttribute = SortAttribute;

/// Argument to the `Client::hosts_create()` method
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostsCreateArgs {
    /// The fully qualified name of the host object
    pub name: String,
    /// The IP addresses associated with the host object
    pub ip_addresses: Vec<IpAddress>
}

/// Argument to the `Client::hosts_update()` method
#[derive(Clone, Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HostsUpdateArgs {
    /// The fully qualified name of the host object
    pub name: String,
    /// Name to be used in order to replace the current host name
    pub new_name: Option<String>,
    /// List of unique ip addresses to be associated to the host
    pub add_ip_addresses: Vec<IpAddress>,
    /// List of unique ip addresses to be removed as association with the host
    pub remove_ip_addresses: Vec<IpAddress>,
    /// List of epp statuses values to be added to the host
    pub add_epp_statuses: Vec<HostEppStatus>,
    /// List of epp statuses values to be removed from the host
    pub remove_epp_statuses: Vec<HostEppStatus>
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum HostEppStatus {
    Ok, Linked, PendingCreate, PendingDelete, PendingTransfer,
    PendingUpdate, ClientDeleteProhibited, ServerDeleteProhibited,
    ClientUpdateProhibited, ServerUpdateProhibited
}

/// The IP addresses associated with the host
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpAddress {
    /// The IP addresses associated with the host object
    pub ip: String,
    /// The IP version
    pub version: IpAddressVersion
}

impl FromStr for IpAddress {
    type Err = std::net::AddrParseError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        IpAddr::from_str(s)
            .map(|addr| addr.into())
    }
}

impl From<IpAddr> for IpAddress {
    fn from(ip_addr: IpAddr) -> Self {
        match ip_addr {
            IpAddr::V4(ipv4) => Self {
                ip: ipv4.to_string(),
                version: IpAddressVersion::V4
            },
            IpAddr::V6(ipv6) => Self {
                ip: ipv6.to_string(),
                version: IpAddressVersion::V6
            }
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum IpAddressVersion { V4, V6 }

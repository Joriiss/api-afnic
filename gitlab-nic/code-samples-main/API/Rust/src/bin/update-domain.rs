use clap::Parser;

use afnic::{DomainEppStatus, DnsSec, DnsSecDomainUpdate, DomainUpdateExtensionsArgs};

/// Update a domain object.
///
/// Example usage
/// =============
///
///     $ update-domain example. --add-host ns2.example.org
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// The domain name
    name: String,
    #[arg(short, long)]
    registrant: Option<String>,
    /// Name server to add to the domain
    #[arg(short, long)]
    add_ns: Vec<String>,
    /// Name server to remove from the domain
    #[arg(short, long)]
    del_ns: Vec<String>,
    /// DS to add
    #[arg(long)]
    add_ds: Vec<DnsSec>,
    /// DS to remove
    #[arg(long)]
    del_ds: Vec<DnsSec>,
    /// EPP status to add to the domain
    #[arg(long)]
    add_status: Vec<DomainEppStatus>,
    /// EPP status to remove from the domain
    #[arg(long)]
    del_status: Vec<DomainEppStatus>,
    // add_contact: Vec<DomainContact>,
    // del_contact: Vec<DomainContact>,
    #[arg(long)]
    auth_info: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let mut domain = afnic::DomainsUpdateArgs {
        name: args.name,
        registrant_client_id: args.registrant,
        name_servers_to_add: args.add_ns,
        name_servers_to_remove: args.del_ns,
        epp_statuses_to_add: args.add_status,
        epp_statuses_to_remove: args.del_status,
        authorization_information: args.auth_info,
        .. afnic::DomainsUpdateArgs::default()
    };
    let mut dns_sec = DnsSecDomainUpdate::default();
    dns_sec.keys_to_add = args.add_ds;
    dns_sec.keys_to_remove = args.del_ds;
    let mut extensions = DomainUpdateExtensionsArgs::default();
    extensions.dns_sec = Some(dns_sec);
    domain.extensions = Some(extensions);
    let d = client.domains_update(&domain).await?;
    println!("{}", d["name"].as_str().unwrap_or(""));
    Ok(())
}

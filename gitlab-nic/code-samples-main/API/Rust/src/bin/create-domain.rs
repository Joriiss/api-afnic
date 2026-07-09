use clap::Parser;
use afnic::{DomainsCreateArgs, DomainContactRole};

/// Create a domain
///
/// Example usage: create-domain -n ns1.example.net example.fr AB123 XXXXXXXXXXXX
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// Name of the domain to create
    name: String,
    /// Registrant ROID
    registrant: String,
    /// authInfo of the domain
    auth_info: String,
    /// Number of years to register the domain for
    #[arg(short, long)]
    years: Option<u32>,
    /// NS to use for this domain. May be repeated to use multiple
    /// name servers.
    #[arg(short, long)]
    ns: Vec<String>,
    /// Technical contact ROID. May be repeated. If this argument is
    /// not present the registrant is used as a technical contact.
    #[arg(short, long)]
    tech_contact: Vec<String>,
    /// Administrative contact ROID. May be repeated. If this argument
    /// is not present the registrant is used as an administrative
    /// contact.
    #[arg(short, long)]
    admin_contact: Vec<String>,
    /// Billing contact ROID. May be repeated.
    #[arg(short, long)]
    bill_contact: Vec<String>,
    /// DNSSEC key
    #[arg(short, long)]
    ds: Vec<afnic::DnsSec>
}

fn defaults_to<S: ToString>(default: &S, v: Vec<String>) -> Vec<String> {
    if v.is_empty() {
        vec![default.to_string()]
    } else {
        v
    }
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let mut domain = DomainsCreateArgs::new(args.name, args.auth_info);
    domain.duration_in_years =  args.years;
    domain.name_servers = args.ns;
    let tech_contact = defaults_to(&args.registrant, args.tech_contact);
    let admin_contact = defaults_to(&args.registrant, args.admin_contact);
    domain.registrant_client_id = Some(args.registrant);
    domain.contacts = [
        (tech_contact, DomainContactRole::Technical),
        (admin_contact, DomainContactRole::Administrative),
        (args.bill_contact, DomainContactRole::Billing)
    ].into_iter()
        .map(|(v, role)| v.into_iter().map(move |id| (id, role).into()))
        .flatten()
        .collect();
    domain.extensions = Some(
        afnic::DomainCreateExtensionsArgs {
            dns_sec: args.ds
        }
    );
    let d = client.domains_create(&domain).await?;
    println!("{}", d["name"].as_str().unwrap_or(""));
    Ok(())
}

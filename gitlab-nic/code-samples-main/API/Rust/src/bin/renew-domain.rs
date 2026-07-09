use clap::Parser;
use afnic::DomainsRenewArgs;

/// Renew a domain.
///
/// After succesfull renewal, the domain name along the new expiration
/// date is printed.
///
/// Example usage: renew-domain -c 2032-10-10 example.fr 3
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// Name of the domain to create
    name: String,
    /// Domain's current expiration date (YYY-MM-DD).
    #[arg(short, long, required = true)]
    current_expiration: String,
    /// Number of years to extend the domain's registration period
    #[arg(default_value = "1")]
    years: u32,
}


#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let renew = DomainsRenewArgs::new(
        args.name,
        args.current_expiration,
        args.years
    );
    let d = client.domains_renew(&renew).await?;
    println!(
        "{} {}",
        d["name"].as_str().unwrap_or(""),
        d["expirationDate"].as_str().unwrap_or("")
    );
    Ok(())
}

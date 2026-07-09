use std::sync::Arc;
use clap::Parser;

/// Program to list all the domains associated with a given host
#[derive(Debug, Parser)]
#[command(author, version, about)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// All the domains that rely on that host will be listed
    host_name: String,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = Arc::new(
        afnic::client_for_cli(args.auth_file.as_deref())?
    );

    let args = Args::parse();
    let mut domains = client.domains_associated_to_host(&args.host_name).await;
    while let Some(d) = domains.next().await.transpose()? {
        println!(
            "{:40} {}",
            d["name"].as_str().unwrap_or(""),
            d["registrarSponsorName"].as_str().unwrap_or(""),
        )
    }
    Ok(())
}

use std::sync::Arc;
use clap::Parser;

/// Program to list all the hosts of a registrar.
#[derive(Debug, Parser)]
#[command(author, version, about)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
}



#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = Arc::new(
        afnic::client_for_cli(args.auth_file.as_deref())?
    );

    let args = afnic::HostsArgs {
        sort_attribute: Some(afnic::HostsSortAttribute::Name),
        sort_direction: Some(afnic::SortDirection::Asc),
        .. afnic::HostsArgs::default()
    };
    let mut iter = client.hosts_iter(args).await;
    while let Some(c) = iter.next().await.transpose()? {
        println!(
            "{:40} {:5} {}",
            c["name"].as_str().unwrap_or(""),
            c["numberOfAssociatedDomains"].as_i64().unwrap_or(0),
            c["ipAddresses"],
        )
    }
    Ok(())
}

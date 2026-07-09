use clap::Parser;
use std::sync::Arc;

/// List registrar's contacts
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

    let args = afnic::ContactsArgs {
        sort_attribute: Some(afnic::ContactsSortAttribute::Name),
        sort_direction: Some(afnic::SortDirection::Asc),
        .. afnic::ContactsArgs::default()
    };
    let mut iter = client.contacts_iter(args).await;
    while let Some(c) = iter.next().await.transpose()? {
        println!(
            "{}\t{}\t{}\t{}\t{}\t{}",
            c["clientId"].as_str().unwrap_or(""),
            c["name"].as_str().unwrap_or(""),
            c["organization"].as_str().unwrap_or(""),
            c["telephoneNumber"].as_str().unwrap_or(""),
            c["email"].as_str().unwrap_or(""),
            c["numberOfAssociatedDomains"].as_i64().unwrap_or(0)
        )
    }
    Ok(())
}

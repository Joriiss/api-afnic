use std::sync::Arc;
use clap::Parser;

/// Program to list all the domains of a registrar.
#[derive(Debug, Parser)]
#[command(author, version, about)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// String to search
    search: Option<String>,
    #[arg(short, long, value_enum)]
    search_field: Option<afnic::DomainsSearchFieldEnum>,
    /// The type of match to use
    #[arg(long, value_enum)]
    search_type: Option<afnic::StringSearchTypeEnum>
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = Arc::new(
        afnic::client_for_cli(args.auth_file.as_deref())?
    );
    let args = afnic::DomainsArgs {
        research: args.search,
        domain_search_field: args.search_field,
        string_search_type: args.search_type,
        sort_attribute: Some(afnic::SortAttribute::Name),
        sort_direction: Some(afnic::SortDirection::Asc),
        .. afnic::DomainsArgs::default()
    };
    let mut domains = client.query_domains_iter(args).await;
    while let Some(i) = domains.next().await.transpose()? {
        let name = &i["name"];
        if let Some(s) = name.as_str() {
            println!("{}", s);
        } else {
            eprintln!("Warning: unexpected domain name: {}", name);
        }
    }
    Ok(())
}

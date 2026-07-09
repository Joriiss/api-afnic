use clap::Parser;

/// Get detailed information about a domain
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// Names of domain to get information about
    #[arg(required = true)]
    names: Vec<String>,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let mut result = Ok(());
    for name in args.names {
        match client.domains_by_name(&name).await {
            Ok(info) => println!("{}", &info),
            Err(e) => {
                let e: afnic::ApplicationError = e.into();
                eprintln!("Error: failed for {}: {}", &name, &e);
                result = Err("Some operation failed".into());
            }
        }
    }
    result
}

use clap::Parser;

/// Get information about existing authorization code requests
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// ROID of authorization code requests
    #[arg(required = true)]
    roid: Vec<String>,
}


#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    for roid in args.roid {
        let d = client.registrar_authorization_code(roid).await?;
        println!(
            "{:14} {:24} {:10} {:24} {}",
            d["repositoryObjectId"].as_str().unwrap_or(""),
            d["domainName"].as_str().unwrap_or(""),
            d["registrantClientId"].as_str().unwrap_or(""),
            d["status"].as_str().unwrap_or(""),
            d["code"].as_str().unwrap_or("")
        );
    }
    Ok(())
}

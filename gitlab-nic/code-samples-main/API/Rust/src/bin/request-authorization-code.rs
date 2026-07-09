use clap::Parser;

/// Request an authorization code
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    name: String,
    registrant: String,
    justification: String,
}


#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let d = client.registrar_authorization_code_request(
        args.name,
        args.registrant,
        args.justification
    ).await?;
    println!("{}", d["repositoryObjectId"].as_str().unwrap_or(""));
    Ok(())
}

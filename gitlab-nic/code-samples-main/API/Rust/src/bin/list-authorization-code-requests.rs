use std::sync::Arc;
use clap::Parser;

/// List existing auhorization code requests
#[derive(Debug, Parser)]
#[command(author, version, about)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    status: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = Arc::new(
        afnic::client_for_cli(args.auth_file.as_deref())?
    );
    let api_args = afnic::AuthorizationCodeRequestsArgs {
        status: args.status,
        .. Default::default()
    };

    let mut iter = client.registrar_authorization_code_requests_iter(api_args).await;
    while let Some(r) = iter.next().await.transpose()? {
        println!(
            "{}\t{}\t{}\t{}\t{}\t{}",
            r["repositoryObjectId"].as_str().unwrap_or(""),
            r["registrantClientId"].as_str().unwrap_or(""),
            r["status"].as_str().unwrap_or(""),
            r["code"].as_str().unwrap_or(""),
            r["codeExpirationDate"].as_str().unwrap_or(""),
            r["domainName"].as_str().unwrap_or(""),
        );
    }
    Ok(())
}

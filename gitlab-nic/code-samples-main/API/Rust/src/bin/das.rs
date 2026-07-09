use clap::Parser;

/// Check the availability of domain names
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// Names of domain to check
    #[arg(required = true)]
    names: Vec<String>,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;

    let check_result = client.domains_check(args.names.into_iter()).await?;
    let empty = vec![];
    let frnic = check_result["extensions"]["frnic"]["response"].as_array()
        .unwrap_or(&empty);
    let response = check_result["response"].as_array()
        .unwrap_or(&empty);
    for availability in response {
        let name = availability["name"].as_str().unwrap_or("");
        let available = if availability["available"].as_bool() == Some(true) {
            "available"
        } else {
            "NOT available"
        };
        let reason = match frnic.into_iter().find(|o| o["name"] == availability["name"]) {
            None => String::new(),
            Some(ext) => {
                let reason = ext["reason"].as_str();
                if ext["forbidden"].as_bool().unwrap_or(false) {
                    format!(" (forbidden word {})", reason.unwrap_or_default())
                } else if ext["reserved"].as_bool().unwrap_or(false) {
                    format!(" (special handling {})", reason.unwrap_or_default())
                } else if let Some(reason) = reason {
                    format!(" ({})", reason)
                } else {
                    String::new()
                }
            }
        };
        println!("{}: {}{}", name, available, reason);
    }
    Ok(())
}

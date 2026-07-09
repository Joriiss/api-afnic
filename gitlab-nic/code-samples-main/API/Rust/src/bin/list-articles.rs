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
     /// Document type to list
    r#type: afnic::ArticlesTypeEnum,
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = Arc::new(
        afnic::client_for_cli(args.auth_file.as_deref())?
    );

    let args = afnic::ArticlesArgs::new(args.r#type, "fr_FR".into());
    let mut articles = client.articles_iter(args).await;
    while let Some(a) = articles.next().await.transpose()? {
        let meta = &a["fileMetadataShortDto"];
        println!(
            "{} {} {:20} {} {}",
            a["repositoryObjectId"].as_str().unwrap_or(""),
            meta["uuid"].as_str().unwrap_or(""),
            meta["fileName"].as_str().unwrap_or(""),
            meta["title"].as_str().unwrap_or(""),
            meta["description"].as_str().unwrap_or(""),
        );
    }
    Ok(())
}

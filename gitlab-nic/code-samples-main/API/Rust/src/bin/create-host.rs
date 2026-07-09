use clap::Parser;

/// Create a host object.
///
/// Example usage
/// =============
///
///     $ create-host ns1.example.net
///     $ create-host ns1.example.fr 192.0.2.3 2001:db8::0123:4567
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    name: String,
    ip_addresses: Vec<afnic::IpAddress>
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let host = afnic::HostsCreateArgs {
        name: args.name,
        ip_addresses: args.ip_addresses,
        .. afnic::HostsCreateArgs::default()
    };
    let d = client.hosts_create(&host).await?;
    println!("{}", d["name"].as_str().unwrap_or(""));
    Ok(())
}

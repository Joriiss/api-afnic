use clap::Parser;

use afnic::{HostEppStatus, IpAddress};

/// Update a host object.
///
/// Example usage
/// =============
///
///     $ update-host ns1.example.net --new_name ns2.example.org
///     $ update-host ns1.example.fr --del-ip 192.0.2.3 --add-ip 2001:db8::8abc:def0
#[derive(Debug, Parser)]
#[command(author, version, about, verbatim_doc_comment)]
struct Args {
    /// Path to authentication configuration file. Defaults to
    /// $HOME/.afnic-api. Field to search the string in.
    #[arg(short = 'C', long)]
    auth_file: Option<std::path::PathBuf>,
    /// The fully qualified name of the host object
    name: String,
    /// Name to be used in order to replace the current host name
    #[arg(short, long)]
    new_name: Option<String>,
    /// new IP address to be associated to the host
    #[arg(short, long)]
    add_ip: Vec<IpAddress>,
    /// IP addresse to be removed as association with the host
    #[arg(short, long)]
    del_ip: Vec<IpAddress>,
    /// EPP status to be added to the host
    #[arg(long)]
    pub add_status: Vec<HostEppStatus>,
    /// EPP status to be removed from the host
    #[arg(long)]
    pub del_status: Vec<HostEppStatus>
}

#[tokio::main]
async fn main() -> Result<(), afnic::ApplicationError> {
    let args = Args::parse();
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;
    let host = afnic::HostsUpdateArgs {
        name: args.name,
        new_name: args.new_name,
        add_ip_addresses: args.add_ip,
        remove_ip_addresses: args.del_ip,
        add_epp_statuses: args.add_status,
        remove_epp_statuses: args.del_status,
        .. afnic::HostsUpdateArgs::default()
    };
    let d = client.hosts_update(&host).await?;
    println!("{}", d["name"].as_str().unwrap_or(""));
    Ok(())
}

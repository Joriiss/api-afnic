use clap::Parser;
use serde_json::json;

/// Program to create a contact
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
    let client = afnic::client_for_cli(args.auth_file.as_deref())?;

    let my_contact = json!({
        "email": "foobar@example.com",
        "localizedPostalInfo": {
            "contactName": "Directeur",
            "organizationName": "FooBar",
            "postalAddress": {
                "cityName": "Paris",
                "countryCode": "FO",
                "firstStreet": "1, rue",
                "postalCode": "12345"
            }
        },
        "telephoneIdentificationCode": "33",
        "telephoneNumber": "+33.12345678",
        "extensions": {
            "frnic": {
                "eligibilityVerified": true,
                "reachable":  {
                    "reachable": true,
                    "medium": "VOICE"
                },
                "moral": {
                    "legalStatus": "COMPANY",
                    "sirenSiret": "1234"
                }
            }
        }
    });
    let c = client.contacts_create(&my_contact).await?;
    println!("{}", c["clientId"].as_str().unwrap_or_default());
    Ok(())
}

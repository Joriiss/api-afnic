use std::sync::Arc;
use afnic::DomainsArgs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let login = std::env::var("AFNIC_LOGIN")
        .expect("Environment variable AFNIC_LOGIN must be set");
    let password = std::env::var("AFNIC_PASSWORD")
        .expect("Environment variable AFNIC_PASSWORD must be set");
    let client = Arc::new(
        afnic::Client::new(afnic::Registry::FrSandbox, login, password)
    );

    dbg!(client.domains_check(&["nexistepas.fr", "nic.fr"]).await?);

    let domains = dbg!(client.query_domains(&DomainsArgs::default()).await?);

    for content in domains["content"].as_array() {
        for i in content.iter().take(2) {
            for name in i["name"].as_str() {
                dbg!(client.domains_by_name(name).await?);
            }
        }
    }

    let mut iter = Arc::clone(&client).query_domains_iter(DomainsArgs::default()).await;

    while let Some(i) = iter.next().await.transpose()? {
        for name in i["name"].as_str() {
            dbg!(client.domains_by_name(name).await?);
        }
    }

    Ok(())
}

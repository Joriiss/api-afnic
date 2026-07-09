use std::fmt::Debug;
use std::sync::Arc;

use reqwest::Url;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{Client, Result, response_error_for_status};

/// A `PageIter<A>` is used to iterate over the entries of a pageable
/// API results. It requests the API endpoint page by page to deliver
/// each entry in turn.
///
/// Example
/// =======
///
/// ```no_compile
/// use afnic::{Client, Registry};
/// use afnic::pager::PageIter;
/// use std::sync::Arc;
/// let client = Arc::new(
///     Client::new(Registry::FrSandbox, "login", "password")
/// );
/// let iter = PageIter::new(
///     Arc::clone(&client),
///     (),
///     "https://api.sandbox.nic.fr/v1/domains".parse().unwrap()
/// );
///```
pub struct PageIter<A: Clone + Debug + Serialize> {
    client: Arc<Client>,
    url: Url,
    args: PageArgs<A>,
    state: Option<PageIterState>
}

#[derive(Debug)]
struct PageIterState {
    iter: std::vec::IntoIter<Value>,
    page_size: u64,
    total_elements: u64
}

impl<A: Clone + Debug + Serialize> PageIter<A> {
    pub fn new(client: Arc<Client>, args: A, url: Url) -> Self {
        Self {
            client,
            url,
            args: PageArgs { args, page: 0 },
            state: None
        }
    }

    pub async fn next(&mut self) -> Option<Result<Value>> {
        fn fused() -> Option<PageIterState> {
            Some(PageIterState {
                iter: vec![].into_iter(),
                page_size: 1,
                total_elements: 1
            })
        }
        if self.state.is_none() {
            match self.get_page().await {
                Err(e) => {
                    self.state = fused();
                    return Some(Err(e));
                }
                Ok(v) => match serde_json::from_value::<PageResponse>(v) {
                    Err(e) => {
                        self.state = fused();
                        return Some(Err(e.into()));
                    }
                    Ok(PageResponse { content, total_elements }) => {
                        let page_size = content.len().try_into().unwrap();
                        let iter = content.into_iter();
                        self.state = Some(PageIterState {
                            iter, page_size, total_elements
                        });
                    }
                }
            }
        }
        {
            let state = self.state.as_mut().unwrap();
            if let Some(v) = state.iter.next() {
                return Some(Ok(v));
            }
            self.args.page += 1;
            if self.args.page * state.page_size >= state.total_elements {
                // we have fetched all available contents
                return None;
            }
        }
        match self.get_page().await {
            Err(e) => {
                self.state = fused();
                return Some(Err(e.into()));
            }
            Ok(v) => match serde_json::from_value::<PageResponse>(v) {
                Err(e) => {
                    self.state = fused();
                    return Some(Err(e.into()));
                }
                Ok(PageResponse { content, total_elements }) => {
                    let state = self.state.as_mut().unwrap();
                    if let Ok(len) = u64::try_from(content.len()) {
                        assert!(len <= state.page_size);
                    }
                    state.total_elements = total_elements;
                    state.iter = content.into_iter();
                    return state.iter.next().map(Ok)
                }
            }
        }
    }

    async fn get_page(&self) -> Result<Value> {
        let (_, res) = response_error_for_status(
            self.client.get(self.url.clone()).await?
                .query(&self.args)
                .send().await?
        )
            .await?;
        Ok(res)
    }
}

/// This struct is used to add the paging information to paged
/// requests. Note that the `page` number starts at `0`.
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct PageArgs<A: Clone + Debug + Serialize> {
    #[serde(flatten)]
    args: A,
    page: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PageResponse {
    content: Vec<Value>,
    total_elements: u64
}


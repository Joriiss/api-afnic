use clap::ValueEnum;
use serde::Serialize;

use super::SortDirection;
use crate::pager::PageIter;

pub type ArticlesIter = PageIter<ArticlesArgs>;

/// Arguments to the `Client::articles_iter()` method
#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArticlesArgs {
    pub r#type: ArticlesTypeEnum,
    pub only_personal_article: Option<bool>,
    pub locale: String,
    pub page_size: Option<u64>,
    pub sort_attribute: Option<ArticlesSortAttribute>,
    pub sort_direction: Option<SortDirection>,
}

impl ArticlesArgs {
    pub fn new(r#type: ArticlesTypeEnum, locale: String) -> Self {
        Self {
            r#type,
            locale,
            only_personal_article: None,
            page_size: None,
            sort_attribute: None,
            sort_direction: None
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ArticlesTypeEnum {
    LegalDocuments,
    TechnicalDocuments,
    CommercialDocuments,
    MyDocuments,
}

#[derive(Clone, Copy, Debug, Serialize, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ArticlesSortAttribute {
    CreationDate,
    UpdateDate
}

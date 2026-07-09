use clap::{Error, ValueEnum};
use serde::Serialize;

#[derive(Clone, Debug, Serialize, Hash, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct DnsSec {
    pub key_tag: u32,
    pub algorithm: DnsSecAlgorithm,
    pub digest_type: DnsSecDigestType,
    pub digest: String
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DnsSecAlgorithm {
    Rsamd5, Dh, Dsa, Ecc, Rsasha1, DsaNsec3Sha1, Rsasha1Nsec3Sha1,
    Rsasha256, Rsasha512, EccGost, Ecdsap256sha256, Ecdsap384sha384,
    Ed25519, Ed448, Indirect, Privatedns, Privateoid
}

pub struct UnsupportedDnsSecAlgorithmError(u8);

impl TryFrom<u8> for DnsSecAlgorithm {
    type Error = UnsupportedDnsSecAlgorithmError;
    /// Uses [IANA's
    /// registry](https://www.iana.org/assignments/dns-sec-alg-numbers/dns-sec-alg-numbers.xhtml#dns-sec-alg-numbers-1)
    fn try_from(n: u8) -> Result<Self, Self::Error> {
        match n {
            1 => Ok(DnsSecAlgorithm::Rsamd5),
            2 => Ok(DnsSecAlgorithm::Dh),
            3 => Ok(DnsSecAlgorithm::Dsa),
            // https://www.rfc-editor.org/rfc/rfc4034#appendix-A.1
            4 => Ok(DnsSecAlgorithm::Ecc),
            5 => Ok(DnsSecAlgorithm::Rsasha1),
            6 => Ok(DnsSecAlgorithm::DsaNsec3Sha1),
            7 => Ok(DnsSecAlgorithm::Rsasha1Nsec3Sha1),
            8 => Ok(DnsSecAlgorithm::Rsasha256),
            10 => Ok(DnsSecAlgorithm::Rsasha512),
            12 => Ok(DnsSecAlgorithm::EccGost),
            13 => Ok(DnsSecAlgorithm::Ecdsap256sha256),
            14 => Ok(DnsSecAlgorithm::Ecdsap384sha384),
            15 => Ok(DnsSecAlgorithm::Ed25519),
            16 => Ok(DnsSecAlgorithm::Ed448),
            252 => Ok(DnsSecAlgorithm::Indirect),
            253 => Ok(DnsSecAlgorithm::Privatedns),
            254 => Ok(DnsSecAlgorithm::Privateoid),
            _ => Err(UnsupportedDnsSecAlgorithmError(n))
        }
    }
}

#[derive(Clone, Copy, Debug, Serialize, Hash, PartialEq, Eq, PartialOrd, Ord, ValueEnum)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DnsSecDigestType {
    Sha1, Sha256, Gost, Sha384
}

pub struct UnsupportedDnsSecDigestTypeError(u8);

impl TryFrom<u8> for DnsSecDigestType {
    type Error = UnsupportedDnsSecDigestTypeError;
    /// Uses [IANA's
    /// registry](https://www.iana.org/assignments/ds-rr-types/ds-rr-types.xhtml#ds-rr-types-1)
    fn try_from(n: u8) -> Result<Self, Self::Error> {
        match n {
            1 => Ok(DnsSecDigestType::Sha1),
            2 => Ok(DnsSecDigestType::Sha256),
            3 => Ok(DnsSecDigestType::Gost),
            4 => Ok(DnsSecDigestType::Sha384),
            _ => Err(UnsupportedDnsSecDigestTypeError(n))
        }
    }
}

impl clap::builder::ValueParserFactory for DnsSec {
    type Parser = DnsSecValueParser;
    fn value_parser() -> Self::Parser {
        DnsSecValueParser
    }
}

#[derive(Clone, Debug)]
pub struct DnsSecValueParser;

impl clap::builder::TypedValueParser for DnsSecValueParser {
    type Value = DnsSec;
    fn parse_ref(
        &self,
        _cmd: &clap::Command,
        _arg: Option<&clap::Arg>,
        value: &std::ffi::OsStr
    ) -> Result<Self::Value, Error> {
        use clap::error::ErrorKind;
        let value = value.to_str()
            .ok_or_else(|| Error::raw(
                ErrorKind::InvalidUtf8,
                "DnsSec argument contains invalid UTF-8.\n"
            ))?;
        fn err(s: &str) -> Result<(&str, &str, &str, &str), Error> {
            Err(Error::raw(
                ErrorKind::ValueValidation,
                format!("DnsSec argument is missing a {}.\n", s)
            ))
        }
        let mut iter = value.split_whitespace();
        let first_4 = (iter.next(), iter.next(), iter.next(), iter.next());
        let (key_tag, algorithm, digest_type, digest) =
            match first_4 {
                (Some(a), Some(b), Some(c), Some(d)) => (a, b, c, d),
                (None, _, _, _) => err("key tag")?,
                (_, None, _, _) => err("key algorithm")?,
                (_, _, None, _) => err("digest type")?,
                (_, _, _, None) => err("digest")?,
            };
        let key_tag = u32::from_str_radix(key_tag, 10)
            .map_err(|e| Error::raw(ErrorKind::ValueValidation, e))?;
        let algorithm = u8::from_str_radix(algorithm, 10).ok()
            .and_then(|n| DnsSecAlgorithm::try_from(n).ok())
            .map_or_else(|| DnsSecAlgorithm::from_str(algorithm, true), Ok)
            .map_err(|e| Error::raw(
                ErrorKind::ValueValidation,
                format!("Invalid DNSSEC algorithm: {}.\n", e)
            ))?;
        let digest_type = u8::from_str_radix(digest_type, 10).ok()
            .and_then(|n| DnsSecDigestType::try_from(n).ok())
            .map_or_else(|| DnsSecDigestType::from_str(digest_type, true), Ok)
            .map_err(|e| Error::raw(
                ErrorKind::ValueValidation,
                format!("Invalid DNSSEC digest type: {}.\n", e)
            ))?;
        let mut digest = String::from(digest);
        digest.extend(iter);
        Ok(DnsSec {
            key_tag, algorithm, digest_type, digest
        })
    }
}

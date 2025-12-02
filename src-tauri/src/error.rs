// src-tauri/src/error.rs
use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("Anyhow error: {0}")]
    Anyhow(#[from] anyhow::Error),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Authentication error: {0}")]
    Auth(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Network error: {0}")]
    Network(String),
}

// 实现 Serialize 以便将错误发送到前端
impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}


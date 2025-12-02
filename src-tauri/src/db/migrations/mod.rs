// src-tauri/src/db/migrations/mod.rs
use sqlx::migrate::Migrator;

// 定义迁移目录
pub static MIGRATOR: Migrator = sqlx::migrate!("./src/db/migrations");
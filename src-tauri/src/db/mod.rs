// src-tauri/src/db/mod.rs
pub mod models;
pub mod migrations;

use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use tauri::AppHandle;
use anyhow::Result;

pub struct Database;

impl Database {
    pub async fn init(_app_handle: &AppHandle) -> Result<SqlitePool> {
        // 使用项目根目录下的data目录
        let database_path = "../data/cultural_heritage.sqlite";
        let database_url = format!("sqlite:{}", database_path);
        
        println!("数据库路径: {}", database_path);
        println!("数据库URL: {}", database_url);
        
        // 创建数据库连接池
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .map_err(|e| anyhow::anyhow!("数据库连接失败: {}", e))?;
            
        // 运行迁移
        println!("开始数据库迁移...");
        match sqlx::migrate!("./src/db/migrations")
            .run(&pool)
            .await {
            Ok(_) => println!("数据库迁移成功"),
            Err(e) => eprintln!("数据库迁移失败: {}", e),
        }
            
        Ok(pool)
    }
}
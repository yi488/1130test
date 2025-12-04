// src-tauri/src/api/history.rs
use crate::db::models::ArtifactWithFavorite;
use crate::error::Result;
use crate::api::auth::validate_token;
use sqlx::{SqlitePool, Row};
use tauri::State;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct HistoryItem {
    pub id: i64,
    pub artifact: ArtifactWithFavorite,
    pub viewed_at: String,
}

/// 添加浏览历史
#[tauri::command]
pub async fn add_to_history(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, crate::api::auth::AuthState>,
    artifact_id: i64,
    token: String,
) -> Result<()> {
    // 验证token并获取用户ID
    let session = validate_token(&auth_state.sessions, &token)
        .ok_or_else(|| anyhow::anyhow!("用户未登录"))?;
    let user_id = session.user_id;
    
    // 检查是否已存在该记录（根据 UNIQUE(user_id, artifact_id) 约束）
    // 如果存在，更新 viewed_at 时间；如果不存在，插入新记录
    let query = r#"
        INSERT INTO browsing_history (user_id, artifact_id, viewed_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, artifact_id) 
        DO UPDATE SET viewed_at = CURRENT_TIMESTAMP
    "#;
    
    sqlx::query(query)
        .bind(user_id)
        .bind(artifact_id)
        .execute(&*pool)
        .await?;
    
    Ok(())
}

/// 获取浏览历史
#[tauri::command]
pub async fn get_browsing_history(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, crate::api::auth::AuthState>,
    token: String,
) -> Result<Vec<HistoryItem>> {
    // 验证token并获取用户ID
    let session = validate_token(&auth_state.sessions, &token)
        .ok_or_else(|| anyhow::anyhow!("用户未登录"))?;
    let user_id = session.user_id;
    
    let query = r#"
        SELECT 
            bh.id,
            bh.viewed_at,
            a.id as artifact_id,
            a.title,
            a.image_path,
            a.period,
            a.dynasty,
            a.location,
            a.description,
            a.detailed_description,
            a.material,
            a.dimensions,
            a.discovery_location,
            a.collection,
            a.category,
            a.created_at,
            a.updated_at,
            CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM browsing_history bh
        INNER JOIN artifacts a ON bh.artifact_id = a.id
        LEFT JOIN user_favorites uf ON a.id = uf.artifact_id AND uf.user_id = ?
        WHERE bh.user_id = ?
        ORDER BY bh.viewed_at DESC
    "#;
    
    let rows = sqlx::query(query)
        .bind(user_id)
        .bind(user_id)
        .fetch_all(&*pool)
        .await?;
    
    let history_items = rows.into_iter().map(|row| {
        Ok(HistoryItem {
            id: row.get("id"),
            artifact: ArtifactWithFavorite {
                id: row.get("artifact_id"),
                title: row.get("title"),
                image_path: row.get("image_path"),
                period: row.get("period"),
                dynasty: row.get("dynasty"),
                location: row.get("location"),
                description: row.get("description"),
                detailed_description: row.get("detailed_description"),
                material: row.get("material"),
                dimensions: row.get("dimensions"),
                discovery_location: row.get("discovery_location"),
                collection: row.get("collection"),
                category: row.get("category"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
                is_favorite: row.get("is_favorite"),
            },
            viewed_at: row.get::<chrono::DateTime<chrono::Utc>, _>("viewed_at").to_rfc3339(),
        })
    }).collect::<Result<Vec<HistoryItem>>>()?;
    
    Ok(history_items)
}

/// 清空浏览历史
#[tauri::command]
pub async fn clear_browsing_history(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, crate::api::auth::AuthState>,
    token: String,
) -> Result<()> {
    // 验证token并获取用户ID
    let session = validate_token(&auth_state.sessions, &token)
        .ok_or_else(|| anyhow::anyhow!("用户未登录"))?;
    let user_id = session.user_id;
    
    let query = "DELETE FROM browsing_history WHERE user_id = ?";
    
    sqlx::query(query)
        .bind(user_id)
        .execute(&*pool)
        .await?;
    
    Ok(())
}


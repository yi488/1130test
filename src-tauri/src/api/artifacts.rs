use crate::db::models::{Artifact, ArtifactWithFavorite};
use crate::error::Result;
use crate::api::auth::{validate_token, AuthState};
use serde::Deserialize;
use sqlx::{SqlitePool, Row};
use tauri::State;
use std::path::{Path, PathBuf};
use anyhow::anyhow;

// 验证图片文件是否存在
fn validate_image_path(image_path: &str) -> bool {
    let full_path = format!("../public/images/{}", image_path);
    Path::new(&full_path).exists()
}

// 获取默认图片路径
fn get_default_image_path() -> &'static str {
    "bronze_ding.jpg" // 使用一个确定存在的图片作为默认
}

/// 校验管理员身份（通过邮箱）
async fn ensure_admin(
    pool: &SqlitePool,
    auth_state: &AuthState,
    token: &str,
) -> Result<i64> {
    let session = validate_token(&auth_state.sessions, token)
        .ok_or_else(|| anyhow!("用户未登录"))?;
    let user_id = session.user_id;

    let row = sqlx::query("SELECT email FROM users WHERE id = ?")
        .bind(user_id)
        .fetch_one(pool)
        .await?;

    let email: String = row.get("email");
    if email != "yi@example.com" {
        return Err(anyhow!("无权限，需管理员账号").into());
    }

    Ok(user_id)
}

#[derive(Debug, Deserialize, Default)]
pub struct SearchParams {
    pub query: Option<String>,
    pub category: Option<String>,
    pub dynasty: Option<String>,
    pub favorites_only: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ArtifactInput {
    pub id: Option<i64>,
    pub title: String,
    pub image_path: String,
    pub period: String,
    pub dynasty: String,
    pub location: String,
    pub description: String,
    pub detailed_description: String,
    pub material: String,
    pub dimensions: String,
    pub discovery_location: String,
    pub collection: String,
    pub category: String,
}

#[tauri::command]
pub async fn get_artifacts(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, crate::api::auth::AuthState>,
    params: Option<SearchParams>,
    token: Option<String>,
) -> Result<Vec<ArtifactWithFavorite>> {
    let params = params.unwrap_or_default();
    
    // 获取用户ID，如果没有token则使用默认值1（临时解决方案）
    let user_id = if let Some(token_str) = token {
        if let Some(session) = validate_token(&auth_state.sessions, &token_str) {
            session.user_id
        } else {
            1 // 默认用户ID
        }
    } else {
        1 // 默认用户ID
    };

    println!("DEBUG: get_artifacts called with params: {:?}", params);
    println!("DEBUG: user_id: {}, favorites_only: {:?}", user_id, params.favorites_only);
    
    let mut query = "
        SELECT 
            a.id, a.title, a.image_path, a.period, a.dynasty, a.location,
            a.description, a.detailed_description, a.material, a.dimensions,
            a.discovery_location, a.collection, a.category, a.created_at, a.updated_at,
            CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM artifacts a
        LEFT JOIN user_favorites uf ON a.id = uf.artifact_id AND uf.user_id = ?
    ".to_string();
    
    let mut conditions = Vec::new();
    let mut bind_values: Vec<String> = Vec::new();
    
    if let Some(query_str) = &params.query {
        if !query_str.is_empty() {
            conditions.push("(a.title LIKE ? OR a.description LIKE ? OR a.detailed_description LIKE ?)");
            bind_values.push(format!("%{}%", query_str));
            bind_values.push(format!("%{}%", query_str));
            bind_values.push(format!("%{}%", query_str));
        }
    }
    
    if let Some(category) = &params.category {
        if category != "all" {
            conditions.push("a.category = ?");
            bind_values.push(category.clone());
        }
    }
    
    if let Some(dynasty) = &params.dynasty {
        if !dynasty.is_empty() {
            conditions.push("a.dynasty = ?");
            bind_values.push(dynasty.clone());
        }
    }
    
    if let Some(favorites_only) = params.favorites_only {
        if favorites_only {
            println!("DEBUG: Adding favorites filter condition");
            conditions.push("uf.id IS NOT NULL");
        }
    } else {
        println!("DEBUG: favorites_only is None or false");
    }
    
    if !conditions.is_empty() {
        query.push_str(" WHERE ");
        query.push_str(&conditions.join(" AND "));
    }
    
    query.push_str(" ORDER BY a.created_at DESC");
    
    println!("DEBUG: Final SQL query: {}", query);
    println!("DEBUG: Conditions: {:?}", conditions);
    
    // 构建动态查询
    let mut sql_query = sqlx::query(&query).bind(user_id);
    
    for value in bind_values {
        sql_query = sql_query.bind(value);
    }
    
    let rows = sql_query.fetch_all(&*pool).await?;
    
    // 手动映射结果到结构体
    let artifacts = rows.into_iter().map(|row| {
        let mut image_path: String = row.get("image_path");
        
        // 验证图片文件是否存在，如果不存在则使用默认图片
        if !validate_image_path(&image_path) {
            println!("警告: 图片文件不存在: {}, 使用默认图片", image_path);
            image_path = get_default_image_path().to_string();
        }
        
        Ok(ArtifactWithFavorite {
            id: row.get("id"),
            title: row.get("title"),
            image_path,
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
        })
    }).collect::<Result<Vec<ArtifactWithFavorite>>>()?;
    
    Ok(artifacts)
}

#[tauri::command]
pub async fn get_artifact_by_id(
    pool: State<'_, SqlitePool>,
    id: i64,
) -> Result<Option<ArtifactWithFavorite>> {
    // TODO: Add user_id from session
    let user_id = 1;
    
    let query = r#"
        SELECT 
            a.id, a.title, a.image_path, a.period, a.dynasty, a.location,
            a.description, a.detailed_description, a.material, a.dimensions,
            a.discovery_location, a.collection, a.category, a.created_at, a.updated_at,
            CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM artifacts a
        LEFT JOIN user_favorites uf ON a.id = uf.artifact_id AND uf.user_id = ?
        WHERE a.id = ?
    "#;
    
    let row = sqlx::query(query)
        .bind(user_id)
        .bind(id)
        .fetch_optional(&*pool)
        .await?;
    
    let artifact = if let Some(row) = row {
        Some(ArtifactWithFavorite {
            id: row.get("id"),
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
        })
    } else {
        None
    };
    
    Ok(artifact)
}

#[tauri::command]
pub async fn toggle_favorite(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, crate::api::auth::AuthState>,
    artifact_id: i64,
    token: String,
) -> Result<bool> {
    // 验证token并获取用户ID
    let session = validate_token(&auth_state.sessions, &token)
        .ok_or_else(|| anyhow::anyhow!("用户未登录"))?;
    let user_id = session.user_id;
    
    // Check if already favorited
    let query = "SELECT id FROM user_favorites WHERE user_id = ? AND artifact_id = ?";
    let existing = sqlx::query(query)
        .bind(user_id)
        .bind(artifact_id)
        .fetch_optional(&*pool)
        .await?;
    
    if existing.is_some() {
        // Remove from favorites
        sqlx::query("DELETE FROM user_favorites WHERE user_id = ? AND artifact_id = ?")
            .bind(user_id)
            .bind(artifact_id)
            .execute(&*pool)
            .await?;
        Ok(false)
    } else {
        // Add to favorites
        sqlx::query("INSERT INTO user_favorites (user_id, artifact_id) VALUES (?, ?)")
            .bind(user_id)
            .bind(artifact_id)
            .execute(&*pool)
            .await?;
        Ok(true)
    }
}

// 创建文物
#[tauri::command]
pub async fn create_artifact(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    artifact: ArtifactInput,
    token: String,
) -> Result<ArtifactWithFavorite> {
    // 仅管理员可操作
    ensure_admin(&pool, &auth_state, &token).await?;

    let insert_query = r#"
        INSERT INTO artifacts (
            title, image_path, period, dynasty, location, description,
            detailed_description, material, dimensions, discovery_location,
            collection, category
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    "#;
    
    // 先插入数据
    let result = sqlx::query(insert_query)
        .bind(&artifact.title)
        .bind(&artifact.image_path)
        .bind(&artifact.period)
        .bind(&artifact.dynasty)
        .bind(&artifact.location)
        .bind(&artifact.description)
        .bind(&artifact.detailed_description)
        .bind(&artifact.material)
        .bind(&artifact.dimensions)
        .bind(&artifact.discovery_location)
        .bind(&artifact.collection)
        .bind(&artifact.category)
        .execute(&*pool)
        .await?;
    
    // 获取最后插入的ID
    let id = result.last_insert_rowid();
    
    // 返回新创建的文物（包含收藏状态）
    let user_id = 1; // TODO: 从会话获取
    let query = r#"
        SELECT 
            a.id, a.title, a.image_path, a.period, a.dynasty, a.location,
            a.description, a.detailed_description, a.material, a.dimensions,
            a.discovery_location, a.collection, a.category, a.created_at, a.updated_at,
            CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
        FROM artifacts a
        LEFT JOIN user_favorites uf ON a.id = uf.artifact_id AND uf.user_id = ?
        WHERE a.id = ?
    "#;
    
    let row = sqlx::query(query)
        .bind(user_id)
        .bind(id)
        .fetch_one(&*pool)
        .await?;
    
    Ok(ArtifactWithFavorite {
        id: row.get("id"),
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
    })
}

// 更新文物
#[tauri::command]
pub async fn update_artifact(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    artifact: ArtifactInput,
    token: String,
) -> Result<ArtifactWithFavorite> {
    // 仅管理员可操作
    ensure_admin(&pool, &auth_state, &token).await?;

    let update_query = r#"
        UPDATE artifacts SET
            title = ?,
            image_path = ?,
            period = ?,
            dynasty = ?,
            location = ?,
            description = ?,
            detailed_description = ?,
            material = ?,
            dimensions = ?,
            discovery_location = ?,
            collection = ?,
            category = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    "#;

    let artifact_id = artifact.id.ok_or_else(|| anyhow!("缺少文物ID"))?;

    sqlx::query(update_query)
        .bind(&artifact.title)
        .bind(&artifact.image_path)
        .bind(&artifact.period)
        .bind(&artifact.dynasty)
        .bind(&artifact.location)
        .bind(&artifact.description)
        .bind(&artifact.detailed_description)
        .bind(&artifact.material)
        .bind(&artifact.dimensions)
        .bind(&artifact.discovery_location)
        .bind(&artifact.collection)
        .bind(&artifact.category)
        .bind(artifact_id)
        .execute(&*pool)
        .await?;

    let query = r#"
        SELECT 
            a.id, a.title, a.image_path, a.period, a.dynasty, a.location,
            a.description, a.detailed_description, a.material, a.dimensions,
            a.discovery_location, a.collection, a.category, a.created_at, a.updated_at,
            0 as is_favorite
        FROM artifacts a
        WHERE a.id = ?
    "#;

    let row = sqlx::query(query)
        .bind(artifact_id)
        .fetch_one(&*pool)
        .await?;

    Ok(ArtifactWithFavorite {
        id: row.get("id"),
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
    })
}

// 删除文物
#[tauri::command]
pub async fn delete_artifact(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    id: i64,
    token: String,
) -> Result<bool> {
    // 仅管理员可操作
    ensure_admin(&pool, &auth_state, &token).await?;

    sqlx::query("DELETE FROM artifacts WHERE id = ?")
        .bind(id)
        .execute(&*pool)
        .await?;

    Ok(true)
}
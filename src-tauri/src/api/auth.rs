// src-tauri/src/api/auth.rs
use anyhow;
use crate::db::models::User;
use crate::error::Result;
use serde::{Deserialize, Serialize};
use sqlx::{SqlitePool,Row};
use tauri::State;
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rand_core::OsRng;
use std::collections::HashMap;
use std::sync::Mutex;
use uuid::Uuid;

// 会话管理
#[derive(Debug, Clone)]
pub struct Session {
    pub user_id: i64,
    pub username: String,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

pub type Sessions = Mutex<HashMap<String, Session>>;

// 会话状态管理
#[derive(Debug, Default)]
pub struct AuthState {
    pub sessions: Sessions,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub email: String,
    pub password: String,
}

// 初始化认证状态
pub fn init_auth_state() -> AuthState {
    AuthState {
        sessions: Mutex::new(HashMap::new()),
    }
}

// 验证会话令牌
pub fn validate_token(sessions: &Sessions, token: &str) -> Option<Session> {
    let sessions_map = sessions.lock().ok()?;
    let session = sessions_map.get(token)?;
    
    // 检查会话是否过期
    if session.expires_at < chrono::Utc::now() {
        return None;
    }
    
    Some(session.clone())
}

// 创建新会话
fn create_session(sessions: &Sessions, user: &User) -> String {
    let token = Uuid::new_v4().to_string();
    let session = Session {
        user_id: user.id,
        username: user.username.clone(),
        expires_at: chrono::Utc::now() + chrono::Duration::days(7), // 7天有效期
    };
    
    let mut sessions_map = sessions.lock().unwrap();
    sessions_map.insert(token.clone(), session);
    
    token
}

// 删除会话
fn remove_session(sessions: &Sessions, token: &str) {
    let mut sessions_map = sessions.lock().unwrap();
    sessions_map.remove(token);
}

// 清理过期会话
fn cleanup_expired_sessions(sessions: &Sessions) {
    let now = chrono::Utc::now();
    let mut sessions_map = sessions.lock().unwrap();
    sessions_map.retain(|_, session| session.expires_at > now);
}

#[tauri::command]
pub async fn login(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    request: LoginRequest,
) -> Result<AuthResponse> {
    // 查询用户
    let query = "SELECT id, username, email, password_hash, created_at FROM users WHERE email = ?";
    let row = sqlx::query(query)
        .bind(&request.email)
        .fetch_optional(&*pool)
        .await?;

    let row = row.ok_or_else(|| anyhow::anyhow!("用户不存在"))?;

    let user = User {
        id: row.get("id"),
        username: row.get("username"),
        email: row.get("email"),
        password_hash: row.get("password_hash"),
        created_at: row.get("created_at"),
    };

    // 验证密码
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|_| anyhow::anyhow!("密码验证失败"))?;

    Argon2::default()
        .verify_password(request.password.as_bytes(), &parsed_hash)
        .map_err(|_| anyhow::anyhow!("密码错误"))?;

    // 创建会话
    let token = create_session(&auth_state.sessions, &user);
    
    // 清理过期会话
    cleanup_expired_sessions(&auth_state.sessions);

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn register(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    request: RegisterRequest,
) -> Result<AuthResponse> {
    // 检查用户名是否已存在
    let query = "SELECT id FROM users WHERE username = ? OR email = ?";
    let existing_user = sqlx::query(query)
        .bind(&request.username)
        .bind(&request.email)
        .fetch_optional(&*pool)
        .await?;

    if existing_user.is_some() {
        return Err(anyhow::anyhow!("用户名或邮箱已存在").into());
    }

    // 验证密码强度
    if request.password.len() < 6 {
        return Err(anyhow::anyhow!("密码长度至少6位").into());
    }

    // 哈希密码
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(request.password.as_bytes(), &salt)
        .map_err(|_| anyhow::anyhow!("密码加密失败"))?
        .to_string();

    // 插入新用户
    let query = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
    let result = sqlx::query(query)
        .bind(&request.username)
        .bind(&request.email)
        .bind(&password_hash)
        .execute(&*pool)
        .await?;

    let user_id = result.last_insert_rowid();

    // 获取新创建的用户
    let query = "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?";
    let row = sqlx::query(query)
        .bind(user_id)
        .fetch_one(&*pool)
        .await?;

    let user = User {
        id: row.get("id"),
        username: row.get("username"),
        email: row.get("email"),
        password_hash: row.get("password_hash"),
        created_at: row.get("created_at"),
    };

    // 创建会话
    let token = create_session(&auth_state.sessions, &user);
    
    // 清理过期会话
    cleanup_expired_sessions(&auth_state.sessions);

    Ok(AuthResponse { user, token })
}

#[tauri::command]
pub async fn get_current_user(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    token: String,
) -> Result<Option<User>> {
    // 验证会话令牌
    let session = validate_token(&auth_state.sessions, &token);
    
    if let Some(session) = session {
        // 从数据库获取最新的用户信息
        let query = "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?";
        let row = sqlx::query(query)
            .bind(session.user_id)
            .fetch_optional(&*pool)
            .await?;

        if let Some(row) = row {
            let user = User {
                id: row.get("id"),
                username: row.get("username"),
                email: row.get("email"),
                password_hash: row.get("password_hash"),
                created_at: row.get("created_at"),
            };
            return Ok(Some(user));
        }
    }

    Ok(None)
}

#[tauri::command]
pub async fn logout(
    auth_state: State<'_, AuthState>,
    token: String,
) -> Result<bool> {
    remove_session(&auth_state.sessions, &token);
    Ok(true)
}

#[tauri::command]
pub async fn update_profile(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    token: String,
    username: Option<String>,
    email: Option<String>,
) -> Result<User> {
    // 验证会话
    let session = validate_token(&auth_state.sessions, &token)
        .ok_or_else(|| anyhow::anyhow!("会话无效或已过期"))?;

    let mut updates = Vec::new();
    let mut params: Vec<String> = Vec::new();

    if let Some(username) = username {
        // 检查用户名是否已被其他用户使用
        let check_query = "SELECT id FROM users WHERE username = ? AND id != ?";
        let existing = sqlx::query(check_query)
            .bind(&username)
            .bind(session.user_id)
            .fetch_optional(&*pool)
            .await?;
        
        if existing.is_some() {
            return Err(anyhow::anyhow!("用户名已被使用").into());
        }
        
        updates.push("username = ?");
        params.push(username);
    }

    if let Some(email) = email {
        // 检查邮箱是否已被其他用户使用
        let check_query = "SELECT id FROM users WHERE email = ? AND id != ?";
        let existing = sqlx::query(check_query)
            .bind(&email)
            .bind(session.user_id)
            .fetch_optional(&*pool)
            .await?;
        
        if existing.is_some() {
            return Err(anyhow::anyhow!("邮箱已被使用").into());
        }
        
        updates.push("email = ?");
        params.push(email);
    }

    if updates.is_empty() {
        return Err(anyhow::anyhow!("没有提供更新字段").into());
    }

    let query = format!("UPDATE users SET {} WHERE id = ?", updates.join(", "));
    
    let mut sql_query = sqlx::query(&query);
    for param in &params {
        sql_query = sql_query.bind(param);
    }
    sql_query = sql_query.bind(session.user_id);

    sql_query.execute(&*pool).await?;

    // 获取更新后的用户信息
    let query = "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?";
    let row = sqlx::query(query)
        .bind(session.user_id)
        .fetch_one(&*pool)
        .await?;

    let user = User {
        id: row.get("id"),
        username: row.get("username"),
        email: row.get("email"),
        password_hash: row.get("password_hash"),
        created_at: row.get("created_at"),
    };

    Ok(user)
}

// 验证密码强度
#[tauri::command]
pub async fn validate_password_strength(password: String) -> Result<bool> {
    if password.len() < 6 {
        return Err(anyhow::anyhow!("密码长度至少6位").into());
    }
    
    // 可以添加更多密码强度规则
    let has_letter = password.chars().any(|c| c.is_alphabetic());
    let has_digit = password.chars().any(|c| c.is_numeric());
    
    if !has_letter || !has_digit {
        return Err(anyhow::anyhow!("密码应包含字母和数字").into());
    }
    
    Ok(true)
}
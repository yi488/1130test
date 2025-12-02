use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 
#[derive(Debug, Serialize, Deserialize)]
pub struct NewArtifact {
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

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Artifact {
    pub id: i64,
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
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct UserFavorite {
    pub id: i64,
    pub user_id: i64,
    pub artifact_id: i64,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArtifactWithFavorite {
    pub id: i64,
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
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub is_favorite: bool,
}
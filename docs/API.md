# API 文档

## 🔌 接口概览

### 文物管理 API

#### 获取文物列表
```rust
#[tauri::command]
pub async fn get_artifacts(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    params: Option<SearchParams>,
    token: Option<String>,
) -> Result<Vec<ArtifactWithFavorite>>
```

**参数:**
- `params`: 搜索参数
  - `query`: 搜索关键词
  - `category`: 文物分类
  - `dynasty`: 朝代筛选
  - `favorites_only`: 仅显示收藏

**返回:**
```json
[
  {
    "id": 1,
    "title": "青铜饕餮纹方鼎",
    "image_path": "bronze_ding.jpg",
    "period": "公元前13-11世纪",
    "dynasty": "商代晚期",
    "location": "河南安阳",
    "description": "商代晚期青铜礼器...",
    "detailed_description": "此鼎为商代晚期青铜礼器...",
    "material": "青铜",
    "dimensions": "高35.6cm，口径28.5cm",
    "discovery_location": "河南省安阳市殷墟",
    "collection": "中国国家博物馆",
    "category": "bronze",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00",
    "is_favorite": false
  }
]
```

#### 获取文物详情
```rust
#[tauri::command]
pub async fn get_artifact_by_id(
    pool: State<'_, SqlitePool>,
    id: i64,
) -> Result<Artifact>
```

#### 收藏管理
```rust
#[tauri::command]
pub async fn toggle_favorite(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    artifact_id: i64,
    token: String,
) -> Result<bool>
```

### 用户认证 API

#### 用户登录
```rust
#[tauri::command]
pub async fn login(
    auth_state: State<'_, AuthState>,
    username: String,
    password: String,
) -> Result<Session>
```

#### 用户注册
```rust
#[tauri::command]
pub async fn register(
    pool: State<'_, SqlitePool>,
    auth_state: State<'_, AuthState>,
    username: String,
    password: String,
) -> Result<Session>
```

### 数据模型

#### Artifact 结构
```rust
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
    pub created_at: String,
    pub updated_at: String,
}
```

#### SearchParams 结构
```rust
pub struct SearchParams {
    pub query: Option<String>,        // 搜索关键词
    pub category: Option<String>,     // 分类筛选
    pub dynasty: Option<String>,      // 朝代筛选
    pub favorites_only: Option<bool>,  // 仅显示收藏
}
```

## 🗄️ 数据库表结构

### artifacts 表
```sql
CREATE TABLE artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_path TEXT NOT NULL,
    period TEXT NOT NULL,
    dynasty TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    material TEXT NOT NULL,
    dimensions TEXT NOT NULL,
    discovery_location TEXT NOT NULL,
    collection TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### users 表
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### user_favorites 表
```sql
CREATE TABLE user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artifact_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (artifact_id) REFERENCES artifacts(id),
    UNIQUE(user_id, artifact_id)
);
```

## 🖼️ 图片存储

### 存储策略
- **数据库**: 只存储图片文件名 (如 `bronze_ding.jpg`)
- **文件系统**: 实际图片文件存储在 `public/images/` 目录
- **前端访问**: 通过 `/images/{filename}` 路径访问

### 图片验证
后端会自动验证图片文件是否存在，如果不存在则使用默认图片。

### 支持的格式
- **推荐格式**: JPEG, PNG
- **建议尺寸**: 800x600 像素或更高
- **文件大小**: 建议 500KB 以下

## 🔐 认证机制

### Token 认证
- 使用简单的 token-based 认证
- Token 存储在内存中，重启后失效
- 临时解决方案，生产环境建议使用 JWT

### 用户状态
- 默认用户 ID: 1
- 未登录用户使用默认用户身份
- 收藏功能需要用户登录

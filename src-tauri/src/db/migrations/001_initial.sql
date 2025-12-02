-- src-tauri/src/db/migrations/001_initial.sql
-- 创建文物表
CREATE TABLE IF NOT EXISTS artifacts (
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

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artifact_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE,
    UNIQUE(user_id, artifact_id)
);

-- 插入示例文物数据（仅在表为空时插入）
INSERT OR IGNORE INTO artifacts (
    title, image_path, period, dynasty, location, description, detailed_description, 
    material, dimensions, discovery_location, collection, category
) VALUES 
(
    '青铜饕餮纹方鼎',
    'bronze_ding.jpg',
    '公元前13-11世纪',
    '商代晚期',
    '河南安阳',
    '商代晚期青铜礼器，器身饰有精美的饕餮纹，造型庄重典雅',
    '此鼎为商代晚期青铜礼器，通高35.6厘米，口径28.5厘米。器身呈方形，四足，双立耳。器身四面饰有精美的饕餮纹，纹饰繁复而规整，线条流畅。鼎腹内壁铸有铭文三字，记载了制作此鼎的贵族名称。',
    '青铜',
    '高35.6cm，口径28.5cm',
    '河南省安阳市殷墟',
    '中国国家博物馆',
    'bronze'
),
(
    '青花缠枝莲纹梅瓶',
    'blue_white_vase.jpg',
    '1403-1424年',
    '明代永乐',
    '江西景德镇',
    '明代永乐年间景德镇御窑厂烧造，釉色莹润，青花发色浓艳',
    '此瓶为明代永乐年间景德镇御窑厂烧造，高33.5厘米，口径6.5厘米，足径13.5厘米。瓶身修长，小口，短颈，丰肩，瘦底，圈足。通体施白釉，釉色莹润，青花发色浓艳，蓝中泛紫。瓶身绘缠枝莲纹，纹饰层次丰富，线条流畅，构图严谨。',
    '瓷',
    '高33.5cm，口径6.5cm',
    '江西省景德镇',
    '故宫博物院',
    'ceramics'
),
(
    '和田玉雕龙纹璧',
    'jade_bi.jpg',
    '公元前206-220年',
    '汉代',
    '陕西西安',
    '采用上等和田白玉雕琢而成，璧面浮雕龙纹，工艺精湛',
    '此玉璧采用上等和田白玉雕琢而成，直径15.8厘米，厚0.6厘米。玉质温润细腻，色泽纯正。璧面浮雕龙纹，龙身蜿蜒曲折，龙首回望，形态生动。龙纹线条流畅，工艺精湛，体现了汉代玉雕艺术的高度成就。',
    '和田玉',
    '直径15.8cm，厚0.6cm',
    '陕西省西安市',
    '陕西历史博物馆',
    'jade'
),
(
    '《千里江山图》卷',
    'thousand_miles.jpg',
    '约1113年',
    '北宋',
    '北京',
    '北宋画家王希孟所作青绿山水画，描绘壮丽江山景色',
    '此图为北宋画家王希孟所作，全卷以青绿山水为主，纵51.5厘米，横1191.5厘米。描绘了壮丽的江山景色，山峦起伏，江河浩渺，其间点缀屋舍、桥梁、人物，构图严谨，色彩绚丽。是中国古代青绿山水画的代表作。',
    '绢本',
    '纵51.5cm，横1191.5cm',
    '北京故宫',
    '故宫博物院',
    'calligraphy'
);

-- 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_artifacts_category ON artifacts(category);
CREATE INDEX IF NOT EXISTS idx_artifacts_dynasty ON artifacts(dynasty);
CREATE INDEX IF NOT EXISTS idx_artifacts_title ON artifacts(title);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_artifact_id ON user_favorites(artifact_id);

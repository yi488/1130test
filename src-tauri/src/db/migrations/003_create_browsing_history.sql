
CREATE TABLE IF NOT EXISTS browsing_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    artifact_id INTEGER NOT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (artifact_id) REFERENCES artifacts (id) ON DELETE CASCADE,
    UNIQUE(user_id, artifact_id)
);


CREATE INDEX IF NOT EXISTS idx_browsing_history_user_id ON browsing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_artifact_id ON browsing_history(artifact_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON browsing_history(viewed_at DESC);
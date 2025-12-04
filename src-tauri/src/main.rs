// src-tauri/src/main.rs
use tauri::Manager;

mod db;
mod api;
mod error;

use db::Database;
use error::Result;
use api::auth::init_auth_state;



#[tokio::main]
async fn main() -> Result<()> {
    
    tauri::Builder::default()
        
        .setup(|app| {
            // 初始化认证状态
            app.manage(init_auth_state());
            
            // 获取应用句柄，它可以在整个应用生命周期内使用
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                match Database::init(&app_handle).await {
                    Ok(pool) => {
                        // 使用 app_handle 来管理状态
                        app_handle.manage(pool);
                        println!("数据库初始化成功");
                    }
                    Err(e) => {
                        eprintln!("数据库初始化失败: {}", e);
                    }
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            api::artifacts::get_artifacts,
            api::artifacts::get_artifact_by_id,
            api::artifacts::toggle_favorite,
            api::artifacts::create_artifact,
            api::auth::login,
            api::auth::register,
            api::auth::get_current_user,
            api::auth::logout,
            api::auth::update_profile,
            api::auth::validate_password_strength,
            api::ai::chat_with_ai,
            api::history::add_to_history,
            api::history::get_browsing_history,
            api::history::clear_browsing_history,
        ])
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");

    Ok(())
}
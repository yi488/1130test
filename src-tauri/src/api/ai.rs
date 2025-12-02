use serde::{Deserialize, Serialize};
use crate::error::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub conversation_history: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub response: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeepSeekRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub temperature: f32,
    pub max_tokens: i32,
    pub stream: bool,
}

#[tauri::command]
pub async fn chat_with_ai(request: ChatRequest) -> Result<ChatResponse> {
    // 获取API密钥（这里使用环境变量，实际部署时需要配置）
    let api_key = std::env::var("DEEPSEEK_API_KEY")
        .unwrap_or_else(|_| "sk-your-deepseek-api-key".to_string());

    // 如果是默认的API密钥，返回模拟响应
    if api_key == "sk-your-deepseek-api-key" {
        return simulate_ai_response(&request.message);
    }

    // 构建发送给DeepSeek的消息列表
    let mut messages = vec![
        ChatMessage {
            role: "system".to_string(),
            content: "你是一个专业的文物博物馆AI助手。你的名字叫'文博助手'，专门帮助用户了解中国文物知识、历史背景、文化内涵等。请用专业、友好、易懂的方式回答用户的问题。如果遇到超出文物知识范围的问题，可以礼貌地表示并尝试引导用户回到文物相关话题。".to_string(),
        }
    ];

    // 添加对话历史
    for msg in request.conversation_history {
        messages.push(ChatMessage {
            role: msg.role,
            content: msg.content,
        });
    }

    // 添加当前用户消息
    messages.push(ChatMessage {
        role: "user".to_string(),
        content: request.message,
    });

    // 构建DeepSeek API请求
    let deepseek_request = DeepSeekRequest {
        model: "deepseek-chat".to_string(),
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
    };

    // 发送HTTP请求到DeepSeek API
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.deepseek.com/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&deepseek_request)
        .send()
        .await
        .map_err(|e| crate::error::Error::Network(format!("Failed to send request to DeepSeek: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(crate::error::Error::Network(format!(
            "DeepSeek API error: {} - {}", 
            status, 
            error_text
        )));
    }

    let deepseek_response: serde_json::Value = response
        .json()
        .await
        .map_err(|e| crate::error::Error::Network(format!("Failed to parse DeepSeek response: {}", e)))?;

    // 提取回复内容
    let content = deepseek_response
        .get("choices")
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .unwrap_or("抱歉，我现在无法回复您的消息。");

    Ok(ChatResponse {
        response: content.to_string(),
    })
}

// 模拟AI响应函数，用于测试
fn simulate_ai_response(message: &str) -> Result<ChatResponse> {
    let response = if message.contains("你好") || message.contains("hi") || message.contains("Hello") {
        "您好！我是文博助手，很高兴为您服务！我可以帮您了解各种文物知识，比如青铜器、陶瓷、玉器、书画等。请问有什么可以帮助您的吗？"
    } else if message.contains("青铜") {
        "青铜器是中国古代文明的重要标志，始于夏商时期。著名的青铜器包括司母戊鼎、四羊方尊等。青铜器主要用于礼器、乐器和兵器，体现了古代中国高超的冶金技术和艺术水平。"
    } else if message.contains("陶瓷") {
        "中国陶瓷有着悠久的历史，从新石器时代的陶器到宋元明清的精美瓷器。著名的景德镇瓷器、唐三彩、龙泉青瓷等都是中国陶瓷艺术的瑰宝。每种陶瓷都有其独特的制作工艺和文化内涵。"
    } else if message.contains("玉器") {
        "玉在中国文化中象征着纯洁和美德。从新石器时代的红山文化、良渚文化玉器，到明清时期的精美玉雕，玉器一直是中华文化的重要组成部分。古人说'君子比德于玉'，体现了玉的文化意义。"
    } else if message.contains("书画") {
        "中国书画是独特的艺术形式，书法包括篆、隶、楷、行、草五种字体，绘画则有人物、山水、花鸟等题材。著名的书画家有王羲之、顾恺之、吴道子、张大千等，他们的作品代表了中国艺术的最高成就。"
    } else if message.contains("博物馆") || message.contains("参观") {
        "参观博物馆时，建议您：1)提前了解展览内容；2)安排充足时间；3)注意观察文物的细节；4)可以拍照但要遵守规定；5)多听讲解了解背后的故事。如果您想了解特定博物馆的信息，我可以为您详细介绍。"
    } else if message.contains("帮助") || message.contains("help") {
        "我可以帮助您：\n📚 介绍各类文物知识（青铜器、陶瓷、玉器、书画等）\n🏛️ 提供博物馆参观建议\n📖 讲解文物历史背景\n🎨 介绍艺术流派和代表作品\n🔍 回答文物相关问题\n\n请问您想了解哪个方面呢？"
    } else {
        "感谢您的提问！作为文博助手，我主要专注于文物知识、历史文化和博物馆相关内容。如果您有关于青铜器、陶瓷、玉器、书画等方面的问题，我很乐意为您详细解答。您可以试试问我'介绍一下青铜器'或'博物馆参观注意事项'等问题。"
    };

    Ok(ChatResponse {
        response: response.to_string(),
    })
}

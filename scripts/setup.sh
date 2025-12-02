#!/bin/bash

# 文物遗产应用开发环境设置脚本

echo "🚀 设置文物遗产应用开发环境..."

# 检查依赖
echo "📦 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo 未安装，请先安装 Rust"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
pnpm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd src-tauri
cargo build
cd ..

# 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data
mkdir -p docs

# 检查图片文件
echo "🖼️ 检查图片文件..."
if [ ! -d "public/images" ]; then
    echo "❌ 图片目录不存在"
    exit 1
fi

IMAGE_COUNT=$(ls public/images/*.jpg 2>/dev/null | wc -l)
echo "✅ 找到 $IMAGE_COUNT 个图片文件"

# 检查数据库
echo "🗄️ 检查数据库..."
if [ ! -f "data/cultural_heritage.sqlite" ]; then
    echo "⚠️  数据库文件不存在，将在首次运行时创建"
else
    echo "✅ 数据库文件存在"
fi

echo "✅ 开发环境设置完成！"
echo ""
echo "🎯 下一步："
echo "   pnpm tauri dev    # 启动开发服务器"
echo "   pnpm tauri build  # 构建生产版本"
echo ""
echo "📚 更多信息请查看 docs/ 目录中的文档"

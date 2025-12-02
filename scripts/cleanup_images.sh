#!/bin/bash

# 图片清理脚本 - 删除未使用的图片文件

echo "🧹 清理未使用的图片文件..."

PROJECT_ROOT="/home/yang/1130test"
IMAGES_DIR="$PROJECT_ROOT/public/images"
DB_FILE="$PROJECT_ROOT/data/cultural_heritage.sqlite"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ 数据库文件不存在: $DB_FILE"
    exit 1
fi

echo "📊 分析图片使用情况..."

# 获取数据库中使用的图片
USED_IMAGES=$(sqlite3 "$DB_FILE" "SELECT DISTINCT image_path FROM artifacts ORDER BY image_path;")

echo ""
echo "📸 数据库中使用的图片:"
echo "$USED_IMAGES"
echo ""

# 获取文件系统中的所有jpg文件
ALL_IMAGES=$(ls "$IMAGES_DIR"/*.jpg 2>/dev/null | xargs -n1 basename)

echo "📁 文件系统中的图片文件:"
echo "$ALL_IMAGES"
echo ""

# 找出未使用的图片
UNUSED_IMAGES=""
for image in $ALL_IMAGES; do
    if ! echo "$USED_IMAGES" | grep -q "^$image$"; then
        UNUSED_IMAGES="$UNUSED_IMAGES $image"
    fi
done

if [ -n "$UNUSED_IMAGES" ]; then
    echo "🗑️  发现未使用的图片:"
    for image in $UNUSED_IMAGES; do
        echo "   - $image ($(stat -f%z "$IMAGES_DIR/$image" 2>/dev/null || stat -c%s "$IMAGES_DIR/$image" 2>/dev/null || echo "unknown") bytes)"
    done
    
    echo ""
    read -p "是否删除这些未使用的图片? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for image in $UNUSED_IMAGES; do
            if [ -f "$IMAGES_DIR/$image" ]; then
                rm "$IMAGES_DIR/$image"
                echo "✅ 已删除: $image"
            fi
        done
        echo "🎉 清理完成!"
    else
        echo "⏸️  跳过删除"
    fi
else
    echo "✅ 没有发现未使用的图片"
fi

echo ""
echo "📈 当前图片统计:"
echo "   数据库记录: $(echo "$USED_IMAGES" | wc -l)"
echo "   文件数量: $(ls "$IMAGES_DIR"/*.jpg 2>/dev/null | wc -l)"
echo "   总大小: $(du -sh "$IMAGES_DIR"/*.jpg 2>/dev/null | cut -f1 | tail -1)"

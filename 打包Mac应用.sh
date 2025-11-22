#!/bin/bash

echo "=========================================="
echo "   Word 字数统计工具 - Mac 应用打包脚本"
echo "=========================================="
echo ""

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 检查是否安装了 pyinstaller
echo "📦 检查打包工具..."
if ! python3 -c "import PyInstaller" 2>/dev/null; then
    echo "正在安装 PyInstaller..."
    pip3 install --user pyinstaller

    # 添加到 PATH（如果需要）
    export PATH="$HOME/Library/Python/3.11/bin:$PATH"
    export PATH="$HOME/Library/Python/3.10/bin:$PATH"
    export PATH="$HOME/Library/Python/3.9/bin:$PATH"
fi

# 清理之前的打包文件
echo ""
echo "🧹 清理旧文件..."
rm -rf build dist *.spec

# 执行打包
echo ""
echo "🚀 开始打包应用..."
echo "   这可能需要几分钟时间，请耐心等待..."
echo ""

pyinstaller \
    --name="Word字数统计" \
    --windowed \
    --onefile \
    --add-data "templates:templates" \
    --add-data "static:static" \
    --hidden-import=fastapi \
    --hidden-import=uvicorn \
    --hidden-import=docx \
    --hidden-import=PyPDF2 \
    --hidden-import=openpyxl \
    --hidden-import=reportlab \
    word_count_fastapi.py

# 检查打包结果
if [ -f "dist/Word字数统计.app/Contents/MacOS/Word字数统计" ]; then
    echo ""
    echo "✅ 打包成功！"
    echo ""
    echo "应用位置: dist/Word字数统计.app"
    echo ""
    echo "下一步操作："
    echo "1. 在 Finder 中打开 dist 文件夹"
    echo "2. 双击 Word字数统计.app 测试运行"
    echo "3. 如果能正常启动，就可以将应用拷贝到「应用程序」文件夹"
    echo ""
    echo "首次运行提示："
    echo "- 系统可能提示「无法打开」"
    echo "- 右键点击应用 → 选择「打开」即可"
    echo ""

    # 询问是否打开 dist 文件夹
    read -p "是否现在打开 dist 文件夹？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open dist
    fi
else
    echo ""
    echo "❌ 打包失败！"
    echo ""
    echo "可能的原因："
    echo "1. PyInstaller 安装不正确"
    echo "2. 缺少必要的依赖"
    echo ""
    echo "建议："
    echo "请查看上方的错误信息，或参考「打包说明.md」手动打包"
    echo ""
fi

echo "按任意键退出..."
read -n 1

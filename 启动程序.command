#!/bin/bash

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 检查是否安装了依赖
echo "正在检查运行环境..."
if ! python3 -c "import flask, docx" 2>/dev/null; then
    echo "正在安装必要组件（首次使用需要等待1-2分钟）..."
    pip3 install --user flask python-docx
fi

# 启动程序
echo "正在启动 Word 字数统计工具..."
python3 word_count_web.py

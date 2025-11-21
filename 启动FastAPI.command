#!/bin/bash
# FastAPI 版本启动脚本
cd "$(dirname "$0")"
echo "正在启动 Word Count Pro (FastAPI 版本)..."
echo "访问地址: http://127.0.0.1:8000"
echo "API 文档: http://127.0.0.1:8000/docs"
echo "---"
python3 word_count_fastapi.py

@echo off
chcp 65001 >nul
title Word 字数统计工具

echo.
echo ==========================================
echo       Word 字数统计工具
echo ==========================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 检查 Python 是否安装
echo 正在检查运行环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 错误: 未检测到 Python
    echo.
    echo 请先安装 Python 3:
    echo 1. 访问 https://www.python.org/downloads/
    echo 2. 下载并安装 Python 3
    echo 3. 安装时记得勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

REM 检查并安装依赖
echo.
python -c "import flask, docx" 2>nul
if errorlevel 1 (
    echo 正在安装必要组件（首次使用需要等待1-2分钟）...
    pip install flask python-docx
    if errorlevel 1 (
        echo.
        echo ❌ 安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 启动程序
echo.
echo ✅ 正在启动 Word 字数统计工具...
echo.
echo 浏览器会自动打开，如果没有自动打开，请手动访问:
echo http://127.0.0.1:5001
echo.
echo 使用完毕后，关闭此窗口即可退出程序
echo.

python word_count_web.py

REM 如果程序异常退出
echo.
echo 程序已退出
pause

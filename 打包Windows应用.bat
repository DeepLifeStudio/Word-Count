@echo off
chcp 65001 >nul
echo ==========================================
echo    Word 字数统计工具 - Windows 应用打包脚本
echo ==========================================
echo.

REM 检查 Python 是否安装
echo 📦 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Python
    echo.
    echo 请先安装 Python 3:
    echo https://www.python.org/downloads/
    echo.
    echo 安装时记得勾选 "Add Python to PATH"
    pause
    exit /b 1
)

REM 检查依赖
echo.
echo 📦 检查依赖库...
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo 正在安装 FastAPI...
    pip install fastapi uvicorn
)

python -c "import docx" 2>nul
if errorlevel 1 (
    echo 正在安装 python-docx...
    pip install python-docx
)

python -c "import PyInstaller" 2>nul
if errorlevel 1 (
    echo 正在安装 PyInstaller...
    pip install pyinstaller
)

REM 清理旧文件
echo.
echo 🧹 清理旧文件...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist *.spec del /q *.spec

REM 执行打包
echo.
echo 🚀 开始打包应用...
echo    这可能需要几分钟时间，请耐心等待...
echo.

pyinstaller ^
    --name="Word字数统计" ^
    --windowed ^
    --onefile ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import=fastapi ^
    --hidden-import=uvicorn ^
    --hidden-import=docx ^
    --hidden-import=PyPDF2 ^
    --hidden-import=openpyxl ^
    --hidden-import=reportlab ^
    word_count_fastapi.py

REM 检查打包结果
if exist "dist\Word字数统计.exe" (
    echo.
    echo ✅ 打包成功！
    echo.
    echo 应用位置: dist\Word字数统计.exe
    echo.
    echo 下一步操作:
    echo 1. 在资源管理器中打开 dist 文件夹
    echo 2. 双击 Word字数统计.exe 测试运行
    echo 3. 如果能正常启动，就可以将应用分享给其他人
    echo.
    echo 注意事项:
    echo - 杀毒软件可能误报，需要添加信任
    echo - 首次运行可能需要防火墙授权
    echo.

    REM 询问是否打开 dist 文件夹
    set /p open_folder="是否现在打开 dist 文件夹？(Y/N): "
    if /i "%open_folder%"=="Y" (
        explorer dist
    )
) else (
    echo.
    echo ❌ 打包失败！
    echo.
    echo 可能的原因:
    echo 1. PyInstaller 安装不正确
    echo 2. 缺少必要的依赖
    echo 3. Python 版本不兼容（建议使用 Python 3.8+）
    echo.
    echo 建议:
    echo 请查看上方的错误信息，或参考「打包说明.md」
    echo.
)

pause

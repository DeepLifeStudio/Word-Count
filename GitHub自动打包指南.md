# GitHub 自动打包使用指南

## 📋 准备工作完成

我已经帮你配置好了 GitHub Actions 自动打包系统，包括：

✅ `.github/workflows/build.yml` - 自动打包配置
✅ `requirements.txt` - Python 依赖列表
✅ `.gitignore` - Git 忽略文件
✅ `README_GITHUB.md` - GitHub 项目说明

---

## 🚀 上传到 GitHub（3步完成）

### 第一步：初始化 Git 仓库

打开终端，执行以下命令：

```bash
cd /Users/liuzx/Documents/Development/word-count
git init
git add .
git commit -m "Initial commit: Word 字数统计工具"
```

### 第二步：创建 GitHub 仓库

1. 打开浏览器，访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `word-count-tool`（或其他你喜欢的名字）
   - **Description**: Word 文档批量字数统计工具
   - **Public/Private**: 选择 Public（这样自动打包才免费）
3. **不要**勾选 "Add a README file"（我们已经有了）
4. 点击 "Create repository"

### 第三步：推送代码

GitHub 会显示一些命令，你只需要复制第二组命令（类似下面这样）：

```bash
git remote add origin https://github.com/你的用户名/word-count-tool.git
git branch -M main
git push -u origin main
```

---

## ⚙️ 触发自动打包

代码推送后，有两种方式触发自动打包：

### 方式 1：手动触发（推荐，立即生效）

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 在左侧列表选择 **打包应用**
3. 点击右侧的 **Run workflow** 按钮
4. 点击绿色的 **Run workflow** 确认
5. 等待 5-10 分钟，自动打包完成

### 方式 2：创建标签（适合正式发布）

在终端执行：

```bash
git tag v1.0.0
git push origin v1.0.0
```

这会自动触发打包，并创建一个 Release。

---

## 📦 下载打包好的文件

### 如果使用手动触发：

1. 打包完成后，在 Actions 页面会显示绿色的 ✅
2. 点击进入这次运行的详情
3. 在页面底部找到 **Artifacts** 区域
4. 下载：
   - `Word字数统计-Windows` (包含 .exe)
   - `Word字数统计-macOS` (包含 .app)

### 如果使用标签触发：

1. 在 GitHub 仓库页面，点击右侧的 **Releases**
2. 会看到自动创建的 Release (v1.0.0)
3. 直接下载：
   - `Word字数统计.exe`
   - `Word字数统计-macOS.zip`

---

## 🎁 分发给用户

下载后：

**Windows 用户：**
- 直接把 `Word字数统计.exe` 发给他们
- 告诉他们：双击运行即可，第一次可能提示安全警告，点"仍要运行"

**Mac 用户：**
- 把 `Word字数统计-macOS.zip` 发给他们
- 告诉他们：解压后，右键点击 .app → 打开

---

## 🔄 以后如何更新

当你修改代码后：

1. **提交更改**
```bash
git add .
git commit -m "更新说明"
git push
```

2. **触发打包**
   - 手动触发：在 Actions 页面点 Run workflow
   - 或创建新标签：`git tag v1.0.1 && git push origin v1.0.1`

3. **下载新版本**，替换旧文件发给用户

---

## ❓ 常见问题

### Q: 为什么要设为 Public？
GitHub Actions 对 Public 仓库免费，Private 仓库有时长限制。

### Q: 打包失败怎么办？
点击失败的运行，查看错误日志。通常是依赖问题，检查 requirements.txt。

### Q: 能改项目名吗？
可以，在 GitHub 仓库设置里改名，本地重新设置 remote 地址即可。

### Q: 打包的文件在哪？
- 手动触发：Actions → 运行详情 → Artifacts
- 标签触发：Releases 页面

---

## 📝 快速命令参考

```bash
# 初始化并上传
cd /Users/liuzx/Documents/Development/word-count
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main

# 以后更新
git add .
git commit -m "更新内容"
git push

# 创建发布版本
git tag v1.0.0
git push origin v1.0.0
```

---

**现在按照上面的步骤操作，5-10分钟后就能得到打包好的 .exe 和 .app 了！** 🎉

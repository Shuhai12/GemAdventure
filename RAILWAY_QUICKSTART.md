# 🚀 快速部署到 Railway

## 第一步：推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
cd /Users/admin/GemAdventure
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 宝石消除游戏"

# 在 GitHub 上创建新仓库，然后：
git remote add origin https://github.com/你的用户名/gem-adventure.git
git branch -M main
git push -u origin main
```

## 第二步：部署到 Railway

### 方法 A：通过网页（最简单）

1. 访问 https://railway.app
2. 点击 "Login" 使用 GitHub 登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `gem-adventure` 仓库
6. 等待自动部署（约 2-3 分钟）
7. 点击 "Generate Domain" 获取公开 URL

### 方法 B：通过命令行

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up

# 生成域名
railway domain
```

## 第三步：访问你的游戏

部署完成后，你会得到一个 URL，例如：
```
https://gem-adventure-production.up.railway.app
```

访问：
- 🎮 游戏首页: `https://你的域名/`
- 📱 移动版: `https://你的域名/mobile.html`
- ⚙️ 管理后台: `https://你的域名/admin/`

## 常见问题

### Q: 部署失败怎么办？
A: 检查 Railway 的日志，通常是依赖安装问题。确保 package.json 正确。

### Q: 如何更新代码？
A: 只需推送到 GitHub，Railway 会自动重新部署：
```bash
git add .
git commit -m "更新游戏"
git push
```

### Q: 数据会丢失吗？
A: Railway 重启后文件会丢失。建议：
1. 使用 Railway Volume（持久化存储）
2. 或迁移到数据库

### Q: 免费吗？
A: Railway 提供 $5/月 的免费额度，足够小型项目使用。

## 监控和管理

在 Railway 控制台可以：
- 查看实时日志
- 监控资源使用
- 设置环境变量
- 查看部署历史
- 一键回滚

## 下一步

- [ ] 绑定自定义域名
- [ ] 添加数据库（PostgreSQL/MongoDB）
- [ ] 配置 CDN 加速
- [ ] 添加用户认证系统

---

需要帮助？查看 [完整部署文档](DEPLOY.md)

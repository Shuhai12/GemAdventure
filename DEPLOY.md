# Railway 部署指南

## 项目简介
幻彩宝石大冒险 - 三消休闲游戏，包含游戏前端和关卡配置管理后台。

## 部署步骤

### 1. 准备工作
确保你有 Railway 账号，访问 https://railway.app 注册。

### 2. 部署到 Railway

#### 方式一：通过 GitHub（推荐）
1. 将代码推送到 GitHub 仓库
2. 登录 Railway，点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测并部署

#### 方式二：通过 Railway CLI
```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 部署
railway up
```

### 3. 配置环境变量
在 Railway 项目设置中添加以下环境变量：
- `PORT`: 自动设置，无需手动配置
- `NODE_ENV`: production

### 4. 访问应用
部署完成后，Railway 会提供一个公开 URL，例如：
- 游戏前端: `https://your-app.railway.app/`
- 移动端: `https://your-app.railway.app/mobile.html`
- 管理后台: `https://your-app.railway.app/admin/`

### 5. 数据持久化
Railway 默认使用临时文件系统，重启后数据会丢失。建议：
- 使用 Railway 的 Volume 功能挂载持久化存储
- 或者迁移到数据库（如 PostgreSQL、MongoDB）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产环境启动
npm start
```

访问：
- 游戏: http://localhost:3001/
- 管理后台: http://localhost:3001/admin/

## 项目结构
```
GemAdventure/
├── server.js           # Express 服务器
├── package.json        # 项目配置
├── level-config.json   # 关卡配置数据
├── demo/              # 游戏前端
│   ├── index.html     # PC 版游戏
│   ├── mobile.html    # 移动版游戏
│   ├── js/           # 游戏逻辑
│   └── css/          # 样式文件
└── admin/            # 管理后台
    ├── index.html    # 后台界面
    ├── js/          # 后台逻辑
    └── css/         # 后台样式
```

## API 接口
- `GET /api/levels` - 获取所有关卡
- `GET /api/levels/:id` - 获取单个关卡
- `POST /api/levels` - 创建新关卡
- `PUT /api/levels/:id` - 更新关卡
- `DELETE /api/levels/:id` - 删除关卡

## 技术栈
- 后端: Node.js + Express
- 前端: 原生 JavaScript + Canvas
- 部署: Railway

## 注意事项
1. Railway 免费套餐有使用限制，注意监控资源使用
2. 首次部署可能需要几分钟时间
3. 确保 level-config.json 文件存在，否则会自动创建空配置

# Android APP 打包指南

## 方案一：使用在线打包服务（最简单，推荐）

### 使用 PWA Builder
1. 访问 https://www.pwabuilder.com/
2. 输入你的 Railway 域名
3. 点击 "Start" 分析网站
4. 选择 "Android" 平台
5. 点击 "Generate" 生成 APK
6. 下载并安装到手机

**优点**：
- 无需安装任何工具
- 5分钟完成
- 自动配置

### 使用 Capacitor + AppFlow
1. 访问 https://ionic.io/appflow
2. 注册账号（免费）
3. 连接 GitHub 仓库
4. 在线构建 APK
5. 下载安装

## 方案二：本地打包（需要工具）

### 前置要求
1. **安装 Java JDK**
```bash
brew install openjdk@17
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

2. **安装 Android Studio**
- 下载：https://developer.android.com/studio
- 安装后打开，下载 Android SDK
- 配置环境变量：
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 打包步骤

1. **更新 Railway 域名**
编辑 `capacitor.config.json`，将 `你的Railway域名` 替换为实际域名：
```json
{
  "appId": "com.gemadventure.app",
  "appName": "Gem Adventure",
  "webDir": "public",
  "server": {
    "url": "https://你的实际域名.railway.app",
    "cleartext": true
  }
}
```

2. **同步项目**
```bash
npx cap sync
```

3. **打开 Android Studio**
```bash
npx cap open android
```

4. **在 Android Studio 中构建**
- 点击 Build → Build Bundle(s) / APK(s) → Build APK(s)
- 等待构建完成
- APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

5. **安装到手机**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 方案三：使用命令行打包

```bash
# 确保已安装 Java 和 Android SDK
cd /Users/admin/GemAdventure

# 构建 Debug APK
cd android
./gradlew assembleDebug

# APK 位置
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 配置说明

### 连接到服务器
APP 会自动连接到 Railway 服务器获取关卡配置。

在 `capacitor.config.json` 中配置：
```json
{
  "server": {
    "url": "https://你的域名.railway.app"
  }
}
```

### 管理后台配置生效
1. 在浏览器打开管理后台：`https://你的域名.railway.app/admin/`
2. 修改关卡配置（宝石颜色数、目标分数等）
3. APP 启动时会自动从服务器加载最新配置
4. 无需重新打包 APP

### 更新游戏内容
如果要更新游戏逻辑或界面：
1. 修改 `demo/` 目录下的文件
2. 推送到 GitHub
3. Railway 自动部署
4. APP 会加载新版本（无需重新打包）

## 发布到应用商店

### Google Play Store
1. 注册开发者账号（$25 一次性费用）
2. 创建应用
3. 上传 APK
4. 填写应用信息
5. 提交审核

### 华为应用市场 / 小米应用商店
1. 注册开发者账号
2. 上传 APK
3. 填写应用信息
4. 提交审核

## 常见问题

### Q: APP 无法连接服务器？
A: 检查 `capacitor.config.json` 中的域名是否正确

### Q: 如何更新 APP？
A:
- 如果只是更新游戏内容：推送到 GitHub，Railway 自动部署
- 如果要更新 APP 配置：需要重新打包

### Q: 如何生成签名版本？
A:
```bash
# 生成密钥
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 构建 Release APK
cd android
./gradlew assembleRelease
```

## 推荐方案

**快速体验**：使用 PWA Builder（5分钟）
**正式发布**：使用 Android Studio 本地打包（可签名）
**持续集成**：使用 AppFlow 在线构建（自动化）

---

当前项目已配置好 Capacitor，只需：
1. 获取 Railway 域名
2. 更新 `capacitor.config.json`
3. 选择上述任一方案打包

# 将 PWA 转换为 Android APK

由于本地环境缺少 Java 运行时，推荐使用以下在线工具生成 APK：

## 方法 1: PWABuilder（推荐）

1. 访问 [PWABuilder](https://www.pwabuilder.com/)
2. 输入你的 PWA 网址：`https://gemadventure-production.up.railway.app`
3. 点击 "Start" 进行分析
4. 选择 "Android" 平台
5. 配置选项：
   - Package ID: `com.gemadventure.game`
   - App name: `幻彩宝石大冒险`
   - Launcher name: `宝石消消乐`
   - Theme color: `#667eea`
   - Start URL: `/mobile.html`
6. 点击 "Generate" 下载 APK

## 方法 2: 本地构建（需要安装 Java）

如果想在本地构建，需要先安装 Java：

```bash
# macOS 使用 Homebrew 安装
brew install openjdk@17

# 然后使用 Bubblewrap
cd twa-project
npx bubblewrap build
```

## 已准备的配置文件

配置文件已保存在 `twa-project/twa-manifest.json`，包含了所有必要的设置。

## 测试 APK

生成 APK 后，可以通过以下方式测试：
- 使用 Android 模拟器
- 通过 USB 连接真实设备进行安装
- 上传到 Google Play Console 进行内部测试

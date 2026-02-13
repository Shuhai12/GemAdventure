# 宝石消除游戏 - 3D版本

## 项目概述

这是使用 Cocos Creator 3D 开发的宝石消除游戏，具有精美的 3D 视觉效果和流畅的动画。

## 核心功能

### 1. 3D 宝石系统 ([Gem3D.ts](assets/scripts/Gem3D.ts))
- 7种不同颜色的3D宝石
- 真实的材质和光照效果
- 平滑的动画过渡
  - 生成动画（从上方掉落）
  - 选中动画（放大+旋转）
  - 消除动画（缩放+旋转消失）
  - 交换动画（平滑移动）

### 2. 游戏棋盘管理 ([GameBoard3D.ts](assets/scripts/GameBoard3D.ts))
- 8x8 3D棋盘
- 智能匹配检测（横向和纵向）
- 自动填充和连锁消除
- 触摸/鼠标交互
- 射线检测选择宝石

### 3. 相机控制 ([CameraController.ts](assets/scripts/CameraController.ts))
- 360度旋转视角
- 鼠标滚轮缩放
- 平滑的相机运动
- 可重置到默认视角

### 4. 粒子特效 ([ParticleEffects.ts](assets/scripts/ParticleEffects.ts))
- 爆炸特效
- 闪光特效
- 连击特效

## 技术特点

### 视觉效果
- **3D宝石模型**：使用球体或自定义模型
- **PBR材质**：物理渲染材质，真实的光照效果
- **动态光照**：方向光+环境光
- **粒子系统**：消除特效、连击特效
- **平滑动画**：使用 Tween 系统

### 交互体验
- **直观的触摸控制**：点击选择，再次点击交换
- **相机自由旋转**：右键拖拽旋转视角
- **缩放功能**：鼠标滚轮调整视距
- **视觉反馈**：选中高亮、动画提示

### 性能优化
- 对象池管理宝石实例
- 批量渲染优化
- LOD（细节层次）支持
- 移动端性能优化

## 在 Cocos Creator 中设置

### 1. 创建场景结构

```
Scene
├── Camera (挂载 CameraController)
│   └── 设置: Position(0, 10, 15), LookAt(0, 0, 0)
├── Lights
│   ├── DirectionalLight (主光源)
│   │   └── 设置: Rotation(-45, 45, 0), Color(255, 255, 255), Intensity(1.5)
│   └── AmbientLight (环境光)
│       └── 设置: Color(100, 100, 150), Intensity(0.3)
├── GameBoard (挂载 GameBoard3D)
│   └── 设置: 引用 GemPrefab 和 Camera
└── Effects (挂载 ParticleEffects)
    ├── ExplosionParticle
    └── SparkleParticle
```

### 2. 创建宝石预制体 (GemPrefab)

```
GemPrefab
├── MeshRenderer (球体或宝石模型)
│   └── Material: PBR材质
│       ├── Albedo: 宝石颜色
│       ├── Metallic: 0.8
│       ├── Roughness: 0.2
│       └── Emissive: 轻微发光
└── Gem3D Component
```

### 3. 材质设置

创建 7 种不同颜色的材质：
- 红色宝石：Albedo(255, 0, 0)
- 绿色宝石：Albedo(0, 255, 0)
- 蓝色宝石：Albedo(0, 0, 255)
- 黄色宝石：Albedo(255, 255, 0)
- 紫色宝石：Albedo(255, 0, 255)
- 青色宝石：Albedo(0, 255, 255)
- 橙色宝石：Albedo(255, 128, 0)

### 4. 光照设置

**主光源（DirectionalLight）**
- Position: (0, 10, 0)
- Rotation: (-45, 45, 0)
- Color: (255, 255, 255)
- Intensity: 1.5
- Enable Shadow: true

**环境光（AmbientLight）**
- Color: (100, 100, 150)
- Intensity: 0.3

## 游戏玩法

1. **选择宝石**：点击一个宝石进行选中
2. **交换宝石**：点击相邻的宝石进行交换
3. **消除匹配**：3个或更多相同颜色的宝石连成一线即可消除
4. **连锁反应**：消除后新宝石掉落，可能触发连锁消除
5. **旋转视角**：右键拖拽旋转相机，更好地观察棋盘
6. **缩放视图**：鼠标滚轮调整视距

## 与后台系统集成

游戏可以连接到现有的管理后台系统：

```typescript
// 在 GameBoard3D 中添加
async loadLevelConfig(levelId: number) {
    const response = await fetch(`http://localhost:3001/api/levels/${levelId}`);
    const config = await response.json();

    this.gemColors = config.gemColors;
    this.targetScore = config.targetScore;
    this.maxMoves = config.moves;
}
```

## 下一步开发

### 视觉增强
- [ ] 添加更复杂的宝石模型（多面体）
- [ ] 实现折射和反射效果
- [ ] 添加背景环境（天空盒）
- [ ] 更丰富的粒子特效

### 游戏功能
- [ ] 特殊宝石（炸弹、闪电等）
- [ ] 关卡目标系统
- [ ] 分数和星级评定
- [ ] 音效和背景音乐

### 性能优化
- [ ] 对象池优化
- [ ] 批量渲染
- [ ] 移动端适配
- [ ] 加载优化

## 运行项目

### 在 Cocos Creator 中
1. 打开 Cocos Creator 3.x
2. 导入 `cocos3d` 文件夹
3. 创建场景并按照上述结构设置
4. 点击预览按钮运行

### 构建发布
```bash
# Web 平台
cocos build -p web

# Android
cocos build -p android

# iOS
cocos build -p ios
```

## 技术栈

- **引擎**: Cocos Creator 3.8+
- **语言**: TypeScript
- **渲染**: WebGL 2.0
- **物理**: Built-in Physics
- **动画**: Tween System

## 性能要求

### 最低配置
- GPU: 支持 WebGL 2.0
- RAM: 2GB
- 浏览器: Chrome 90+, Safari 14+, Firefox 88+

### 推荐配置
- GPU: 独立显卡
- RAM: 4GB+
- 浏览器: 最新版本

## 许可证

MIT License

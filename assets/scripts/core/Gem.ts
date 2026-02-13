import { _decorator, Component, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 宝石类型枚举
 */
export enum GemType {
    RUBY = 0,        // 红宝石 - 炽热的火焰之心
    SAPPHIRE = 1,    // 蓝宝石 - 深海的神秘之眼
    EMERALD = 2,     // 绿宝石 - 森林的生命之源
    TOPAZ = 3,       // 黄宝石 - 太阳的光辉之石
    AMETHYST = 4,    // 紫宝石 - 星空的梦幻之晶
    CITRINE = 5,     // 橙宝石 - 黄昏的温暖之光
    LIGHTNING = 6,   // 雷电宝石 - 闪电连锁特效
    TIMEWARP = 7     // 时空宝石 - 时空扭曲特效
}

/**
 * 宝石视觉配置
 */
export interface GemVisualConfig {
    primaryColor: Color;      // 主色调
    glowColor: Color;         // 发光颜色
    particleColor: Color;     // 粒子特效颜色
    name: string;             // 宝石名称
    description: string;      // 宝石描述
    rarity: number;           // 稀有度 (1-5)
}

/**
 * 宝石视觉配置表
 */
export const GEM_VISUAL_CONFIGS: Map<GemType, GemVisualConfig> = new Map([
    [GemType.RUBY, {
        primaryColor: new Color(220, 20, 60),
        glowColor: new Color(255, 69, 0, 200),
        particleColor: new Color(255, 140, 0),
        name: '炽焰红宝石',
        description: '蕴含火焰之力的神秘宝石',
        rarity: 3
    }],
    [GemType.SAPPHIRE, {
        primaryColor: new Color(15, 82, 186),
        glowColor: new Color(0, 191, 255, 200),
        particleColor: new Color(135, 206, 250),
        name: '深海蓝宝石',
        description: '承载海洋之力的璀璨宝石',
        rarity: 3
    }],
    [GemType.EMERALD, {
        primaryColor: new Color(0, 168, 107),
        glowColor: new Color(50, 205, 50, 200),
        particleColor: new Color(144, 238, 144),
        name: '生命绿宝石',
        description: '充满生机的自然之石',
        rarity: 3
    }],
    [GemType.TOPAZ, {
        primaryColor: new Color(255, 215, 0),
        glowColor: new Color(255, 255, 0, 200),
        particleColor: new Color(255, 250, 205),
        name: '耀光黄宝石',
        description: '散发太阳光辉的宝石',
        rarity: 3
    }],
    [GemType.AMETHYST, {
        primaryColor: new Color(147, 112, 219),
        glowColor: new Color(186, 85, 211, 200),
        particleColor: new Color(221, 160, 221),
        name: '星辰紫宝石',
        description: '闪耀星空之力的梦幻宝石',
        rarity: 4
    }],
    [GemType.CITRINE, {
        primaryColor: new Color(255, 140, 0),
        glowColor: new Color(255, 165, 0, 200),
        particleColor: new Color(255, 218, 185),
        name: '暖阳橙宝石',
        description: '温暖如黄昏的宝石',
        rarity: 3
    }],
    [GemType.LIGHTNING, {
        primaryColor: new Color(255, 255, 255),
        glowColor: new Color(135, 206, 250, 255),
        particleColor: new Color(173, 216, 230),
        name: '雷霆之石',
        description: '释放连锁闪电的特殊宝石',
        rarity: 5
    }],
    [GemType.TIMEWARP, {
        primaryColor: new Color(138, 43, 226),
        glowColor: new Color(75, 0, 130, 255),
        particleColor: new Color(148, 0, 211),
        name: '时空之晶',
        description: '扭曲时空的神秘宝石',
        rarity: 5
    }]
]);

/**
 * 宝石数据类
 */
export class GemData {
    type: GemType;
    row: number;
    col: number;

    constructor(type: GemType, row: number, col: number) {
        this.type = type;
        this.row = row;
        this.col = col;
    }

    /**
     * 获取宝石的视觉配置
     */
    getVisualConfig(): GemVisualConfig | undefined {
        return GEM_VISUAL_CONFIGS.get(this.type);
    }
}

/**
 * 宝石组件 - 增强版
 */
@ccclass('Gem')
export class Gem extends Component {
    @property
    private gemType: GemType = GemType.RUBY;

    @property
    private row: number = 0;

    @property
    private col: number = 0;

    @property
    private isSpecial: boolean = false; // 是否为特殊宝石

    @property
    private glowIntensity: number = 1.0; // 发光强度

    public getGemType(): GemType {
        return this.gemType;
    }

    public setGemType(type: GemType): void {
        this.gemType = type;
        this.isSpecial = (type === GemType.LIGHTNING || type === GemType.TIMEWARP);
        this.updateVisuals();
    }

    public getPosition(): { row: number, col: number } {
        return { row: this.row, col: this.col };
    }

    public setPosition(row: number, col: number): void {
        this.row = row;
        this.col = col;
    }

    public getVisualConfig(): GemVisualConfig | undefined {
        return GEM_VISUAL_CONFIGS.get(this.gemType);
    }

    public setGlowIntensity(intensity: number): void {
        this.glowIntensity = Math.max(0, Math.min(2, intensity));
        this.updateVisuals();
    }

    /**
     * 更新宝石视觉效果
     */
    private updateVisuals(): void {
        const config = this.getVisualConfig();
        if (!config) return;

        // 这里可以根据配置更新宝石的视觉效果
        // 例如：更新精灵颜色、发光效果、粒子系统等
        // 实际实现需要在 Cocos Creator 编辑器中配置
    }

    /**
     * 播放宝石选中动画
     */
    public playSelectAnimation(): void {
        // 实现选中动画效果
        this.setGlowIntensity(1.5);
    }

    /**
     * 播放宝石消除动画
     */
    public playDestroyAnimation(): void {
        // 实现消除动画效果
        const config = this.getVisualConfig();
        if (config) {
            // 播放粒子特效、缩放动画等
        }
    }
}

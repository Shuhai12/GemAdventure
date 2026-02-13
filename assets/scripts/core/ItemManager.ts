import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 道具类型枚举
 */
export enum ItemType {
    // 普通道具
    CLEAR_LINE = 'clear_line',           // 清除射线
    UNIVERSAL_GEM = 'universal_gem',     // 万能替换石
    SHIELD = 'shield',                   // 护盾道具

    // 特殊道具
    RUIN_KEY = 'ruin_key',               // 神秘遗迹钥匙
    ENERGY_AMPLIFIER = 'energy_amplifier', // 能量增幅器
    TIME_HOURGLASS = 'time_hourglass'    // 时间凝固沙漏
}

/**
 * 道具数据类
 */
export class ItemData {
    type: ItemType;
    name: string;
    description: string;
    count: number;

    constructor(type: ItemType, name: string, description: string, count: number = 0) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.count = count;
    }
}

/**
 * 道具管理器
 */
@ccclass('ItemManager')
export class ItemManager extends Component {
    private static instance: ItemManager = null;
    private inventory: Map<ItemType, ItemData> = new Map();

    public static getInstance(): ItemManager {
        return this.instance;
    }

    onLoad() {
        if (ItemManager.instance === null) {
            ItemManager.instance = this;
        }
        this.initItems();
    }

    /**
     * 初始化道具
     */
    private initItems(): void {
        // 普通道具
        this.inventory.set(ItemType.CLEAR_LINE, new ItemData(
            ItemType.CLEAR_LINE,
            '清除射线',
            '可清除一条直线上的宝石',
            3
        ));

        this.inventory.set(ItemType.UNIVERSAL_GEM, new ItemData(
            ItemType.UNIVERSAL_GEM,
            '万能替换石',
            '能代替任意一种宝石完成消除',
            2
        ));

        this.inventory.set(ItemType.SHIELD, new ItemData(
            ItemType.SHIELD,
            '护盾道具',
            '可以抵挡一次随机出现的负面事件影响',
            1
        ));

        // 特殊道具
        this.inventory.set(ItemType.RUIN_KEY, new ItemData(
            ItemType.RUIN_KEY,
            '神秘遗迹钥匙',
            '用于开启隐藏房间或秘密通道',
            0
        ));

        this.inventory.set(ItemType.ENERGY_AMPLIFIER, new ItemData(
            ItemType.ENERGY_AMPLIFIER,
            '能量增幅器',
            '使接下来的三次消除获得的积分翻倍',
            1
        ));

        this.inventory.set(ItemType.TIME_HOURGLASS, new ItemData(
            ItemType.TIME_HOURGLASS,
            '时间凝固沙漏',
            '能暂停场上所有宝石的随机移动一段时间',
            0
        ));
    }

    /**
     * 获取道具数量
     */
    public getItemCount(type: ItemType): number {
        const item = this.inventory.get(type);
        return item ? item.count : 0;
    }

    /**
     * 添加道具
     */
    public addItem(type: ItemType, count: number = 1): void {
        const item = this.inventory.get(type);
        if (item) {
            item.count += count;
        }
    }

    /**
     * 使用道具
     */
    public useItem(type: ItemType): boolean {
        const item = this.inventory.get(type);
        if (item && item.count > 0) {
            item.count--;
            return true;
        }
        return false;
    }

    /**
     * 获取所有道具
     */
    public getAllItems(): ItemData[] {
        return Array.from(this.inventory.values());
    }
}

import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

/**
 * 随机事件类型
 */
export enum RandomEventType {
    MERCHANT = 'merchant',           // 神秘商人
    GEM_BLESSING = 'gem_blessing',   // 宝石祝福
    GHOST_GEM = 'ghost_gem',         // 幽灵宝石
    BONUS_MOVES = 'bonus_moves'      // 额外步数
}

/**
 * 随机事件数据
 */
export interface RandomEventData {
    type: RandomEventType;
    name: string;
    description: string;
    probability: number;             // 触发概率 (0-1)
    duration?: number;               // 持续时间（秒）
    effect: () => void;              // 事件效果
}

/**
 * 随机事件管理器
 */
@ccclass('RandomEventManager')
export class RandomEventManager extends Component {
    private static instance: RandomEventManager = null;
    private events: Map<RandomEventType, RandomEventData> = new Map();
    private activeEvent: RandomEventData | null = null;
    private eventCheckInterval: number = 30;  // 每30秒检查一次
    private lastCheckTime: number = 0;

    public static getInstance(): RandomEventManager {
        return this.instance;
    }

    onLoad() {
        if (RandomEventManager.instance === null) {
            RandomEventManager.instance = this;
        }
        this.initEvents();
    }

    update(dt: number) {
        this.lastCheckTime += dt;
        if (this.lastCheckTime >= this.eventCheckInterval) {
            this.checkRandomEvent();
            this.lastCheckTime = 0;
        }
    }

    /**
     * 初始化事件
     */
    private initEvents(): void {
        // 神秘商人
        this.events.set(RandomEventType.MERCHANT, {
            type: RandomEventType.MERCHANT,
            name: '神秘商人',
            description: '神秘商人出现了！可以用积分兑换珍稀道具',
            probability: 0.15,
            effect: () => {
                console.log('神秘商人事件触发');
                // 显示商人界面
            }
        });

        // 宝石祝福
        this.events.set(RandomEventType.GEM_BLESSING, {
            type: RandomEventType.GEM_BLESSING,
            name: '宝石祝福',
            description: '接下来的3次消除将获得双倍积分！',
            probability: 0.2,
            duration: 60,
            effect: () => {
                console.log('宝石祝福事件触发');
                // 激活双倍积分效果
            }
        });

        // 幽灵宝石
        this.events.set(RandomEventType.GHOST_GEM, {
            type: RandomEventType.GHOST_GEM,
            name: '幽灵宝石',
            description: '幽灵宝石出现了！它会随机移动',
            probability: 0.1,
            duration: 45,
            effect: () => {
                console.log('幽灵宝石事件触发');
                // 生成幽灵宝石
            }
        });

        // 额外步数
        this.events.set(RandomEventType.BONUS_MOVES, {
            type: RandomEventType.BONUS_MOVES,
            name: '额外步数',
            description: '获得了5步额外步数！',
            probability: 0.12,
            effect: () => {
                console.log('额外步数事件触发');
                // 增加步数
            }
        });
    }

    /**
     * 检查随机事件
     */
    private checkRandomEvent(): void {
        if (this.activeEvent) {
            return; // 已有活动事件
        }

        const events = Array.from(this.events.values());
        for (const event of events) {
            if (Math.random() < event.probability) {
                this.triggerEvent(event);
                break;
            }
        }
    }

    /**
     * 触发事件
     */
    public triggerEvent(event: RandomEventData): void {
        this.activeEvent = event;
        console.log(`触发随机事件: ${event.name}`);
        event.effect();

        if (event.duration) {
            this.scheduleOnce(() => {
                this.endEvent();
            }, event.duration);
        }
    }

    /**
     * 结束事件
     */
    private endEvent(): void {
        if (this.activeEvent) {
            console.log(`随机事件结束: ${this.activeEvent.name}`);
            this.activeEvent = null;
        }
    }

    /**
     * 获取当前活动事件
     */
    public getActiveEvent(): RandomEventData | null {
        return this.activeEvent;
    }
}

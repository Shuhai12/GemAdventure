import { _decorator, Component, sys } from 'cc';
const { ccclass } = _decorator;

/**
 * 游戏数据管理器
 */
@ccclass('GameDataManager')
export class GameDataManager extends Component {
    private static instance: GameDataManager = null;

    private currentLevel: number = 1;
    private totalScore: number = 0;
    private coins: number = 0;
    private unlockedLevels: Set<number> = new Set([1]);

    public static getInstance(): GameDataManager {
        return this.instance;
    }

    onLoad() {
        if (GameDataManager.instance === null) {
            GameDataManager.instance = this;
        }
        this.loadGameData();
    }

    /**
     * 加载游戏数据
     */
    private loadGameData(): void {
        const data = sys.localStorage.getItem('gameData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.currentLevel = parsed.currentLevel || 1;
                this.totalScore = parsed.totalScore || 0;
                this.coins = parsed.coins || 0;
                this.unlockedLevels = new Set(parsed.unlockedLevels || [1]);
            } catch (e) {
                console.error('加载游戏数据失败:', e);
            }
        }
    }

    /**
     * 保存游戏数据
     */
    public saveGameData(): void {
        const data = {
            currentLevel: this.currentLevel,
            totalScore: this.totalScore,
            coins: this.coins,
            unlockedLevels: Array.from(this.unlockedLevels)
        };
        sys.localStorage.setItem('gameData', JSON.stringify(data));
    }

    /**
     * 解锁关卡
     */
    public unlockLevel(levelId: number): void {
        this.unlockedLevels.add(levelId);
        this.saveGameData();
    }

    /**
     * 检查关卡是否解锁
     */
    public isLevelUnlocked(levelId: number): boolean {
        return this.unlockedLevels.has(levelId);
    }

    /**
     * 添加金币
     */
    public addCoins(amount: number): void {
        this.coins += amount;
        this.saveGameData();
    }

    /**
     * 获取金币数量
     */
    public getCoins(): number {
        return this.coins;
    }

    /**
     * 添加分数
     */
    public addScore(score: number): void {
        this.totalScore += score;
        this.saveGameData();
    }

    /**
     * 获取总分数
     */
    public getTotalScore(): number {
        return this.totalScore;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentLevel(levelId: number): void {
        this.currentLevel = levelId;
        this.saveGameData();
    }

    /**
     * 获取当前关卡
     */
    public getCurrentLevel(): number {
        return this.currentLevel;
    }
}

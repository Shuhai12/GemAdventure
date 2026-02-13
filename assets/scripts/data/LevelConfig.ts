/**
 * 关卡目标类型
 */
export enum LevelGoalType {
    COLLECT_GEMS = 'collect_gems',           // 收集特定宝石
    FILL_AREA = 'fill_area',                 // 填满特定区域
    RESCUE_SPIRITS = 'rescue_spirits',       // 解救精灵
    REACH_SCORE = 'reach_score',             // 达到目标分数
    CLEAR_OBSTACLES = 'clear_obstacles'      // 清除障碍物
}

/**
 * 关卡目标数据
 */
export interface LevelGoal {
    type: LevelGoalType;
    target: number;
    current: number;
    description: string;
}

/**
 * 关卡数据
 */
export interface LevelData {
    id: number;
    name: string;
    area: number;                    // 所属区域 (1-10)
    difficulty: number;              // 难度等级 (1-5)
    maxMoves: number;                // 最大步数
    goals: LevelGoal[];              // 关卡目标
    obstacles: string[];             // 障碍物类型
    specialGems: string[];           // 特殊宝石类型
    rewards: {                       // 奖励
        coins: number;
        items: string[];
    };
}

/**
 * 区域数据
 */
export interface AreaData {
    id: number;
    name: string;
    theme: string;
    description: string;
    levels: number[];                // 包含的关卡ID
}

/**
 * 关卡配置
 */
export class LevelConfig {
    /**
     * 区域配置
     */
    public static readonly AREAS: AreaData[] = [
        {
            id: 1,
            name: '神秘地宫',
            theme: 'dungeon',
            description: '幽灵宝石会在场上随机移动',
            levels: Array.from({ length: 20 }, (_, i) => i + 1)
        },
        {
            id: 2,
            name: '古老回廊',
            theme: 'corridor',
            description: '悠扬空灵的音乐回荡在回廊中',
            levels: Array.from({ length: 20 }, (_, i) => i + 21)
        },
        {
            id: 3,
            name: '禁忌宝库',
            theme: 'treasury',
            description: '需要按特定顺序消除宝石来解锁大门',
            levels: Array.from({ length: 20 }, (_, i) => i + 41)
        }
    ];

    /**
     * 生成关卡数据
     */
    public static generateLevel(levelId: number): LevelData {
        const areaId = Math.ceil(levelId / 20);
        const levelInArea = ((levelId - 1) % 20) + 1;
        const difficulty = Math.min(Math.ceil(levelInArea / 4), 5);

        return {
            id: levelId,
            name: `关卡 ${levelId}`,
            area: areaId,
            difficulty: difficulty,
            maxMoves: 30 - difficulty * 2,
            goals: this.generateGoals(difficulty),
            obstacles: this.generateObstacles(difficulty),
            specialGems: this.generateSpecialGems(difficulty),
            rewards: {
                coins: 100 * difficulty,
                items: []
            }
        };
    }

    /**
     * 生成关卡目标
     */
    private static generateGoals(difficulty: number): LevelGoal[] {
        const goals: LevelGoal[] = [];

        goals.push({
            type: LevelGoalType.REACH_SCORE,
            target: 1000 * difficulty,
            current: 0,
            description: `达到 ${1000 * difficulty} 分`
        });

        if (difficulty >= 2) {
            goals.push({
                type: LevelGoalType.COLLECT_GEMS,
                target: 10 + difficulty * 5,
                current: 0,
                description: `收集 ${10 + difficulty * 5} 个特殊宝石`
            });
        }

        return goals;
    }

    /**
     * 生成障碍物
     */
    private static generateObstacles(difficulty: number): string[] {
        const obstacles: string[] = [];

        if (difficulty >= 2) {
            obstacles.push('shadow_rock');
        }

        if (difficulty >= 3) {
            obstacles.push('frozen_gem');
        }

        return obstacles;
    }

    /**
     * 生成特殊宝石
     */
    private static generateSpecialGems(difficulty: number): string[] {
        const specialGems: string[] = [];

        if (difficulty >= 3) {
            specialGems.push('lightning');
        }

        if (difficulty >= 4) {
            specialGems.push('timewarp');
        }

        return specialGems;
    }
}

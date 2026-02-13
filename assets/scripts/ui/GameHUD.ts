import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 游戏 HUD 界面
 */
@ccclass('GameHUD')
export class GameHUD extends Component {
    @property(Label)
    private scoreLabel: Label = null;

    @property(Label)
    private movesLabel: Label = null;

    @property(Label)
    private goalLabel: Label = null;

    @property(Node)
    private itemContainer: Node = null;

    private currentScore: number = 0;
    private remainingMoves: number = 0;

    start() {
        this.updateUI();
    }

    /**
     * 更新分数
     */
    public updateScore(score: number): void {
        this.currentScore = score;
        if (this.scoreLabel) {
            this.scoreLabel.string = `分数: ${this.currentScore}`;
        }
    }

    /**
     * 更新剩余步数
     */
    public updateMoves(moves: number): void {
        this.remainingMoves = moves;
        if (this.movesLabel) {
            this.movesLabel.string = `步数: ${this.remainingMoves}`;
        }
    }

    /**
     * 更新目标显示
     */
    public updateGoal(goalText: string): void {
        if (this.goalLabel) {
            this.goalLabel.string = goalText;
        }
    }

    /**
     * 更新 UI
     */
    private updateUI(): void {
        this.updateScore(this.currentScore);
        this.updateMoves(this.remainingMoves);
    }
}

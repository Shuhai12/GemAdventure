import { _decorator, Component, Vec2 } from 'cc';
import { Gem, GemType } from './Gem';
const { ccclass, property } = _decorator;

/**
 * 游戏棋盘管理器
 */
@ccclass('GameBoard')
export class GameBoard extends Component {
    @property
    private rows: number = 8;

    @property
    private cols: number = 8;

    private board: Gem[][] = [];
    private selectedGem: Gem | null = null;

    start() {
        this.initBoard();
    }

    /**
     * 初始化棋盘
     */
    private initBoard(): void {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const gemType = this.getRandomGemType();
                // 这里需要实例化宝石节点，暂时创建数据
                this.board[row][col] = null;
            }
        }
    }

    /**
     * 获取随机宝石类型
     */
    private getRandomGemType(): GemType {
        const types = [
            GemType.RED,
            GemType.BLUE,
            GemType.GREEN,
            GemType.YELLOW,
            GemType.PURPLE,
            GemType.ORANGE
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * 选择宝石
     */
    public selectGem(gem: Gem): void {
        if (!this.selectedGem) {
            this.selectedGem = gem;
        } else {
            if (this.isAdjacent(this.selectedGem, gem)) {
                this.swapGems(this.selectedGem, gem);
            }
            this.selectedGem = null;
        }
    }

    /**
     * 判断两个宝石是否相邻
     */
    private isAdjacent(gem1: Gem, gem2: Gem): boolean {
        const pos1 = gem1.getPosition();
        const pos2 = gem2.getPosition();
        const rowDiff = Math.abs(pos1.row - pos2.row);
        const colDiff = Math.abs(pos1.col - pos2.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * 交换两个宝石
     */
    private swapGems(gem1: Gem, gem2: Gem): void {
        const pos1 = gem1.getPosition();
        const pos2 = gem2.getPosition();

        // 交换棋盘数据
        const temp = this.board[pos1.row][pos1.col];
        this.board[pos1.row][pos1.col] = this.board[pos2.row][pos2.col];
        this.board[pos2.row][pos2.col] = temp;

        // 更新宝石位置
        gem1.setPosition(pos2.row, pos2.col);
        gem2.setPosition(pos1.row, pos1.col);

        // 检查匹配
        this.checkMatches();
    }

    /**
     * 检查匹配
     */
    private checkMatches(): void {
        const matches: Gem[] = [];

        // 检查横向匹配
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 2; col++) {
                const gem1 = this.board[row][col];
                const gem2 = this.board[row][col + 1];
                const gem3 = this.board[row][col + 2];

                if (gem1 && gem2 && gem3 &&
                    gem1.getGemType() === gem2.getGemType() &&
                    gem2.getGemType() === gem3.getGemType()) {
                    if (!matches.includes(gem1)) matches.push(gem1);
                    if (!matches.includes(gem2)) matches.push(gem2);
                    if (!matches.includes(gem3)) matches.push(gem3);
                }
            }
        }

        // 检查纵向匹配
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows - 2; row++) {
                const gem1 = this.board[row][col];
                const gem2 = this.board[row + 1][col];
                const gem3 = this.board[row + 2][col];

                if (gem1 && gem2 && gem3 &&
                    gem1.getGemType() === gem2.getGemType() &&
                    gem2.getGemType() === gem3.getGemType()) {
                    if (!matches.includes(gem1)) matches.push(gem1);
                    if (!matches.includes(gem2)) matches.push(gem2);
                    if (!matches.includes(gem3)) matches.push(gem3);
                }
            }
        }

        if (matches.length > 0) {
            this.removeMatches(matches);
        }
    }

    /**
     * 移除匹配的宝石
     */
    private removeMatches(matches: Gem[]): void {
        for (const gem of matches) {
            const pos = gem.getPosition();
            this.board[pos.row][pos.col] = null;
            gem.node.destroy();
        }
        this.fillBoard();
    }

    /**
     * 填充棋盘
     */
    private fillBoard(): void {
        // 实现宝石下落和填充逻辑
        for (let col = 0; col < this.cols; col++) {
            for (let row = this.rows - 1; row >= 0; row--) {
                if (!this.board[row][col]) {
                    // 寻找上方的宝石下落
                    for (let r = row - 1; r >= 0; r--) {
                        if (this.board[r][col]) {
                            this.board[row][col] = this.board[r][col];
                            this.board[r][col] = null;
                            this.board[row][col].setPosition(row, col);
                            break;
                        }
                    }
                }
            }
        }
    }
}

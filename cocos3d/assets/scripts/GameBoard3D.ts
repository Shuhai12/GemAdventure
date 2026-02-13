import { _decorator, Component, Node, Prefab, instantiate, Vec3, Camera, geometry, PhysicsSystem, EventTouch, input, Input } from 'cc';
import { Gem3D } from './Gem3D';
const { ccclass, property } = _decorator;

/**
 * 3D游戏棋盘管理器
 */
@ccclass('GameBoard3D')
export class GameBoard3D extends Component {
    @property(Prefab)
    public gemPrefab: Prefab = null;

    @property(Camera)
    public mainCamera: Camera = null;

    @property
    public rows: number = 8;

    @property
    public cols: number = 8;

    @property
    public gemSpacing: number = 1.2;

    @property
    public gemColors: number = 6;

    private board: Gem3D[][] = [];
    private selectedGem: Gem3D = null;
    private isProcessing: boolean = false;

    start() {
        this.initBoard();
        this.registerInput();
    }

    /**
     * 初始化棋盘
     */
    initBoard() {
        // 清空现有棋盘
        this.board = [];
        this.node.removeAllChildren();

        // 创建棋盘
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.createGem(row, col);
            }
        }

        // 确保初始状态没有匹配
        this.removeInitialMatches();
    }

    /**
     * 创建宝石
     */
    createGem(row: number, col: number, gemType?: number): Gem3D {
        if (!this.gemPrefab) {
            console.error('Gem prefab not set!');
            return null;
        }

        const gemNode = instantiate(this.gemPrefab);
        const gem = gemNode.getComponent(Gem3D);

        if (!gem) {
            console.error('Gem3D component not found!');
            return null;
        }

        // 设置宝石类型
        if (gemType === undefined) {
            gem.gemType = Math.floor(Math.random() * this.gemColors);
        } else {
            gem.gemType = gemType;
        }

        gem.setGridPosition(row, col);

        // 计算世界坐标
        const worldPos = this.getWorldPosition(row, col);
        gemNode.setPosition(worldPos);

        gemNode.setParent(this.node);
        this.board[row][col] = gem;

        return gem;
    }

    /**
     * 获取世界坐标
     */
    getWorldPosition(row: number, col: number): Vec3 {
        const offsetX = (this.cols - 1) * this.gemSpacing / 2;
        const offsetZ = (this.rows - 1) * this.gemSpacing / 2;

        return new Vec3(
            col * this.gemSpacing - offsetX,
            0,
            row * this.gemSpacing - offsetZ
        );
    }

    /**
     * 注册输入事件
     */
    registerInput() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    /**
     * 触摸开始
     */
    onTouchStart(event: EventTouch) {
        if (this.isProcessing) return;

        const gem = this.getGemAtTouch(event);
        if (!gem) return;

        if (!this.selectedGem) {
            // 选中第一个宝石
            this.selectedGem = gem;
            gem.select();
        } else {
            // 选中第二个宝石，尝试交换
            if (this.selectedGem === gem) {
                // 点击同一个宝石，取消选中
                this.selectedGem.deselect();
                this.selectedGem = null;
            } else if (this.isAdjacent(this.selectedGem, gem)) {
                // 相邻宝石，尝试交换
                this.trySwap(this.selectedGem, gem);
            } else {
                // 不相邻，切换选中
                this.selectedGem.deselect();
                this.selectedGem = gem;
                gem.select();
            }
        }
    }

    /**
     * 获取触摸位置的宝石
     */
    getGemAtTouch(event: EventTouch): Gem3D {
        if (!this.mainCamera) return null;

        const ray = new geometry.Ray();
        this.mainCamera.screenPointToRay(event.getLocationX(), event.getLocationY(), ray);

        // 简单的射线检测
        let closestGem: Gem3D = null;
        let closestDistance = Infinity;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const gem = this.board[row][col];
                if (!gem) continue;

                const gemPos = gem.node.worldPosition;
                const distance = Vec3.distance(ray.o, gemPos);

                // 简化的碰撞检测
                if (distance < closestDistance && distance < 10) {
                    const toGem = new Vec3();
                    Vec3.subtract(toGem, gemPos, ray.o);
                    toGem.normalize();

                    const dot = Vec3.dot(ray.d, toGem);
                    if (dot > 0.9) { // 角度阈值
                        closestGem = gem;
                        closestDistance = distance;
                    }
                }
            }
        }

        return closestGem;
    }

    /**
     * 判断两个宝石是否相邻
     */
    isAdjacent(gem1: Gem3D, gem2: Gem3D): boolean {
        const pos1 = gem1.getGridPosition();
        const pos2 = gem2.getGridPosition();

        const rowDiff = Math.abs(pos1.row - pos2.row);
        const colDiff = Math.abs(pos1.col - pos2.col);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * 尝试交换宝石
     */
    async trySwap(gem1: Gem3D, gem2: Gem3D) {
        this.isProcessing = true;

        const pos1 = gem1.getGridPosition();
        const pos2 = gem2.getGridPosition();

        // 交换棋盘数据
        this.board[pos1.row][pos1.col] = gem2;
        this.board[pos2.row][pos2.col] = gem1;
        gem1.setGridPosition(pos2.row, pos2.col);
        gem2.setGridPosition(pos1.row, pos1.col);

        // 播放交换动画
        await new Promise<void>(resolve => {
            gem1.swapWith(gem2, () => resolve());
        });

        // 检查匹配
        const matches1 = this.findMatches(pos2.row, pos2.col);
        const matches2 = this.findMatches(pos1.row, pos1.col);
        const allMatches = [...matches1, ...matches2];

        if (allMatches.length > 0) {
            // 有匹配，消除宝石
            gem1.deselect();
            gem2.deselect();
            this.selectedGem = null;

            await this.eliminateMatches(allMatches);
            await this.fillBoard();
        } else {
            // 无匹配，交换回去
            this.board[pos1.row][pos1.col] = gem1;
            this.board[pos2.row][pos2.col] = gem2;
            gem1.setGridPosition(pos1.row, pos1.col);
            gem2.setGridPosition(pos2.row, pos2.col);

            await new Promise<void>(resolve => {
                gem1.swapWith(gem2, () => resolve());
            });

            gem1.deselect();
            this.selectedGem = null;
        }

        this.isProcessing = false;
    }

    /**
     * 查找匹配
     */
    findMatches(row: number, col: number): Gem3D[] {
        const gem = this.board[row][col];
        if (!gem) return [];

        const matches: Set<Gem3D> = new Set();

        // 横向匹配
        const horizontal = [gem];
        for (let c = col - 1; c >= 0 && this.board[row][c]?.gemType === gem.gemType; c--) {
            horizontal.unshift(this.board[row][c]);
        }
        for (let c = col + 1; c < this.cols && this.board[row][c]?.gemType === gem.gemType; c++) {
            horizontal.push(this.board[row][c]);
        }
        if (horizontal.length >= 3) {
            horizontal.forEach(g => matches.add(g));
        }

        // 纵向匹配
        const vertical = [gem];
        for (let r = row - 1; r >= 0 && this.board[r][col]?.gemType === gem.gemType; r--) {
            vertical.unshift(this.board[r][col]);
        }
        for (let r = row + 1; r < this.rows && this.board[r][col]?.gemType === gem.gemType; r++) {
            vertical.push(this.board[r][col]);
        }
        if (vertical.length >= 3) {
            vertical.forEach(g => matches.add(g));
        }

        return Array.from(matches);
    }

    /**
     * 消除匹配的宝石
     */
    async eliminateMatches(matches: Gem3D[]) {
        await Promise.all(matches.map(gem => {
            return new Promise<void>(resolve => {
                const pos = gem.getGridPosition();
                this.board[pos.row][pos.col] = null;
                gem.eliminate(() => {
                    gem.node.destroy();
                    resolve();
                });
            });
        }));
    }

    /**
     * 填充棋盘
     */
    async fillBoard() {
        // 下落现有宝石
        for (let col = 0; col < this.cols; col++) {
            let emptyRow = this.rows - 1;
            for (let row = this.rows - 1; row >= 0; row--) {
                if (this.board[row][col]) {
                    if (row !== emptyRow) {
                        const gem = this.board[row][col];
                        this.board[row][col] = null;
                        this.board[emptyRow][col] = gem;
                        gem.setGridPosition(emptyRow, col);

                        const targetPos = this.getWorldPosition(emptyRow, col);
                        gem.moveTo(targetPos, 0.3);
                    }
                    emptyRow--;
                }
            }

            // 创建新宝石
            for (let row = emptyRow; row >= 0; row--) {
                this.createGem(row, col);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        // 检查新的匹配
        const newMatches = this.findAllMatches();
        if (newMatches.length > 0) {
            await this.eliminateMatches(newMatches);
            await this.fillBoard();
        }
    }

    /**
     * 查找所有匹配
     */
    findAllMatches(): Gem3D[] {
        const allMatches: Set<Gem3D> = new Set();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const matches = this.findMatches(row, col);
                matches.forEach(gem => allMatches.add(gem));
            }
        }

        return Array.from(allMatches);
    }

    /**
     * 移除初始匹配
     */
    removeInitialMatches() {
        let hasMatches = true;
        let iterations = 0;
        const maxIterations = 100;

        while (hasMatches && iterations < maxIterations) {
            hasMatches = false;
            iterations++;

            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const matches = this.findMatches(row, col);
                    if (matches.length > 0) {
                        hasMatches = true;
                        const gem = this.board[row][col];
                        gem.node.destroy();
                        this.createGem(row, col);
                    }
                }
            }
        }
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }
}

import { _decorator, Component, Node, Vec3, tween, MeshRenderer, Material, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 3D宝石组件
 */
@ccclass('Gem3D')
export class Gem3D extends Component {
    @property
    public gemType: number = 0; // 宝石类型 (0-6)

    @property
    public row: number = 0;

    @property
    public col: number = 0;

    private meshRenderer: MeshRenderer = null;
    private isSelected: boolean = false;
    private originalScale: Vec3 = new Vec3(1, 1, 1);

    // 宝石颜色配置
    private static readonly GEM_COLORS: Color[] = [
        new Color(255, 0, 0, 255),      // 红色
        new Color(0, 255, 0, 255),      // 绿色
        new Color(0, 0, 255, 255),      // 蓝色
        new Color(255, 255, 0, 255),    // 黄色
        new Color(255, 0, 255, 255),    // 紫色
        new Color(0, 255, 255, 255),    // 青色
        new Color(255, 128, 0, 255)     // 橙色
    ];

    start() {
        this.meshRenderer = this.getComponent(MeshRenderer);
        this.originalScale = this.node.scale.clone();
        this.updateColor();
        this.playSpawnAnimation();
    }

    /**
     * 更新宝石颜色
     */
    updateColor() {
        if (this.meshRenderer && this.gemType >= 0 && this.gemType < Gem3D.GEM_COLORS.length) {
            const material = this.meshRenderer.material;
            if (material) {
                material.setProperty('mainColor', Gem3D.GEM_COLORS[this.gemType]);
            }
        }
    }

    /**
     * 生成动画
     */
    playSpawnAnimation() {
        const startPos = this.node.position.clone();
        startPos.y += 5;
        this.node.setPosition(startPos);
        this.node.setScale(0, 0, 0);

        tween(this.node)
            .to(0.3, {
                position: new Vec3(this.node.position.x, this.node.position.y - 5, this.node.position.z),
                scale: this.originalScale
            }, { easing: 'backOut' })
            .start();
    }

    /**
     * 选中动画
     */
    select() {
        if (this.isSelected) return;
        this.isSelected = true;

        const targetScale = this.originalScale.clone().multiplyScalar(1.2);
        tween(this.node)
            .to(0.2, { scale: targetScale }, { easing: 'sineOut' })
            .start();

        // 添加旋转动画
        tween(this.node)
            .by(0.5, { eulerAngles: new Vec3(0, 360, 0) })
            .repeatForever()
            .start();
    }

    /**
     * 取消选中
     */
    deselect() {
        if (!this.isSelected) return;
        this.isSelected = false;

        this.node.stopAllActions();
        tween(this.node)
            .to(0.2, {
                scale: this.originalScale,
                eulerAngles: new Vec3(0, 0, 0)
            }, { easing: 'sineOut' })
            .start();
    }

    /**
     * 移动到指定位置
     */
    moveTo(targetPos: Vec3, duration: number = 0.3, callback?: Function) {
        tween(this.node)
            .to(duration, { position: targetPos }, { easing: 'sineInOut' })
            .call(() => {
                if (callback) callback();
            })
            .start();
    }

    /**
     * 消除动画
     */
    eliminate(callback?: Function) {
        // 缩放消失
        tween(this.node)
            .to(0.2, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
            .call(() => {
                if (callback) callback();
            })
            .start();

        // 旋转加速
        tween(this.node)
            .by(0.2, { eulerAngles: new Vec3(0, 720, 0) })
            .start();
    }

    /**
     * 交换动画
     */
    swapWith(targetGem: Gem3D, callback?: Function) {
        const myPos = this.node.position.clone();
        const targetPos = targetGem.node.position.clone();

        let completed = 0;
        const onComplete = () => {
            completed++;
            if (completed === 2 && callback) {
                callback();
            }
        };

        this.moveTo(targetPos, 0.3, onComplete);
        targetGem.moveTo(myPos, 0.3, onComplete);
    }

    /**
     * 获取网格位置
     */
    getGridPosition(): { row: number, col: number } {
        return { row: this.row, col: this.col };
    }

    /**
     * 设置网格位置
     */
    setGridPosition(row: number, col: number) {
        this.row = row;
        this.col = col;
    }
}

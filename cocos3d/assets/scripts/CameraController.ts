import { _decorator, Component, Node, Vec3, input, Input, EventTouch, Camera } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 相机控制器 - 支持旋转和缩放
 */
@ccclass('CameraController')
export class CameraController extends Component {
    @property(Node)
    public target: Node = null; // 相机注视目标

    @property
    public distance: number = 15; // 相机距离

    @property
    public minDistance: number = 8;

    @property
    public maxDistance: number = 25;

    @property
    public rotationSpeed: number = 0.5;

    @property
    public zoomSpeed: number = 0.5;

    @property
    public smoothTime: number = 0.1;

    private currentRotation: Vec3 = new Vec3(-30, 45, 0); // 初始角度
    private targetRotation: Vec3 = new Vec3(-30, 45, 0);
    private currentDistance: number = 15;
    private targetDistance: number = 15;

    private isDragging: boolean = false;
    private lastTouchPos: Vec3 = new Vec3();

    start() {
        this.currentDistance = this.distance;
        this.targetDistance = this.distance;
        this.updateCameraPosition();
        this.registerInput();
    }

    update(deltaTime: number) {
        // 平滑旋转
        Vec3.lerp(this.currentRotation, this.currentRotation, this.targetRotation, this.smoothTime);

        // 平滑缩放
        this.currentDistance += (this.targetDistance - this.currentDistance) * this.smoothTime;

        this.updateCameraPosition();
    }

    /**
     * 更新相机位置
     */
    updateCameraPosition() {
        if (!this.target) return;

        const rad = Math.PI / 180;
        const theta = this.currentRotation.y * rad;
        const phi = this.currentRotation.x * rad;

        const x = this.currentDistance * Math.cos(phi) * Math.sin(theta);
        const y = this.currentDistance * Math.sin(phi);
        const z = this.currentDistance * Math.cos(phi) * Math.cos(theta);

        const targetPos = this.target.worldPosition;
        this.node.setWorldPosition(
            targetPos.x + x,
            targetPos.y + y,
            targetPos.z + z
        );

        // 相机看向目标
        this.node.lookAt(targetPos);
    }

    /**
     * 注册输入事件
     */
    registerInput() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    onTouchStart(event: EventTouch) {
        // 检查是否是右键或双指
        if (event.getButton() === 2 || event.getTouches().length > 1) {
            this.isDragging = true;
            const location = event.getLocation();
            this.lastTouchPos.set(location.x, location.y, 0);
        }
    }

    onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;

        const location = event.getLocation();
        const deltaX = location.x - this.lastTouchPos.x;
        const deltaY = location.y - this.lastTouchPos.y;

        // 更新目标旋转
        this.targetRotation.y += deltaX * this.rotationSpeed;
        this.targetRotation.x -= deltaY * this.rotationSpeed;

        // 限制俯仰角
        this.targetRotation.x = Math.max(-89, Math.min(89, this.targetRotation.x));

        this.lastTouchPos.set(location.x, location.y, 0);
    }

    onTouchEnd(event: EventTouch) {
        this.isDragging = false;
    }

    onMouseWheel(event: any) {
        const scrollY = event.getScrollY();
        this.targetDistance -= scrollY * this.zoomSpeed;
        this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance));
    }

    /**
     * 重置相机
     */
    resetCamera() {
        this.targetRotation.set(-30, 45, 0);
        this.targetDistance = this.distance;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }
}

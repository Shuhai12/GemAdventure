import { _decorator, Component, Node, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 主菜单界面
 */
@ccclass('MainMenu')
export class MainMenu extends Component {
    @property(Node)
    private startButton: Node = null;

    @property(Node)
    private levelSelectButton: Node = null;

    @property(Node)
    private bagButton: Node = null;

    @property(Node)
    private socialButton: Node = null;

    @property(Node)
    private settingsButton: Node = null;

    @property(Label)
    private titleLabel: Label = null;

    start() {
        this.initButtons();
        if (this.titleLabel) {
            this.titleLabel.string = '幻彩宝石大冒险';
        }
    }

    /**
     * 初始化按钮
     */
    private initButtons(): void {
        if (this.startButton) {
            this.startButton.on(Button.EventType.CLICK, this.onStartGame, this);
        }

        if (this.levelSelectButton) {
            this.levelSelectButton.on(Button.EventType.CLICK, this.onLevelSelect, this);
        }

        if (this.bagButton) {
            this.bagButton.on(Button.EventType.CLICK, this.onOpenBag, this);
        }

        if (this.socialButton) {
            this.socialButton.on(Button.EventType.CLICK, this.onOpenSocial, this);
        }

        if (this.settingsButton) {
            this.settingsButton.on(Button.EventType.CLICK, this.onOpenSettings, this);
        }
    }

    /**
     * 开始游戏
     */
    private onStartGame(): void {
        console.log('开始游戏');
        // 加载游戏场景
    }

    /**
     * 关卡选择
     */
    private onLevelSelect(): void {
        console.log('关卡选择');
    }

    /**
     * 打开背包
     */
    private onOpenBag(): void {
        console.log('打开背包');
    }

    /**
     * 打开社交
     */
    private onOpenSocial(): void {
        console.log('打开社交');
    }

    /**
     * 打开设置
     */
    private onOpenSettings(): void {
        console.log('打开设置');
    }
}

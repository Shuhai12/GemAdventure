import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 音频管理器
 */
@ccclass('AudioManager')
export class AudioManager extends Component {
    private static instance: AudioManager = null;

    @property(AudioSource)
    private bgmSource: AudioSource = null;

    @property(AudioSource)
    private sfxSource: AudioSource = null;

    @property
    private bgmVolume: number = 0.5;

    @property
    private sfxVolume: number = 0.8;

    public static getInstance(): AudioManager {
        return this.instance;
    }

    onLoad() {
        if (AudioManager.instance === null) {
            AudioManager.instance = this;
        }
    }

    /**
     * 播放背景音乐
     */
    public playBGM(clip: AudioClip, loop: boolean = true): void {
        if (this.bgmSource && clip) {
            this.bgmSource.clip = clip;
            this.bgmSource.loop = loop;
            this.bgmSource.volume = this.bgmVolume;
            this.bgmSource.play();
        }
    }

    /**
     * 停止背景音乐
     */
    public stopBGM(): void {
        if (this.bgmSource) {
            this.bgmSource.stop();
        }
    }

    /**
     * 播放音效
     */
    public playSFX(clip: AudioClip): void {
        if (this.sfxSource && clip) {
            this.sfxSource.playOneShot(clip, this.sfxVolume);
        }
    }

    /**
     * 设置背景音乐音量
     */
    public setBGMVolume(volume: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmSource) {
            this.bgmSource.volume = this.bgmVolume;
        }
    }

    /**
     * 设置音效音量
     */
    public setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}

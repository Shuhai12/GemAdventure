import { _decorator, Component, Node, ParticleSystem, Vec3, Color } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 粒子特效管理器
 */
@ccclass('ParticleEffects')
export class ParticleEffects extends Component {
    @property(ParticleSystem)
    public explosionParticle: ParticleSystem = null;

    @property(ParticleSystem)
    public sparkleParticle: ParticleSystem = null;

    /**
     * 播放爆炸特效
     */
    playExplosion(position: Vec3, color: Color) {
        if (!this.explosionParticle) return;

        const particle = this.explosionParticle;
        particle.node.setWorldPosition(position);

        // 设置粒子颜色
        const colorModule = particle.colorOverLifetime;
        if (colorModule) {
            // 这里可以设置粒子颜色渐变
        }

        particle.play();
    }

    /**
     * 播放闪光特效
     */
    playSparkle(position: Vec3) {
        if (!this.sparkleParticle) return;

        const particle = this.sparkleParticle;
        particle.node.setWorldPosition(position);
        particle.play();
    }

    /**
     * 创建连击特效
     */
    playComboEffect(position: Vec3, comboCount: number) {
        // 根据连击数播放不同强度的特效
        for (let i = 0; i < comboCount; i++) {
            this.scheduleOnce(() => {
                this.playSparkle(position);
            }, i * 0.1);
        }
    }
}

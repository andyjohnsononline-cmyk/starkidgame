import Phaser from 'phaser';
import { QuestionUI } from '../ui/QuestionUI';
import { audioManager } from '../systems/AudioManager';
import { STAR_COLORS } from '../utils/colors';

export class WinScene extends Phaser.Scene {
  private questionUI: QuestionUI | null = null;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor() {
    super({ key: 'WinScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000, 5, 5, 16);

    this.createColorSwirl();
    this.createStarKidCenter();

    audioManager.playQuestionMoment();

    this.time.delayedCall(3000, () => {
      this.questionUI = new QuestionUI(() => {
        this.onQuestionComplete();
      });
    });
  }

  private createColorSwirl(): void {
    const cx = 512, cy = 384;

    for (const cfg of STAR_COLORS) {
      const emitter = this.add.particles(cx, cy, 'particle', {
        speed: { min: 20, max: 60 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 3000,
        frequency: 100,
        tint: cfg.hex,
        blendMode: 'ADD',
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
      });
      this.particles.push(emitter);
    }
  }

  private createStarKidCenter(): void {
    const starkid = this.add.sprite(512, 320, 'starkid');
    starkid.setScale(2.5);
    starkid.setAlpha(0);

    const glow = this.add.sprite(512, 320, 'starkid');
    glow.setScale(4);
    glow.setAlpha(0);
    glow.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: starkid,
      alpha: 1,
      duration: 2000,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: glow,
      alpha: 0.2,
      duration: 2000,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: glow,
      scale: { from: 3.5, to: 5 },
      alpha: { from: 0.2, to: 0.08 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Gentle float
    this.tweens.add({
      targets: starkid,
      y: { from: 315, to: 325 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private onQuestionComplete(): void {
    this.cameras.main.fadeOut(4000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.questionUI?.destroy();

      // Show a gentle "The End" message
      const endText = this.add.text(512, 384, '✦', {
        fontSize: '48px',
        color: '#ffeedd',
        align: 'center',
      });
      endText.setOrigin(0.5);
      endText.setAlpha(0);
      this.cameras.main.fadeIn(2000, 0, 0, 0);
      this.tweens.add({
        targets: endText,
        alpha: 0.6,
        duration: 3000,
        ease: 'Sine.easeInOut',
      });
    });
  }
}

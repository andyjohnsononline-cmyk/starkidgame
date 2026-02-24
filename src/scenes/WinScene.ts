import Phaser from 'phaser';
import { QuestionUI } from '../ui/QuestionUI';
import { audioManager } from '../systems/AudioManager';
import { STAR_COLORS } from '../utils/colors';

interface OrbitStar {
  sprite: Phaser.GameObjects.Image;
  radius: number;
  speed: number;
  phase: number;
  baseAlpha: number;
  pulseSpeed: number;
}

export class WinScene extends Phaser.Scene {
  private questionUI: QuestionUI | null = null;
  private orbitStars: OrbitStar[] = [];
  private emanateEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor() {
    super({ key: 'WinScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    this.createEmanatingStars();
    this.createGlowingStars();
    this.createStarKidCenter();

    audioManager.playQuestionMoment();

    this.time.delayedCall(3000, () => {
      this.questionUI = new QuestionUI(
        () => { this.onQuestionComplete(); },
        () => { this.startRainbowSlide(); },
      );
    });
  }

  update(time: number): void {
    const t = time / 1000;

    const cx = 512, cy = 320;
    for (const star of this.orbitStars) {
      const angle = t * star.speed + star.phase;
      star.sprite.setPosition(
        cx + Math.cos(angle) * star.radius,
        cy + Math.sin(angle) * star.radius,
      );
      const pulse = star.baseAlpha * (0.5 + 0.5 * Math.sin(t * star.pulseSpeed + star.phase));
      star.sprite.setAlpha(pulse);
    }
  }

  private createEmanatingStars(): void {
    const cx = 512, cy = 320;
    const tints = STAR_COLORS.map(c => c.hex);

    this.emanateEmitter = this.add.particles(cx, cy, 'particle', {
      speed: { min: 30, max: 100 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 3000,
      frequency: 120,
      tint: tints,
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
    });
    this.emanateEmitter.setDepth(0);
  }

  private createGlowingStars(): void {
    const cx = 512, cy = 320;
    const starKeys = STAR_COLORS.map(c => `star_${c.color}`);
    const starCount = 18;

    for (let i = 0; i < starCount; i++) {
      const radius = 80 + Math.random() * 160;
      const speed = 0.15 + Math.random() * 0.35;
      const phase = (i / starCount) * Math.PI * 2 + Math.random() * 0.5;
      const baseAlpha = 0.4 + Math.random() * 0.5;
      const key = starKeys[i % starKeys.length];

      const star = this.add.image(cx, cy, key);
      star.setScale(0.3 + Math.random() * 0.5);
      star.setAlpha(0);
      star.setBlendMode(Phaser.BlendModes.ADD);
      star.setDepth(1);

      this.tweens.add({
        targets: star,
        alpha: baseAlpha,
        duration: 2000 + Math.random() * 1000,
        delay: Math.random() * 500,
        ease: 'Sine.easeIn',
      });

      this.orbitStars.push({
        sprite: star,
        radius,
        speed: speed * (Math.random() > 0.5 ? 1 : -1),
        phase,
        baseAlpha,
        pulseSpeed: 1.5 + Math.random() * 2,
      });
    }
  }

  private createStarKidCenter(): void {
    const glow = this.add.sprite(512, 320, 'starkid');
    glow.setScale(4);
    glow.setAlpha(0);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(2);

    const starkid = this.add.sprite(512, 320, 'starkid');
    starkid.setScale(2.5);
    starkid.setAlpha(0);
    starkid.setDepth(3);

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
      this.emanateEmitter?.destroy();

      for (const star of this.orbitStars) {
        star.sprite.destroy();
      }
      this.orbitStars = [];

      const endText = this.add.text(512, 360, '\u2726', {
        fontSize: '48px',
        color: '#ffeedd',
        align: 'center',
      });
      endText.setOrigin(0.5);
      endText.setAlpha(0);

      const playAgain = this.add.text(512, 440, 'Play Again', {
        fontSize: '18px',
        fontFamily: 'Georgia, serif',
        color: '#8899aa',
        align: 'center',
      });
      playAgain.setOrigin(0.5);
      playAgain.setAlpha(0);
      playAgain.setInteractive({ useHandCursor: true });
      playAgain.on('pointerover', () => playAgain.setColor('#ffd700'));
      playAgain.on('pointerout', () => playAgain.setColor('#8899aa'));
      playAgain.on('pointerdown', () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('GameScene');
        });
      });

      this.cameras.main.fadeIn(2000, 0, 0, 0);
      this.tweens.add({
        targets: endText,
        alpha: 0.6,
        duration: 3000,
        ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: playAgain,
        alpha: 0.8,
        delay: 3000,
        duration: 2000,
        ease: 'Sine.easeInOut',
      });
    });
  }

  private startRainbowSlide(): void {
    this.questionUI?.destroy();
    this.questionUI = null;

    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.emanateEmitter?.destroy();
      this.emanateEmitter = null;

      for (const star of this.orbitStars) {
        star.sprite.destroy();
      }
      this.orbitStars = [];

      this.scene.start('FriendshipScene');
    });
  }
}

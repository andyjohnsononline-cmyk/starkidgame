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
  private rainbowSlideActive = false;
  private slideGraphics: Phaser.GameObjects.Graphics | null = null;
  private slideTime = 0;
  private astronautSlider: Phaser.GameObjects.Sprite | null = null;
  private starkidSlider: Phaser.GameObjects.Sprite | null = null;
  private slideTrailEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor() {
    super({ key: 'WinScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    this.rainbowSlideActive = false;
    this.slideTime = 0;

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

    if (this.rainbowSlideActive) {
      this.updateRainbowSlide(t);
      return;
    }

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
    this.emanateEmitter?.destroy();
    this.emanateEmitter = null;

    for (const star of this.orbitStars) {
      this.tweens.add({
        targets: star.sprite,
        alpha: 0,
        duration: 1000,
        onComplete: () => star.sprite.destroy(),
      });
    }
    this.orbitStars = [];

    this.tweens.getTweens().forEach((tw: Phaser.Tweens.Tween) => {
      const targets = tw.targets;
      if (targets && targets.length > 0) {
        const tgt = targets[0] as Phaser.GameObjects.Sprite;
        if (tgt?.texture?.key === 'starkid') {
          tw.stop();
          this.tweens.add({ targets: tgt, alpha: 0, duration: 1000, onComplete: () => tgt.destroy() });
        }
      }
    });

    this.time.delayedCall(1200, () => {
      this.rainbowSlideActive = true;
      this.slideTime = 0;

      this.slideGraphics = this.add.graphics();
      this.slideGraphics.setDepth(5);

      this.starkidSlider = this.add.sprite(0, 0, 'starkid');
      this.starkidSlider.setScale(1.5);
      this.starkidSlider.setDepth(10);

      this.astronautSlider = this.add.sprite(0, 0, 'astronaut');
      this.astronautSlider.setScale(1.2);
      this.astronautSlider.setDepth(11);

      const colors = STAR_COLORS.map(c => c.hex);
      for (let i = 0; i < 2; i++) {
        const emitter = this.add.particles(0, 0, 'particle', {
          speed: { min: 20, max: 60 },
          scale: { start: 0.5, end: 0 },
          alpha: { start: 0.6, end: 0 },
          lifespan: 800,
          frequency: 30,
          tint: colors,
          blendMode: 'ADD',
          emitting: true,
        });
        emitter.setDepth(9);
        this.slideTrailEmitters.push(emitter);
      }
    });
  }

  private getSlidePoint(progress: number): { x: number; y: number } {
    const baseX = 100 + progress * 1800;
    const baseY = 200 + progress * 350;
    const wave = Math.sin(progress * Math.PI * 3) * 120;
    const dip = Math.sin(progress * Math.PI * 5) * 40;
    return { x: baseX % 1024, y: baseY + wave + dip };
  }

  private updateRainbowSlide(t: number): void {
    this.slideTime += 0.004;

    if (!this.slideGraphics) return;
    this.slideGraphics.clear();

    const bandWidth = 4;
    const numBands = STAR_COLORS.length;

    for (let b = 0; b < numBands; b++) {
      const cfg = STAR_COLORS[b];
      const offset = (b - numBands / 2) * bandWidth;
      this.slideGraphics.lineStyle(bandWidth, cfg.hex, 0.8);
      this.slideGraphics.beginPath();

      let first = true;
      for (let s = 0; s <= 200; s++) {
        const progress = (s / 200 + this.slideTime) % 3;
        const pt = this.getSlidePoint(progress);
        const perpAngleNext = this.getSlidePoint(progress + 0.01);
        const dx = perpAngleNext.x - pt.x;
        const dy = perpAngleNext.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const px = pt.x + nx * offset;
        const py = pt.y + ny * offset;

        if (first) {
          this.slideGraphics.moveTo(px, py);
          first = false;
        } else {
          this.slideGraphics.lineTo(px, py);
        }
      }
      this.slideGraphics.strokePath();
    }

    const starkidProgress = (0.45 + this.slideTime) % 3;
    const astronautProgress = (0.40 + this.slideTime) % 3;

    const skPt = this.getSlidePoint(starkidProgress);
    const astPt = this.getSlidePoint(astronautProgress);

    if (this.starkidSlider) {
      this.starkidSlider.setPosition(skPt.x, skPt.y);
    }
    if (this.astronautSlider) {
      this.astronautSlider.setPosition(astPt.x, astPt.y);
    }

    if (this.slideTrailEmitters[0]) {
      this.slideTrailEmitters[0].setPosition(skPt.x, skPt.y);
    }
    if (this.slideTrailEmitters[1]) {
      this.slideTrailEmitters[1].setPosition(astPt.x, astPt.y);
    }
  }
}

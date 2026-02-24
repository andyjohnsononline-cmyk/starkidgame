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
  private glowGraphics: Phaser.GameObjects.Graphics | null = null;
  private slideTime = 0;
  private astronautSlider: Phaser.GameObjects.Sprite | null = null;
  private starkidSlider: Phaser.GameObjects.Sprite | null = null;
  private slideTrailEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private astronautProgress = 0;
  private astronautVelocity = 0.0008;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasdKeys: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private bgOverlay: Phaser.GameObjects.Graphics | null = null;
  private twinkleStars: { x: number; y: number; phase: number; speed: number }[] = [];
  private friendshipText: Phaser.GameObjects.Text | null = null;
  private companionTrailEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor() {
    super({ key: 'WinScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#050510');
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    this.rainbowSlideActive = false;
    this.slideTime = 0;
    this.astronautProgress = 0;
    this.astronautVelocity = 0.0008;
    this.slideTrailEmitters = [];
    this.twinkleStars = [];

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

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    this.time.delayedCall(1200, () => {
      this.rainbowSlideActive = true;
      this.slideTime = 0;
      this.astronautProgress = 0.40;
      this.astronautVelocity = 0.0008;

      this.bgOverlay = this.add.graphics();
      this.bgOverlay.setDepth(0);

      for (let i = 0; i < 40; i++) {
        this.twinkleStars.push({
          x: Math.random() * 1024,
          y: Math.random() * 768,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 2,
        });
      }

      this.glowGraphics = this.add.graphics();
      this.glowGraphics.setDepth(4);

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
          speed: { min: 20, max: 80 },
          scale: { start: 0.6, end: 0 },
          alpha: { start: 0.7, end: 0 },
          lifespan: 1000,
          frequency: 25,
          tint: colors,
          blendMode: 'ADD',
          emitting: true,
        });
        emitter.setDepth(9);
        this.slideTrailEmitters.push(emitter);
      }

      this.companionTrailEmitter = this.add.particles(0, 0, 'particle', {
        speed: { min: 5, max: 30 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.5, end: 0 },
        lifespan: 800,
        frequency: 40,
        tint: [0xffd700, 0xffcc00, 0xffe066],
        blendMode: 'ADD',
        emitting: true,
      });
      this.companionTrailEmitter.setDepth(9);

      this.friendshipText = this.add.text(512, 120, '"Of course we can be friends."', {
        fontSize: '24px',
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        color: '#ffeedd',
        align: 'center',
        shadow: {
          offsetX: 0, offsetY: 0,
          color: 'rgba(255,215,100,0.5)',
          blur: 30,
          fill: true,
        },
      });
      this.friendshipText.setOrigin(0.5);
      this.friendshipText.setAlpha(0);
      this.friendshipText.setDepth(20);

      this.tweens.add({
        targets: this.friendshipText,
        alpha: 0.85,
        duration: 2000,
        delay: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.tweens.add({
            targets: this.friendshipText,
            alpha: 0.3,
            duration: 4000,
            delay: 3000,
            ease: 'Sine.easeInOut',
          });
        },
      });
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
    this.slideTime += 0.001;

    // Player input for astronaut
    const accel = 0.00003;
    const friction = 0.995;
    const minSpeed = 0.0002;
    const maxSpeed = 0.003;
    let inputDir = 0;

    if (this.cursors) {
      if (this.cursors.right.isDown || this.wasdKeys?.D.isDown) inputDir += 1;
      if (this.cursors.left.isDown || this.wasdKeys?.A.isDown) inputDir -= 1;
      if (this.cursors.down.isDown || this.wasdKeys?.S.isDown) inputDir += 1;
      if (this.cursors.up.isDown || this.wasdKeys?.W.isDown) inputDir -= 1;
    }

    if (inputDir !== 0) {
      this.astronautVelocity += inputDir * accel;
    }
    this.astronautVelocity *= friction;
    this.astronautVelocity = Math.max(minSpeed, Math.min(maxSpeed, this.astronautVelocity));
    this.astronautProgress += this.astronautVelocity;

    // Background brightening as time progresses
    const brightProgress = Math.min(this.slideTime / 0.15, 1);
    if (this.bgOverlay) {
      this.bgOverlay.clear();
      const r = Math.floor(5 + brightProgress * 15);
      const g = Math.floor(5 + brightProgress * 8);
      const b = Math.floor(16 + brightProgress * 30);
      this.bgOverlay.fillStyle(Phaser.Display.Color.GetColor(r, g, b), brightProgress * 0.4);
      this.bgOverlay.fillRect(0, 0, 1024, 768);

      // Twinkle stars that fade in
      for (const star of this.twinkleStars) {
        const twinkle = 0.3 + 0.7 * Math.sin(t * star.speed + star.phase);
        const starAlpha = brightProgress * twinkle * 0.6;
        this.bgOverlay.fillStyle(0xffffff, starAlpha);
        this.bgOverlay.fillCircle(star.x, star.y, 1.5);
      }
    }

    if (!this.slideGraphics || !this.glowGraphics) return;
    this.slideGraphics.clear();
    this.glowGraphics.clear();

    const bandWidth = 14;
    const numBands = STAR_COLORS.length;

    // Glow layer behind rainbow (additive feel via low-alpha wide bands)
    for (let b = 0; b < numBands; b++) {
      const cfg = STAR_COLORS[b];
      const offset = (b - numBands / 2) * bandWidth;
      this.glowGraphics.lineStyle(bandWidth * 3, cfg.hex, 0.08 + brightProgress * 0.06);
      this.glowGraphics.beginPath();

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
          this.glowGraphics.moveTo(px, py);
          first = false;
        } else {
          this.glowGraphics.lineTo(px, py);
        }
      }
      this.glowGraphics.strokePath();
    }

    // Main rainbow bands
    for (let b = 0; b < numBands; b++) {
      const cfg = STAR_COLORS[b];
      const offset = (b - numBands / 2) * bandWidth;
      this.slideGraphics.lineStyle(bandWidth, cfg.hex, 0.9 + brightProgress * 0.1);
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

    const speedRatio = (this.astronautVelocity - minSpeed) / (maxSpeed - minSpeed);
    const companionOffset = 0.04 + speedRatio * 0.03;
    const starkidProgress = (this.astronautProgress + companionOffset) % 3;
    const astronautProg = this.astronautProgress % 3;

    const skPt = this.getSlidePoint(starkidProgress);
    const astPt = this.getSlidePoint(astronautProg);

    if (this.astronautSlider) {
      this.astronautSlider.setPosition(astPt.x, astPt.y);
      const tilt = (this.astronautVelocity - 0.0008) * 8000;
      this.astronautSlider.setRotation(Phaser.Math.Clamp(tilt, -0.3, 0.3));
      const bob = Math.sin(t * 3) * 3;
      this.astronautSlider.y += bob;
    }

    if (this.starkidSlider) {
      this.starkidSlider.setPosition(skPt.x, skPt.y);
      const skBob = Math.sin(t * 2.5 + 1) * 4;
      this.starkidSlider.y += skBob;
    }

    if (this.slideTrailEmitters[0]) {
      this.slideTrailEmitters[0].setPosition(skPt.x, skPt.y);
    }
    if (this.slideTrailEmitters[1]) {
      this.slideTrailEmitters[1].setPosition(astPt.x, astPt.y);
      this.slideTrailEmitters[1].setFrequency(Math.max(10, 40 - speedRatio * 30));
    }
    if (this.companionTrailEmitter) {
      this.companionTrailEmitter.setPosition(
        (astPt.x + skPt.x) / 2,
        (astPt.y + skPt.y) / 2,
      );
    }
  }
}

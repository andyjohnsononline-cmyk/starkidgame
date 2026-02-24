import Phaser from 'phaser';
import { STAR_COLORS, GOLD_HEX } from '../utils/colors';
import { RainbowBridge } from '../entities/RainbowBridge';

interface DriftingStar {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export class FriendshipScene extends Phaser.Scene {
  private driftingStars: DriftingStar[] = [];
  private rainbowBridges: RainbowBridge[] = [];
  private starkidSprite: Phaser.GameObjects.Sprite | null = null;
  private astronautSprite: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super({ key: 'FriendshipScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0520');
    this.cameras.main.fadeIn(3000, 0, 0, 0);

    this.createWarmAmbience();
    this.createDriftingGoldStars();
    this.createDecorativeRainbows();
    this.createCenterDuo();
    this.createGoldenParticles();

    this.time.delayedCall(5000, () => this.showPlayAgain());
  }

  private createWarmAmbience(): void {
    const w = 1024, h = 768;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    gradient.addColorStop(0, 'rgba(255, 200, 80, 0.08)');
    gradient.addColorStop(0.4, 'rgba(255, 170, 50, 0.04)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (!this.textures.exists('friendship_ambience')) {
      this.textures.addCanvas('friendship_ambience', canvas);
    }
    const img = this.add.image(w / 2, h / 2, 'friendship_ambience');
    img.setDepth(0);
  }

  private createDriftingGoldStars(): void {
    const w = 1024, h = 768;
    const starCount = 150;

    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const sprite = this.add.image(x, y, 'star_gold');

      const scale = 0.2 + Math.random() * 0.6;
      sprite.setScale(scale);
      sprite.setAlpha(0);
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      sprite.setDepth(1);

      const baseAlpha = 0.2 + Math.random() * 0.5;

      this.tweens.add({
        targets: sprite,
        alpha: baseAlpha,
        duration: 1500 + Math.random() * 2000,
        delay: Math.random() * 2000,
        ease: 'Sine.easeIn',
      });

      this.driftingStars.push({
        sprite,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 6,
        baseAlpha,
        pulseSpeed: 0.8 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  private createDecorativeRainbows(): void {
    const positions = [
      { x: 150, y: 500, angle: -0.2, length: 450 },
      { x: 600, y: 200, angle: 0.15, length: 380 },
      { x: 300, y: 650, angle: -0.1, length: 500 },
    ];

    for (const pos of positions) {
      const bridge = new RainbowBridge(this, pos.x, pos.y, pos.angle, pos.length);
      this.rainbowBridges.push(bridge);
    }
  }

  private createCenterDuo(): void {
    const cx = 512, cy = 340;

    // StarKid glow aura
    const glow = this.add.sprite(cx - 30, cy, 'starkid');
    glow.setScale(4);
    glow.setAlpha(0);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setDepth(5);

    this.tweens.add({
      targets: glow,
      alpha: 0.15,
      duration: 2500,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: glow,
      scale: { from: 3.5, to: 5 },
      alpha: { from: 0.15, to: 0.06 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 2500,
    });

    // StarKid
    this.starkidSprite = this.add.sprite(cx - 30, cy, 'starkid');
    this.starkidSprite.setScale(2);
    this.starkidSprite.setAlpha(0);
    this.starkidSprite.setDepth(6);

    this.tweens.add({
      targets: this.starkidSprite,
      alpha: 1,
      duration: 2500,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.starkidSprite,
      y: { from: cy - 5, to: cy + 5 },
      duration: 3500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Astronaut beside StarKid
    this.astronautSprite = this.add.sprite(cx + 35, cy + 5, 'astronaut');
    this.astronautSprite.setScale(1.8);
    this.astronautSprite.setAlpha(0);
    this.astronautSprite.setDepth(6);

    this.tweens.add({
      targets: this.astronautSprite,
      alpha: 1,
      duration: 2500,
      delay: 500,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: this.astronautSprite,
      y: { from: cy, to: cy + 10 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 500,
    });

    // Sparkle ring around the duo
    const sparkleColors = STAR_COLORS.map(c => c.hex);
    this.add.particles(cx, cy, 'particle', {
      speed: { min: 15, max: 40 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 3000,
      frequency: 200,
      tint: sparkleColors,
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 60),
        quantity: 20,
      },
    }).setDepth(4);
  }

  private createGoldenParticles(): void {
    this.add.particles(512, 384, 'particle', {
      x: { min: -500, max: 500 },
      y: { min: -400, max: 400 },
      speed: { min: 2, max: 10 },
      scale: { start: 0.3, end: 0.1 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 5000,
      frequency: 80,
      tint: GOLD_HEX,
      blendMode: 'ADD',
    }).setDepth(2);
  }

  private showPlayAgain(): void {
    const playAgain = this.add.text(512, 700, 'Play Again', {
      fontSize: '18px',
      fontFamily: 'Georgia, serif',
      color: '#8899aa',
      align: 'center',
    });
    playAgain.setOrigin(0.5);
    playAgain.setAlpha(0);
    playAgain.setDepth(10);
    playAgain.setInteractive({ useHandCursor: true });
    playAgain.on('pointerover', () => playAgain.setColor('#ffd700'));
    playAgain.on('pointerout', () => playAgain.setColor('#8899aa'));
    playAgain.on('pointerdown', () => {
      this.cameras.main.fadeOut(1500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.cleanup();
        this.scene.start('GameScene');
      });
    });

    this.tweens.add({
      targets: playAgain,
      alpha: 0.8,
      duration: 2000,
      ease: 'Sine.easeInOut',
    });
  }

  update(_time: number, delta: number): void {
    const t = _time / 1000;
    const w = 1024, h = 768;

    for (const star of this.driftingStars) {
      star.sprite.x += star.vx * (delta / 1000);
      star.sprite.y += star.vy * (delta / 1000);

      // Wrap around screen edges
      if (star.sprite.x < -20) star.sprite.x = w + 20;
      if (star.sprite.x > w + 20) star.sprite.x = -20;
      if (star.sprite.y < -20) star.sprite.y = h + 20;
      if (star.sprite.y > h + 20) star.sprite.y = -20;

      const pulse = star.baseAlpha * (0.5 + 0.5 * Math.sin(t * star.pulseSpeed + star.pulsePhase));
      star.sprite.setAlpha(pulse);
    }

    for (const bridge of this.rainbowBridges) {
      bridge.update(delta);
    }
  }

  private cleanup(): void {
    for (const star of this.driftingStars) {
      star.sprite.destroy();
    }
    this.driftingStars = [];
    for (const bridge of this.rainbowBridges) {
      bridge.destroy();
    }
    this.rainbowBridges = [];
  }
}

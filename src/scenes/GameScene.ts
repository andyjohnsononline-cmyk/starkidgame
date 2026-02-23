import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { StarKid } from '../entities/StarKid';
import { StarSpawner } from '../systems/StarSpawner';
import { HazardManager } from '../systems/HazardManager';
import { ParallaxBackground } from '../systems/ParallaxBackground';
import { SpectrumHUD } from '../ui/SpectrumHUD';
import { Star } from '../entities/Star';
import { WORLD_WIDTH, WORLD_HEIGHT, STAR_COLORS, StarColor } from '../utils/colors';
import { audioManager } from '../systems/AudioManager';

const CHEAT_SEQUENCE = ['S', 'T', 'A', 'R', 'S'];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private starSpawner!: StarSpawner;
  private hazardManager!: HazardManager;
  private parallaxBg!: ParallaxBackground;
  private spectrumHUD!: SpectrumHUD;
  private starkid: StarKid | null = null;
  private starkidArrow: Phaser.GameObjects.Graphics | null = null;
  private starkidArrowLabel: Phaser.GameObjects.Text | null = null;
  private totalCollected = 0;
  private spectrumComplete = false;
  private starkidReady = false;
  private audioInitialized = false;
  private cheatBuffer: string[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.parallaxBg = new ParallaxBackground(this);
    this.player = new Player(this);
    this.starSpawner = new StarSpawner(this);
    this.hazardManager = new HazardManager(this);
    this.spectrumHUD = new SpectrumHUD(this);

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player.sprite, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(80, 60);
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    this.createVignette();

    this.setupStarCollection();
    this.hazardManager.setupCollisions(this.player);

    const initAudio = () => {
      if (!this.audioInitialized) {
        audioManager.init();
        this.audioInitialized = true;
      }
    };
    this.input.on('pointerdown', initAudio);
    this.input.keyboard?.on('keydown', initAudio);

    // Start hint
    const hint = this.add.text(512, 384 + 60, 'WASD or Arrow Keys to fly  ·  Click to set destination', {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: '#8899aa',
      align: 'center',
    });
    hint.setOrigin(0.5);
    hint.setScrollFactor(0);
    hint.setDepth(90);
    hint.setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: 0.8,
      delay: 2000,
      duration: 1500,
      ease: 'Sine.easeInOut',
    });

    const dismissHint = () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 800, onComplete: () => hint.destroy() });
      this.input.off('pointerdown', dismissHint);
      this.input.keyboard?.off('keydown', dismissHint);
    };
    this.input.on('pointerdown', dismissHint);
    this.input.keyboard?.on('keydown', dismissHint);

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.cheatBuffer.push(event.key.toUpperCase());
      if (this.cheatBuffer.length > CHEAT_SEQUENCE.length) {
        this.cheatBuffer.shift();
      }
      if (this.cheatBuffer.length === CHEAT_SEQUENCE.length &&
          this.cheatBuffer.every((k, i) => k === CHEAT_SEQUENCE[i])) {
        this.cheatBuffer.length = 0;
        this.cheatCollectAll();
      }
    });
  }

  private setupStarCollection(): void {
    this.physics.add.overlap(
      this.player.sprite,
      this.starSpawner.starGroup,
      (_player, starObj) => {
        const star = starObj as Star;
        this.collectStar(star);
      },
    );
  }

  private collectStar(star: Star): void {
    const result = this.spectrumHUD.addStar(star.starColor);
    this.totalCollected++;

    audioManager.playStarCollect(star.starColor);

    this.createCollectEffect(star.x, star.y, star.starColor);

    // Brief camera zoom pulse for feedback
    this.cameras.main.zoomTo(1.03, 100, 'Sine.easeOut', false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress >= 1) this.cameras.main.zoomTo(1, 200, 'Sine.easeIn');
    });

    if (result.justCompleted) {
      audioManager.playColorComplete();
    }

    const completedColors = STAR_COLORS.filter(c =>
      this.spectrumHUD.getCollected(c.color) >= 10
    ).length;
    audioManager.updateSpectrumProgress(completedColors / STAR_COLORS.length);

    this.starSpawner.removeStar(star);

    if (result.allComplete && !this.spectrumComplete) {
      this.spectrumComplete = true;
      this.onSpectrumComplete();
    }
  }

  private createCollectEffect(x: number, y: number, color: StarColor): void {
    const cfg = STAR_COLORS.find(c => c.color === color)!;

    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: cfg.hex,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.explode(12);
    this.time.delayedCall(600, () => emitter.destroy());

    const ring = this.add.graphics();
    ring.setDepth(6);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 400,
      ease: 'Sine.easeOut',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const v = tween.getValue() ?? 0;
        ring.clear();
        const radius = 10 + v * 50;
        const alpha = 0.6 * (1 - v);
        ring.lineStyle(2 - v * 1.5, cfg.hex, alpha);
        ring.strokeCircle(x, y, radius);
      },
      onComplete: () => ring.destroy(),
    });
  }

  private onSpectrumComplete(): void {
    audioManager.playWinSwell();

    const cam = this.cameras.main;
    const skX = Phaser.Math.Clamp(
      this.player.sprite.x + (Math.random() - 0.5) * 600,
      200, WORLD_WIDTH - 200,
    );
    const skY = Phaser.Math.Clamp(
      this.player.sprite.y + (Math.random() - 0.5) * 600,
      200, WORLD_HEIGHT - 200,
    );

    this.starkid = new StarKid(this, skX, skY);

    this.time.delayedCall(1000, () => {
      this.starkid?.materialize();
    });

    this.time.delayedCall(4000, () => {
      this.starkidReady = true;
      this.setupStarKidOverlap();
    });
  }

  private setupStarKidOverlap(): void {
    if (!this.starkid) return;
    this.physics.add.overlap(
      this.player.sprite,
      this.starkid,
      () => {
        if (!this.starkidReady) return;
        this.starkidReady = false;
        this.cameras.main.fadeOut(2000, 255, 255, 255);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('WinScene');
        });
      },
    );
  }

  private cheatCollectAll(): void {
    if (this.spectrumComplete) return;

    this.starSpawner.removeAllStars();
    const { wasAlreadyComplete } = this.spectrumHUD.fillAll();
    this.totalCollected = 70;

    audioManager.updateSpectrumProgress(1);

    if (!wasAlreadyComplete) {
      this.spectrumComplete = true;
      this.onSpectrumComplete();
    }
  }

  update(time: number, delta: number): void {
    this.player.update(delta);
    this.starSpawner.update(time, this.player.sprite.x, this.player.sprite.y);
    this.hazardManager.update(this.player, delta);
    this.parallaxBg.update(time, this.cameras.main);
    this.starkid?.update(time);
    this.updateStarKidArrow(time);
  }

  private createVignette(): void {
    const w = 1024, h = 768;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(15,5,30,0.45)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    this.textures.addCanvas('vignette', canvas);
    const img = this.add.image(w / 2, h / 2, 'vignette');
    img.setScrollFactor(0);
    img.setDepth(95);
  }

  private updateStarKidArrow(time: number): void {
    if (!this.starkid || !this.starkidReady) {
      if (this.starkidArrowLabel) this.starkidArrowLabel.setAlpha(0);
      return;
    }

    if (!this.starkidArrow) {
      this.starkidArrow = this.add.graphics();
      this.starkidArrow.setDepth(50);
      this.starkidArrow.setScrollFactor(0);
    }
    if (!this.starkidArrowLabel) {
      this.starkidArrowLabel = this.add.text(0, 0, 'Find StarKid', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffd700',
        align: 'center',
      });
      this.starkidArrowLabel.setOrigin(0.5);
      this.starkidArrowLabel.setDepth(50);
      this.starkidArrowLabel.setScrollFactor(0);
    }

    this.starkidArrow.clear();

    const cam = this.cameras.main;
    const sx = this.starkid.x - cam.scrollX;
    const sy = this.starkid.y - cam.scrollY;
    const margin = 50;

    if (sx >= margin && sx <= cam.width - margin && sy >= margin && sy <= cam.height - margin) {
      this.starkidArrowLabel.setAlpha(0);
      return;
    }

    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const angle = Math.atan2(sy - cy, sx - cx);

    const edgePadding = 40;
    const maxX = cam.width - edgePadding;
    const maxY = cam.height - edgePadding;

    let ax: number, ay: number;
    const slope = Math.tan(angle);
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    if (Math.abs(cosAngle) * maxY > Math.abs(sinAngle) * maxX) {
      ax = cosAngle > 0 ? maxX : edgePadding;
      ay = cy + (ax - cx) * slope;
      ay = Phaser.Math.Clamp(ay, edgePadding, maxY);
    } else {
      ay = sinAngle > 0 ? maxY : edgePadding;
      ax = cx + (ay - cy) / slope;
      ax = Phaser.Math.Clamp(ax, edgePadding, maxX);
    }

    const t = time / 1000;
    const pulse = 0.6 + 0.4 * Math.sin(t * 3);

    this.starkidArrow.fillStyle(0xffd700, pulse * 0.9);
    this.starkidArrow.beginPath();
    const tipX = ax + Math.cos(angle) * 16;
    const tipY = ay + Math.sin(angle) * 16;
    const baseL = angle + Math.PI * 0.8;
    const baseR = angle - Math.PI * 0.8;
    this.starkidArrow.moveTo(tipX, tipY);
    this.starkidArrow.lineTo(ax + Math.cos(baseL) * 10, ay + Math.sin(baseL) * 10);
    this.starkidArrow.lineTo(ax + Math.cos(baseR) * 10, ay + Math.sin(baseR) * 10);
    this.starkidArrow.closePath();
    this.starkidArrow.fillPath();

    const labelOffsetX = -Math.cos(angle) * 22;
    const labelOffsetY = -Math.sin(angle) * 22;
    this.starkidArrowLabel.setPosition(ax + labelOffsetX, ay + labelOffsetY);
    this.starkidArrowLabel.setAlpha(pulse * 0.7);
  }
}

import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';

interface TwinkleStar {
  sprite: Phaser.GameObjects.Arc;
  baseAlpha: number;
  speed: number;
  phase: number;
}

interface DriftingCloud {
  sprite: Phaser.GameObjects.Image;
  baseX: number;
  baseY: number;
  driftX: number;
  driftY: number;
  speedX: number;
  speedY: number;
  phase: number;
  baseAlpha: number;
  alphaSpeed: number;
}

interface ForegroundMote {
  sprite: Phaser.GameObjects.Arc;
  baseAlpha: number;
  driftSpeed: number;
  phase: number;
}

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private starFieldImage: Phaser.GameObjects.Image;
  private nebulaSprites: Phaser.GameObjects.Image[] = [];
  private fogPatches: Phaser.GameObjects.Image[] = [];
  private driftingClouds: DriftingCloud[] = [];
  private twinkleStars: TwinkleStar[] = [];
  private foregroundMotes: ForegroundMote[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createColorWash();
    this.createDeepStarField();
    this.starFieldImage = this.createStarField();
    this.createTwinkleStars();
    this.createBrightStars();
    this.createFogPatches();
    this.createNebulaStreaks();
    this.createNebulaClouds();
    this.createForegroundDust();
  }

  private createColorWash(): Phaser.GameObjects.Image {
    if (!this.scene.textures.exists('bg_colorwash')) {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#120835';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g1 = ctx.createRadialGradient(300, 500, 0, 300, 500, 1200);
    g1.addColorStop(0, 'rgba(40, 210, 210, 0.50)');
    g1.addColorStop(0.3, 'rgba(30, 180, 190, 0.35)');
    g1.addColorStop(0.6, 'rgba(20, 120, 150, 0.18)');
    g1.addColorStop(1, 'rgba(30, 180, 180, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g2 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.65, WORLD_HEIGHT * 0.3, 0,
      WORLD_WIDTH * 0.65, WORLD_HEIGHT * 0.3, 1400,
    );
    g2.addColorStop(0, 'rgba(210, 50, 190, 0.55)');
    g2.addColorStop(0.3, 'rgba(160, 40, 170, 0.35)');
    g2.addColorStop(0.6, 'rgba(120, 30, 150, 0.15)');
    g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g3 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.4, WORLD_HEIGHT * 0.55, 0,
      WORLD_WIDTH * 0.4, WORLD_HEIGHT * 0.55, 1200,
    );
    g3.addColorStop(0, 'rgba(80, 50, 220, 0.50)');
    g3.addColorStop(0.4, 'rgba(60, 30, 180, 0.30)');
    g3.addColorStop(0.7, 'rgba(40, 20, 140, 0.12)');
    g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g4 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.85, WORLD_HEIGHT * 0.7, 0,
      WORLD_WIDTH * 0.85, WORLD_HEIGHT * 0.7, 1000,
    );
    g4.addColorStop(0, 'rgba(190, 60, 200, 0.45)');
    g4.addColorStop(0.5, 'rgba(140, 40, 170, 0.20)');
    g4.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g5 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.15, WORLD_HEIGHT * 0.8, 0,
      WORLD_WIDTH * 0.15, WORLD_HEIGHT * 0.8, 900,
    );
    g5.addColorStop(0, 'rgba(50, 200, 200, 0.35)');
    g5.addColorStop(0.5, 'rgba(30, 140, 160, 0.15)');
    g5.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g5;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.scene.textures.addCanvas('bg_colorwash', canvas);
    }
    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_colorwash');
    img.setDepth(-110);
    img.setScrollFactor(0.05);
    return img;
  }

  private createDeepStarField(): Phaser.GameObjects.Image {
    if (!this.scene.textures.exists('bg_deepstars')) {
      const g = this.scene.add.graphics();
      const count = 800;

      for (let i = 0; i < count; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const alpha = 0.15 + Math.random() * 0.35;
        g.fillStyle(0xccccee, alpha);
        g.fillCircle(x, y, 0.5 + Math.random() * 0.5);
      }

      g.generateTexture('bg_deepstars', WORLD_WIDTH, WORLD_HEIGHT);
      g.destroy();
    }

    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_deepstars');
    img.setDepth(-108);
    img.setScrollFactor(0.1);
    return img;
  }

  private createStarField(): Phaser.GameObjects.Image {
    if (!this.scene.textures.exists('bg_starfield')) {
      const g = this.scene.add.graphics();
      const count = 2000;
      const starTints = [0xffffff, 0xffffff, 0xffffff, 0xccddff, 0xffeedd, 0xffaadd, 0xaaddff];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const alpha = 0.3 + Math.random() * 0.7;
        const roll = Math.random();
        const tint = starTints[Math.floor(Math.random() * starTints.length)];

        g.fillStyle(tint, alpha);

        if (roll < 0.4) {
          const size = Math.random() < 0.7 ? 1 : 1.5;
          g.fillCircle(x, y, size);
        } else if (roll < 0.6) {
          const arm = 1 + Math.random() * 1.5;
          g.fillRect(x - arm, y - 0.5, arm * 2, 1);
          g.fillRect(x - 0.5, y - arm, 1, arm * 2);
        } else if (roll < 0.8) {
          const s = 1 + Math.random();
          g.fillPoints([
            new Phaser.Math.Vector2(x, y - s),
            new Phaser.Math.Vector2(x + s, y),
            new Phaser.Math.Vector2(x, y + s),
            new Phaser.Math.Vector2(x - s, y),
          ], true);
        } else {
          const s = 1 + Math.random();
          g.fillPoints([
            new Phaser.Math.Vector2(x, y - s),
            new Phaser.Math.Vector2(x + s * 0.7, y + s * 0.5),
            new Phaser.Math.Vector2(x - s * 0.7, y + s * 0.5),
          ], true);
        }
      }

      g.generateTexture('bg_starfield', WORLD_WIDTH, WORLD_HEIGHT);
      g.destroy();
    }

    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_starfield');
    img.setDepth(-100);
    img.setScrollFactor(0.3);
    return img;
  }

  private createBrightStars(): void {
    const haloTints = [0xaabbff, 0xccaaff, 0xaaffee, 0xffbbdd];

    for (let i = 0; i < 22; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const g = this.scene.add.graphics();
      const haloTint = haloTints[Math.floor(Math.random() * haloTints.length)];

      const haloRadius = 30 + Math.random() * 20;
      g.fillStyle(haloTint, 0.03);
      g.fillCircle(0, 0, haloRadius);
      g.fillStyle(haloTint, 0.08);
      g.fillCircle(0, 0, haloRadius * 0.6);
      g.fillStyle(haloTint, 0.18);
      g.fillCircle(0, 0, haloRadius * 0.3);

      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(0, 0, 1.5 + Math.random());

      const arm = 12 + Math.random() * 18;
      g.fillStyle(0xffffff, 0.3);
      g.fillRect(-arm, -0.5, arm * 2, 1);
      g.fillRect(-0.5, -arm, 1, arm * 2);

      const diagArm = arm * 0.5;
      g.fillStyle(0xffffff, 0.15);
      for (let d = -diagArm; d <= diagArm; d += 0.8) {
        g.fillRect(d - 0.3, d - 0.3, 0.6, 0.6);
        g.fillRect(d - 0.3, -d - 0.3, 0.6, 0.6);
      }

      g.setPosition(x, y);
      g.setDepth(-97);
      g.setScrollFactor(0.3);
      g.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  private createFogPatches(): void {
    const fogConfigs = [
      { x: 500, y: 400, r: 350, color: [160, 80, 220] },
      { x: 1600, y: 600, r: 400, color: [100, 120, 230] },
      { x: 3000, y: 500, r: 320, color: [190, 100, 220] },
      { x: 800, y: 1800, r: 380, color: [80, 190, 190] },
      { x: 2200, y: 1200, r: 360, color: [220, 100, 190] },
      { x: 3400, y: 2000, r: 340, color: [140, 60, 220] },
      { x: 1200, y: 2400, r: 300, color: [100, 150, 220] },
      { x: 2800, y: 800, r: 370, color: [190, 80, 200] },
    ];

    for (let i = 0; i < fogConfigs.length; i++) {
      const cfg = fogConfigs[i];
      const patchSize = cfg.r * 2;
      const canvas = document.createElement('canvas');
      canvas.width = patchSize;
      canvas.height = patchSize;
      const ctx = canvas.getContext('2d')!;
      const cx = patchSize / 2, cy = patchSize / 2;

      const subBlobs = [
        { ox: 0, oy: 0, scale: 1.0, alpha: 0.25 },
        { ox: -cfg.r * 0.25, oy: cfg.r * 0.2, scale: 0.7, alpha: 0.20 },
        { ox: cfg.r * 0.3, oy: -cfg.r * 0.15, scale: 0.65, alpha: 0.18 },
        { ox: cfg.r * 0.1, oy: cfg.r * 0.3, scale: 0.5, alpha: 0.15 },
      ];

      for (const sub of subBlobs) {
        const grad = ctx.createRadialGradient(
          cx + sub.ox, cy + sub.oy, 0,
          cx + sub.ox, cy + sub.oy, cfg.r * sub.scale,
        );
        const [r, g, b] = cfg.color;
        grad.addColorStop(0, `rgba(${r},${g},${b},${sub.alpha})`);
        grad.addColorStop(0.3, `rgba(${r},${g},${b},${sub.alpha * 0.7})`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},${sub.alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, patchSize, patchSize);
      }

      const texKey = `fog_patch_${i}`;
      this.scene.textures.addCanvas(texKey, canvas);
      const img = this.scene.add.image(cfg.x, cfg.y, texKey);
      img.setDepth(-95);
      img.setScrollFactor(0.4);
      img.setBlendMode(Phaser.BlendModes.NORMAL);
      const baseAlpha = 0.7 + Math.random() * 0.3;
      img.setAlpha(baseAlpha);
      this.fogPatches.push(img);

      this.driftingClouds.push({
        sprite: img,
        baseX: cfg.x,
        baseY: cfg.y,
        driftX: 40 + Math.random() * 60,
        driftY: 25 + Math.random() * 45,
        speedX: 0.05 + Math.random() * 0.08,
        speedY: 0.04 + Math.random() * 0.07,
        phase: Math.random() * Math.PI * 2,
        baseAlpha,
        alphaSpeed: 0.1 + Math.random() * 0.15,
      });
    }
  }

  private createNebulaStreaks(): Phaser.GameObjects.Image {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    const streakConfigs = [
      { color: 'rgba(200,60,200,', count: 4 },
      { color: 'rgba(120,70,220,', count: 4 },
      { color: 'rgba(60,170,200,', count: 3 },
      { color: 'rgba(220,70,160,', count: 3 },
    ];

    for (const cfg of streakConfigs) {
      for (let i = 0; i < cfg.count; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.4;
        const length = 1500 + Math.random() * 1500;
        const width = 60 + Math.random() * 140;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
        grad.addColorStop(0, cfg.color + '0)');
        grad.addColorStop(0.15, cfg.color + '0.12)');
        grad.addColorStop(0.4, cfg.color + '0.28)');
        grad.addColorStop(0.6, cfg.color + '0.28)');
        grad.addColorStop(0.85, cfg.color + '0.12)');
        grad.addColorStop(1, cfg.color + '0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.ellipse(0, 0, length / 2, width / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    this.scene.textures.addCanvas('bg_streaks', canvas);
    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_streaks');
    img.setDepth(-92);
    img.setScrollFactor(0.45);
    img.setBlendMode(Phaser.BlendModes.ADD);
    return img;
  }

  private createNebulaClouds(): void {
    const positions = [
      { x: 600, y: 500 }, { x: 1800, y: 800 }, { x: 3200, y: 600 },
      { x: 900, y: 2200 }, { x: 2500, y: 1500 }, { x: 3500, y: 2400 },
      { x: 1400, y: 1800 }, { x: 2000, y: 2600 },
    ];
    const tints = [0xff66cc, 0x8844dd, 0x44aacc, 0xaa55ee, 0xcc44aa];

    for (const pos of positions) {
      const nebula = this.scene.add.image(pos.x, pos.y, 'nebula');
      nebula.setDepth(-90);
      const baseAlpha = 0.7 + Math.random() * 0.3;
      nebula.setAlpha(baseAlpha);
      nebula.setScale(2.5 + Math.random() * 3.5);
      nebula.setAngle(Math.random() * 360);
      nebula.setScrollFactor(0.55);
      nebula.setBlendMode(Phaser.BlendModes.NORMAL);
      nebula.setTint(tints[Math.floor(Math.random() * tints.length)]);
      this.nebulaSprites.push(nebula);

      this.driftingClouds.push({
        sprite: nebula,
        baseX: pos.x,
        baseY: pos.y,
        driftX: 30 + Math.random() * 50,
        driftY: 20 + Math.random() * 40,
        speedX: 0.08 + Math.random() * 0.12,
        speedY: 0.06 + Math.random() * 0.10,
        phase: Math.random() * Math.PI * 2,
        baseAlpha,
        alphaSpeed: 0.15 + Math.random() * 0.2,
      });

      const glowNebula = this.scene.add.image(pos.x, pos.y, 'nebula');
      glowNebula.setDepth(-89);
      glowNebula.setAlpha(baseAlpha * 0.3);
      glowNebula.setScale((2.5 + Math.random() * 3.5) * 1.3);
      glowNebula.setAngle(nebula.angle);
      glowNebula.setScrollFactor(0.55);
      glowNebula.setBlendMode(Phaser.BlendModes.ADD);
      glowNebula.setTint(tints[Math.floor(Math.random() * tints.length)]);

      this.driftingClouds.push({
        sprite: glowNebula,
        baseX: pos.x,
        baseY: pos.y,
        driftX: 30 + Math.random() * 50,
        driftY: 20 + Math.random() * 40,
        speedX: 0.08 + Math.random() * 0.12,
        speedY: 0.06 + Math.random() * 0.10,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: baseAlpha * 0.3,
        alphaSpeed: 0.15 + Math.random() * 0.2,
      });
    }
  }

  private createTwinkleStars(): void {
    const tints = [0xffffff, 0xccddff, 0xffeedd, 0xddddff, 0xffaadd, 0xaaddff];
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const radius = 1 + Math.random() * 1.5;
      const baseAlpha = 0.4 + Math.random() * 0.5;
      const tint = tints[Math.floor(Math.random() * tints.length)];

      const sprite = this.scene.add.circle(x, y, radius, tint, baseAlpha);
      sprite.setDepth(-98);
      sprite.setScrollFactor(0.35);
      sprite.setBlendMode(Phaser.BlendModes.ADD);

      this.twinkleStars.push({
        sprite,
        baseAlpha,
        speed: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private createForegroundDust(): void {
    const tints = [0xaabbff, 0xccaaff, 0xffffff, 0xffddee];
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const radius = 1.5 + Math.random() * 3;
      const baseAlpha = 0.04 + Math.random() * 0.08;
      const tint = tints[Math.floor(Math.random() * tints.length)];

      const sprite = this.scene.add.circle(x, y, radius, tint, baseAlpha);
      sprite.setDepth(-80);
      sprite.setScrollFactor(1.1 + Math.random() * 0.2);
      sprite.setBlendMode(Phaser.BlendModes.ADD);

      this.foregroundMotes.push({
        sprite,
        baseAlpha,
        driftSpeed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(time: number, _camera: Phaser.Cameras.Scene2D.Camera): void {
    const t = time / 1000;
    for (const star of this.twinkleStars) {
      const flicker = Math.sin(t * star.speed + star.phase);
      const alpha = star.baseAlpha * (0.3 + 0.7 * ((flicker + 1) / 2));
      star.sprite.setAlpha(alpha);
    }

    for (const cloud of this.driftingClouds) {
      const x = cloud.baseX + Math.sin(t * cloud.speedX + cloud.phase) * cloud.driftX;
      const y = cloud.baseY + Math.cos(t * cloud.speedY + cloud.phase * 1.3) * cloud.driftY;
      cloud.sprite.setPosition(x, y);

      const alphaWave = Math.sin(t * cloud.alphaSpeed + cloud.phase * 0.7);
      cloud.sprite.setAlpha(cloud.baseAlpha * (0.6 + 0.4 * ((alphaWave + 1) / 2)));
    }

    for (const mote of this.foregroundMotes) {
      const flicker = Math.sin(t * mote.driftSpeed + mote.phase);
      mote.sprite.setAlpha(mote.baseAlpha * (0.3 + 0.7 * ((flicker + 1) / 2)));
    }
  }
}

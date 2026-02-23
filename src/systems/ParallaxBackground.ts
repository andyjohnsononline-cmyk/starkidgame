import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';

interface TwinkleStar {
  sprite: Phaser.GameObjects.Arc;
  baseAlpha: number;
  speed: number;
  phase: number;
}

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private starFieldImage: Phaser.GameObjects.Image;
  private nebulaSprites: Phaser.GameObjects.Image[] = [];
  private geometricShapes: Phaser.GameObjects.Image;
  private twinkleStars: TwinkleStar[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createColorWash();
    this.starFieldImage = this.createStarField();
    this.createTwinkleStars();
    this.createBrightStars();
    this.geometricShapes = this.createGeometricLayer();
    this.createNebulaStreaks();
    this.createNebulaClouds();
  }

  private createColorWash(): Phaser.GameObjects.Image {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0b0520';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g1 = ctx.createRadialGradient(300, 500, 0, 300, 500, 900);
    g1.addColorStop(0, 'rgba(30, 180, 180, 0.15)');
    g1.addColorStop(0.5, 'rgba(20, 120, 140, 0.08)');
    g1.addColorStop(1, 'rgba(30, 180, 180, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g2 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.6, WORLD_HEIGHT * 0.35, 0,
      WORLD_WIDTH * 0.6, WORLD_HEIGHT * 0.35, 1200,
    );
    g2.addColorStop(0, 'rgba(180, 40, 160, 0.14)');
    g2.addColorStop(0.4, 'rgba(120, 30, 150, 0.09)');
    g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g3 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.4, WORLD_HEIGHT * 0.6, 0,
      WORLD_WIDTH * 0.4, WORLD_HEIGHT * 0.6, 1000,
    );
    g3.addColorStop(0, 'rgba(60, 40, 200, 0.12)');
    g3.addColorStop(0.6, 'rgba(40, 20, 140, 0.06)');
    g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const g4 = ctx.createRadialGradient(
      WORLD_WIDTH * 0.8, WORLD_HEIGHT * 0.7, 0,
      WORLD_WIDTH * 0.8, WORLD_HEIGHT * 0.7, 800,
    );
    g4.addColorStop(0, 'rgba(160, 50, 180, 0.10)');
    g4.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.scene.textures.addCanvas('bg_colorwash', canvas);
    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_colorwash');
    img.setDepth(-105);
    img.setScrollFactor(0.2);
    return img;
  }

  private createStarField(): Phaser.GameObjects.Image {
    const g = this.scene.add.graphics();
    const count = 500;
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

    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_starfield');
    img.setDepth(-100);
    img.setScrollFactor(0.3);
    return img;
  }

  private createBrightStars(): void {
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const g = this.scene.add.graphics();

      const haloAlpha = 0.06 + Math.random() * 0.06;
      g.fillStyle(0xaabbff, haloAlpha);
      g.fillCircle(0, 0, 10 + Math.random() * 6);

      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(0, 0, 1.5 + Math.random());

      const arm = 8 + Math.random() * 10;
      g.fillStyle(0xffffff, 0.25);
      g.fillRect(-arm, -0.5, arm * 2, 1);
      g.fillRect(-0.5, -arm, 1, arm * 2);

      const diagArm = arm * 0.5;
      g.fillStyle(0xffffff, 0.12);
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

  private createGeometricLayer(): Phaser.GameObjects.Image {
    const g = this.scene.add.graphics();
    const count = 60;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const alpha = 0.04 + Math.random() * 0.08;
      const size = 8 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const type = Math.floor(Math.random() * 3);

      const tints = [0x8844cc, 0x5566dd, 0xaa55cc, 0x44aaaa, 0xcc55aa];
      const color = tints[Math.floor(Math.random() * tints.length)];
      g.lineStyle(0.8, color, alpha);

      if (type === 0) {
        const pts: Phaser.Math.Vector2[] = [];
        for (let v = 0; v < 6; v++) {
          const a = angle + (v / 6) * Math.PI * 2;
          pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * size, y + Math.sin(a) * size));
        }
        g.strokePoints(pts, true);
      } else if (type === 1) {
        const pts: Phaser.Math.Vector2[] = [];
        for (let v = 0; v < 3; v++) {
          const a = angle + (v / 3) * Math.PI * 2;
          pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * size, y + Math.sin(a) * size));
        }
        g.strokePoints(pts, true);
      } else {
        const stretch = 0.3 + Math.random() * 0.4;
        g.strokePoints([
          new Phaser.Math.Vector2(x, y - size),
          new Phaser.Math.Vector2(x + size * stretch, y),
          new Phaser.Math.Vector2(x, y + size),
          new Phaser.Math.Vector2(x - size * stretch, y),
        ], true);
      }
    }

    g.generateTexture('bg_geometric', WORLD_WIDTH, WORLD_HEIGHT);
    g.destroy();

    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_geometric');
    img.setDepth(-95);
    img.setScrollFactor(0.45);
    return img;
  }

  private createNebulaStreaks(): Phaser.GameObjects.Image {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH;
    canvas.height = WORLD_HEIGHT;
    const ctx = canvas.getContext('2d')!;

    const streakConfigs = [
      { color: 'rgba(180,50,180,', count: 5 },
      { color: 'rgba(100,60,200,', count: 5 },
      { color: 'rgba(50,150,180,', count: 3 },
      { color: 'rgba(200,60,140,', count: 2 },
    ];

    for (const cfg of streakConfigs) {
      for (let i = 0; i < cfg.count; i++) {
        const x = Math.random() * WORLD_WIDTH;
        const y = Math.random() * WORLD_HEIGHT;
        const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.8;
        const length = 300 + Math.random() * 700;
        const width = 30 + Math.random() * 80;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const grad = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
        grad.addColorStop(0, cfg.color + '0)');
        grad.addColorStop(0.2, cfg.color + '0.04)');
        grad.addColorStop(0.5, cfg.color + '0.08)');
        grad.addColorStop(0.8, cfg.color + '0.04)');
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
    img.setScrollFactor(0.5);
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
      nebula.setAlpha(0.8 + Math.random() * 0.2);
      nebula.setScale(2.0 + Math.random() * 3);
      nebula.setAngle(Math.random() * 360);
      nebula.setScrollFactor(0.6);
      nebula.setBlendMode(Phaser.BlendModes.ADD);
      nebula.setTint(tints[Math.floor(Math.random() * tints.length)]);
      this.nebulaSprites.push(nebula);
    }
  }

  private createTwinkleStars(): void {
    const tints = [0xffffff, 0xccddff, 0xffeedd, 0xddddff, 0xffaadd, 0xaaddff];
    for (let i = 0; i < 30; i++) {
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

  update(time: number, _camera: Phaser.Cameras.Scene2D.Camera): void {
    const t = time / 1000;
    for (const star of this.twinkleStars) {
      const flicker = Math.sin(t * star.speed + star.phase);
      const alpha = star.baseAlpha * (0.3 + 0.7 * ((flicker + 1) / 2));
      star.sprite.setAlpha(alpha);
    }
  }
}

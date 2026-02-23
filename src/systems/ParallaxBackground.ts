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
    this.starFieldImage = this.createStarField();
    this.geometricShapes = this.createGeometricLayer();
    this.createNebulaClouds();
    this.createTwinkleStars();
  }

  private createStarField(): Phaser.GameObjects.Image {
    const g = this.scene.add.graphics();
    const count = 500;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const alpha = 0.3 + Math.random() * 0.7;
      const roll = Math.random();

      g.fillStyle(0xffffff, alpha);

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

  private createGeometricLayer(): Phaser.GameObjects.Image {
    const g = this.scene.add.graphics();
    const count = 60;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const alpha = 0.03 + Math.random() * 0.06;
      const size = 8 + Math.random() * 20;
      const angle = Math.random() * Math.PI * 2;
      const type = Math.floor(Math.random() * 3);

      const tints = [0x6644aa, 0x4466cc, 0x8855bb, 0x5577dd, 0xaa66cc];
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

  private createNebulaClouds(): void {
    const positions = [
      { x: 600, y: 500 }, { x: 1800, y: 800 }, { x: 3200, y: 600 },
      { x: 900, y: 2200 }, { x: 2500, y: 1500 }, { x: 3500, y: 2400 },
      { x: 1400, y: 1800 }, { x: 2000, y: 2600 },
    ];

    for (const pos of positions) {
      const nebula = this.scene.add.image(pos.x, pos.y, 'nebula');
      nebula.setDepth(-90);
      nebula.setAlpha(0.6 + Math.random() * 0.4);
      nebula.setScale(1.5 + Math.random() * 2);
      nebula.setAngle(Math.random() * 360);
      nebula.setScrollFactor(0.6);
      this.nebulaSprites.push(nebula);
    }
  }

  private createTwinkleStars(): void {
    const tints = [0xffffff, 0xccddff, 0xffeedd, 0xddddff];
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

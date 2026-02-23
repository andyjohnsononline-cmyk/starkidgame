import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';

export class ParallaxBackground {
  private scene: Phaser.Scene;
  private starFieldImage: Phaser.GameObjects.Image;
  private nebulaSprites: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.starFieldImage = this.createStarField();
    this.createNebulaClouds();
  }

  private createStarField(): Phaser.GameObjects.Image {
    const g = this.scene.add.graphics();
    const count = 500;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * WORLD_WIDTH;
      const y = Math.random() * WORLD_HEIGHT;
      const size = Math.random() < 0.8 ? 1 : Math.random() < 0.9 ? 1.5 : 2;
      const alpha = 0.3 + Math.random() * 0.7;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }

    g.generateTexture('bg_starfield', WORLD_WIDTH, WORLD_HEIGHT);
    g.destroy();

    const img = this.scene.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg_starfield');
    img.setDepth(-100);
    img.setScrollFactor(0.3);
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

  update(_time: number, _camera: Phaser.Cameras.Scene2D.Camera): void {
    // Parallax is handled via scrollFactor; no per-frame work needed
  }
}

import Phaser from 'phaser';

const FOG_RADIUS = 300;
const VISIBILITY_RADIUS = 100;

export class NebulaFog {
  public x: number;
  public y: number;
  private fogOverlay: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.fogOverlay = scene.add.graphics();
    this.fogOverlay.setDepth(20);
    this.drawFog(1);
  }

  private drawFog(intensity: number): void {
    this.fogOverlay.clear();
    for (let i = 5; i > 0; i--) {
      const r = FOG_RADIUS * (i / 5);
      const alpha = 0.12 * intensity * (i / 5);
      this.fogOverlay.fillStyle(0x334466, alpha);
      this.fogOverlay.fillCircle(this.x, this.y, r);
    }
  }

  update(playerX: number, playerY: number): void {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < FOG_RADIUS) {
      const clearRatio = Math.max(0, 1 - dist / FOG_RADIUS);
      this.drawFog(1 - clearRatio * 0.6);
    } else {
      this.drawFog(1);
    }
  }

  isPlayerInFog(playerX: number, playerY: number): boolean {
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    return Math.sqrt(dx * dx + dy * dy) < FOG_RADIUS;
  }
}

import Phaser from 'phaser';

const PULL_RADIUS = 200;
const PULL_STRENGTH = 150;

export class BlackHole {
  public sprite: Phaser.GameObjects.Sprite;
  public x: number;
  public y: number;

  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.sprite = scene.add.sprite(x, y, 'blackhole');
    this.sprite.setDepth(2);
    this.sprite.setAlpha(0.8);

    scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear',
    });

    scene.tweens.add({
      targets: this.sprite,
      scale: { from: 0.9, to: 1.1 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  applyGravity(playerBody: Phaser.Physics.Arcade.Body): boolean {
    const dx = this.x - playerBody.center.x;
    const dy = this.y - playerBody.center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < PULL_RADIUS && dist > 5) {
      const strength = PULL_STRENGTH * (1 - dist / PULL_RADIUS);
      const nx = dx / dist;
      const ny = dy / dist;
      playerBody.velocity.x += nx * strength * 0.016;
      playerBody.velocity.y += ny * strength * 0.016;
      return true;
    }
    return false;
  }
}

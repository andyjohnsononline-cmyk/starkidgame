import Phaser from 'phaser';
import { StarColor } from '../utils/colors';

export class Star extends Phaser.Physics.Arcade.Sprite {
  public starColor: StarColor;
  private floatOffset: number;
  private floatSpeed: number;
  private pulseSpeed: number;
  private baseY: number;
  private glowSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, color: StarColor) {
    super(scene, x, y, `star_${color}`);
    this.starColor = color;
    this.baseY = y;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 0.5 + Math.random() * 1;
    this.pulseSpeed = 1 + Math.random() * 1.5;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(5);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setCircle(12);

    // Glow sprite (same texture, larger, low alpha, additive blend)
    this.glowSprite = scene.add.sprite(x, y, `star_${color}`);
    this.glowSprite.setScale(2);
    this.glowSprite.setAlpha(0.3);
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setDepth(4);
  }

  update(time: number): void {
    const t = time / 1000;
    const floatY = Math.sin(t * this.floatSpeed + this.floatOffset) * 6;
    this.y = this.baseY + floatY;

    const pulse = 0.85 + 0.15 * Math.sin(t * this.pulseSpeed + this.floatOffset);
    this.setScale(pulse);

    // Static bodies don't auto-sync; refresh after position change
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) body.updateFromGameObject();

    if (this.glowSprite) {
      this.glowSprite.setPosition(this.x, this.y);
      this.glowSprite.setScale(1.8 + 0.4 * Math.sin(t * this.pulseSpeed * 0.7 + this.floatOffset));
      this.glowSprite.setAlpha(0.15 + 0.15 * Math.sin(t * this.pulseSpeed + this.floatOffset));
    }
  }

  nudge(dx: number, dy: number): void {
    this.x += dx;
    this.baseY += dy;
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) body.updateFromGameObject();
  }

  collect(): void {
    if (this.glowSprite) {
      this.glowSprite.destroy();
      this.glowSprite = null;
    }
    this.destroy();
  }
}

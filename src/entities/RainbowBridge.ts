import Phaser from 'phaser';
import { STAR_COLORS } from '../utils/colors';

const BRIDGE_SEGMENTS = 40;
const BAND_WIDTH = 6;
const RIDE_SPEED = 180;

export class RainbowBridge {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private glowGraphics: Phaser.GameObjects.Graphics;
  private zone: Phaser.GameObjects.Zone;
  private startX: number;
  private startY: number;
  private angle: number;
  private arcLength: number;
  private arcHeight: number;
  private lifetime: number;
  private elapsed = 0;
  private fadingOut = false;
  private _destroyed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, arcLength = 500) {
    this.scene = scene;
    this.startX = x;
    this.startY = y;
    this.angle = angle;
    this.arcLength = arcLength;
    this.arcHeight = arcLength * 0.35;
    this.lifetime = 18000;

    this.glowGraphics = scene.add.graphics();
    this.glowGraphics.setDepth(3);
    this.glowGraphics.setAlpha(0);

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(4);
    this.graphics.setAlpha(0);

    this.drawRainbow();

    const midPoint = this.getArcPoint(0.5);
    const zoneW = arcLength * 0.9;
    const zoneH = STAR_COLORS.length * BAND_WIDTH + 40;
    this.zone = scene.add.zone(midPoint.x, midPoint.y, zoneW, zoneH);
    scene.physics.add.existing(this.zone, true);

    scene.tweens.add({
      targets: [this.graphics, this.glowGraphics],
      alpha: 1,
      duration: 1500,
      ease: 'Sine.easeInOut',
    });
  }

  get destroyed(): boolean { return this._destroyed; }

  getArcPoint(t: number): { x: number; y: number } {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const localX = t * this.arcLength;
    const localY = -Math.sin(t * Math.PI) * this.arcHeight;
    return {
      x: this.startX + localX * cos - localY * sin,
      y: this.startY + localX * sin + localY * cos,
    };
  }

  getRideDirection(t: number): { dx: number; dy: number } {
    const p1 = this.getArcPoint(Math.max(0, t - 0.02));
    const p2 = this.getArcPoint(Math.min(1, t + 0.02));
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { dx: dx / len, dy: dy / len };
  }

  getClosestProgress(px: number, py: number): number {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const pt = this.getArcPoint(t);
      const d = (pt.x - px) ** 2 + (pt.y - py) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  }

  applyRideForce(playerSprite: Phaser.Physics.Arcade.Sprite): void {
    const progress = this.getClosestProgress(playerSprite.x, playerSprite.y);
    const dir = this.getRideDirection(progress);
    const body = playerSprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(
      body.velocity.x * 0.9 + dir.dx * RIDE_SPEED * 0.1,
      body.velocity.y * 0.9 + dir.dy * RIDE_SPEED * 0.1,
    );
  }

  getPhysicsZone(): Phaser.GameObjects.Zone {
    return this.zone;
  }

  private drawRainbow(): void {
    const numBands = STAR_COLORS.length;

    for (let b = 0; b < numBands; b++) {
      const cfg = STAR_COLORS[b];
      const offset = (b - numBands / 2) * BAND_WIDTH;

      this.glowGraphics.lineStyle(BAND_WIDTH * 2.5, cfg.hex, 0.12);
      this.glowGraphics.beginPath();
      this.graphics.lineStyle(BAND_WIDTH, cfg.hex, 0.85);
      this.graphics.beginPath();

      let firstGlow = true;
      let firstMain = true;
      for (let s = 0; s <= BRIDGE_SEGMENTS; s++) {
        const t = s / BRIDGE_SEGMENTS;
        const pt = this.getArcPoint(t);
        const nextPt = this.getArcPoint(Math.min(1, t + 0.01));
        const dx = nextPt.x - pt.x;
        const dy = nextPt.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;

        const px = pt.x + nx * offset;
        const py = pt.y + ny * offset;

        if (firstGlow) {
          this.glowGraphics.moveTo(px, py);
          firstGlow = false;
        } else {
          this.glowGraphics.lineTo(px, py);
        }
        if (firstMain) {
          this.graphics.moveTo(px, py);
          firstMain = false;
        } else {
          this.graphics.lineTo(px, py);
        }
      }
      this.glowGraphics.strokePath();
      this.graphics.strokePath();
    }
  }

  update(delta: number): void {
    if (this._destroyed) return;
    this.elapsed += delta;

    if (!this.fadingOut && this.elapsed >= this.lifetime) {
      this.fadeOut();
    }
  }

  private fadeOut(): void {
    if (this.fadingOut) return;
    this.fadingOut = true;
    this.scene.tweens.add({
      targets: [this.graphics, this.glowGraphics],
      alpha: 0,
      duration: 2000,
      ease: 'Sine.easeInOut',
      onComplete: () => this.destroy(),
    });
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;
    this.graphics.destroy();
    this.glowGraphics.destroy();
    this.zone.destroy();
  }
}

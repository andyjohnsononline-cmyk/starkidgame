import Phaser from 'phaser';

const BASE_RADIUS = 60;
const THUMB_RADIUS = 24;
const BASE_ALPHA = 0.25;
const THUMB_ALPHA = 0.4;

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private base: Phaser.GameObjects.Graphics;
  private thumb: Phaser.GameObjects.Graphics;
  private origin: Phaser.Math.Vector2 | null = null;
  private _direction = new Phaser.Math.Vector2(0, 0);
  private _isActive = false;

  get direction(): Phaser.Math.Vector2 { return this._direction; }
  get isActive(): boolean { return this._isActive; }

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.base = scene.add.graphics();
    this.base.setDepth(200);
    this.base.setScrollFactor(0);
    this.base.setAlpha(0);

    this.thumb = scene.add.graphics();
    this.thumb.setDepth(201);
    this.thumb.setScrollFactor(0);
    this.thumb.setAlpha(0);

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.onDown(pointer);
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this._isActive) this.onMove(pointer);
    });

    scene.input.on('pointerup', () => {
      this.onUp();
    });
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    const x = pointer.x;
    const y = pointer.y;

    this.origin = new Phaser.Math.Vector2(x, y);
    this._isActive = true;
    this._direction.set(0, 0);

    this.drawBase(x, y);
    this.drawThumb(x, y);

    this.base.setAlpha(BASE_ALPHA);
    this.thumb.setAlpha(THUMB_ALPHA);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (!this.origin) return;

    const dx = pointer.x - this.origin.x;
    const dy = pointer.y - this.origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const clampedDist = Math.min(dist, BASE_RADIUS);
    const magnitude = clampedDist / BASE_RADIUS;

    if (dist > 0) {
      this._direction.set((dx / dist) * magnitude, (dy / dist) * magnitude);
    }

    const thumbX = this.origin.x + (dist > 0 ? (dx / dist) * clampedDist : 0);
    const thumbY = this.origin.y + (dist > 0 ? (dy / dist) * clampedDist : 0);
    this.drawThumb(thumbX, thumbY);
  }

  private onUp(): void {
    this._isActive = false;
    this._direction.set(0, 0);
    this.origin = null;

    this.scene.tweens.add({
      targets: [this.base, this.thumb],
      alpha: 0,
      duration: 150,
      ease: 'Sine.easeOut',
    });
  }

  private drawBase(x: number, y: number): void {
    this.base.clear();
    this.base.lineStyle(2, 0xffffff, 0.5);
    this.base.strokeCircle(x, y, BASE_RADIUS);
    this.base.fillStyle(0xffffff, 0.08);
    this.base.fillCircle(x, y, BASE_RADIUS);
  }

  private drawThumb(x: number, y: number): void {
    this.thumb.clear();
    this.thumb.fillStyle(0xffffff, 0.6);
    this.thumb.fillCircle(x, y, THUMB_RADIUS);
  }
}

import Phaser from 'phaser';
import {
  PLANET_RADIUS,
  PLANET_CENTER_X,
  PLANET_CENTER_Y,
  PLANET_GRAVITY,
  PLANET_GRAVITY_RANGE,
} from '../utils/colors';

export class Planet {
  public readonly centerX = PLANET_CENTER_X;
  public readonly centerY = PLANET_CENTER_Y;
  public readonly radius = PLANET_RADIUS;
  public readonly spawnX = PLANET_CENTER_X;
  public readonly spawnY = PLANET_CENTER_Y - PLANET_RADIUS - 40;

  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image;

  private atmosphereGlow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.sprite = scene.add.image(this.centerX, this.centerY, 'planet');

    const imgDiameter = Math.max(this.sprite.width, this.sprite.height);
    const targetDiameter = this.radius * 2;
    const scale = targetDiameter / imgDiameter;
    this.sprite.setScale(scale);

    this.sprite.setDepth(3);

    this.atmosphereGlow = scene.add.graphics();
    this.atmosphereGlow.setDepth(3.5);
    this.drawAtmosphere();
  }

  private drawAtmosphere(): void {
    const g = this.atmosphereGlow;
    const layers = [
      { offset: 8, width: 5, color: 0x66ccff, alpha: 0.18 },
      { offset: 20, width: 4, color: 0x44aaff, alpha: 0.12 },
      { offset: 35, width: 3, color: 0x3388dd, alpha: 0.07 },
      { offset: 50, width: 2, color: 0x2266bb, alpha: 0.04 },
    ];

    for (const layer of layers) {
      g.lineStyle(layer.width, layer.color, layer.alpha);
      g.beginPath();
      g.arc(this.centerX, this.centerY, this.radius + layer.offset, Math.PI * 1.15, Math.PI * 1.85, false);
      g.strokePath();
    }
  }

  applyGravity(sprite: Phaser.Physics.Arcade.Sprite, delta: number): void {
    const dx = this.centerX - sprite.x;
    const dy = this.centerY - sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const surfaceDist = dist - this.radius;

    if (surfaceDist > PLANET_GRAVITY_RANGE) return;

    let strength = PLANET_GRAVITY;
    const fadeZone = 200;
    if (surfaceDist > PLANET_GRAVITY_RANGE - fadeZone) {
      strength *= (PLANET_GRAVITY_RANGE - surfaceDist) / fadeZone;
    }

    const dt = delta / 1000;
    const body = sprite.body as Phaser.Physics.Arcade.Body;
    body.velocity.x += (dx / dist) * strength * dt;
    body.velocity.y += (dy / dist) * strength * dt;
  }

  constrainToSurface(sprite: Phaser.Physics.Arcade.Sprite): void {
    const dx = sprite.x - this.centerX;
    const dy = sprite.y - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const surfaceRadius = this.radius - 30;
    if (dist >= surfaceRadius) return;

    const angle = Math.atan2(dy, dx);
    sprite.setPosition(
      this.centerX + Math.cos(angle) * surfaceRadius,
      this.centerY + Math.sin(angle) * surfaceRadius,
    );

    const body = sprite.body as Phaser.Physics.Arcade.Body;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const dot = body.velocity.x * nx + body.velocity.y * ny;
    if (dot < 0) {
      body.velocity.x -= dot * nx;
      body.velocity.y -= dot * ny;
    }
  }
}

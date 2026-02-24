import Phaser from 'phaser';

const PORTAL_RADIUS = 40;
const RING_COUNT = 4;
const COOLDOWN_MS = 1500;
const TINT_A = 0x8855ff;
const TINT_B = 0x44ccff;

interface PortalEnd {
  x: number;
  y: number;
  graphics: Phaser.GameObjects.Graphics;
  glowGraphics: Phaser.GameObjects.Graphics;
  zone: Phaser.GameObjects.Zone;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter;
}

export class Portal {
  private scene: Phaser.Scene;
  private endA: PortalEnd;
  private endB: PortalEnd;
  private cooldownUntil = 0;
  private revealedA = false;
  private revealedB = false;
  private targetAlphaA = 0.15;
  private targetAlphaB = 0.15;

  constructor(scene: Phaser.Scene, ax: number, ay: number, bx: number, by: number) {
    this.scene = scene;
    this.endA = this.createEnd(ax, ay);
    this.endB = this.createEnd(bx, by);
  }

  private createEnd(x: number, y: number): PortalEnd {
    const glowGraphics = this.scene.add.graphics();
    glowGraphics.setDepth(3);
    glowGraphics.setAlpha(0.15);

    const graphics = this.scene.add.graphics();
    graphics.setDepth(4);
    graphics.setAlpha(0.15);

    const zone = this.scene.add.zone(x, y, PORTAL_RADIUS * 2, PORTAL_RADIUS * 2);
    this.scene.physics.add.existing(zone, true);

    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 5, max: 20 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 2000,
      frequency: 300,
      tint: [TINT_A, TINT_B, 0xffffff],
      blendMode: 'ADD',
      angle: { min: 0, max: 360 },
    });
    emitter.setDepth(5);
    emitter.setAlpha(0.15);

    return { x, y, graphics, glowGraphics, zone, emitter };
  }

  private drawEnd(end: PortalEnd, time: number): void {
    const t = time / 1000;
    const g = end.graphics;
    const glow = end.glowGraphics;

    g.clear();
    glow.clear();

    for (let i = 0; i < RING_COUNT; i++) {
      const rotation = t * (1.2 + i * 0.4) * (i % 2 === 0 ? 1 : -1);
      const radius = PORTAL_RADIUS - i * 8;
      const pulse = 0.7 + 0.3 * Math.sin(t * 2 + i * 1.5);
      const color = i % 2 === 0 ? TINT_A : TINT_B;

      // Outer glow ring
      glow.lineStyle(6, color, 0.08 * pulse);
      glow.beginPath();
      glow.arc(end.x, end.y, radius + 4, rotation, rotation + Math.PI * 1.7, false);
      glow.strokePath();

      // Main ring
      g.lineStyle(2.5, color, 0.6 * pulse);
      g.beginPath();
      g.arc(end.x, end.y, radius, rotation, rotation + Math.PI * 1.7, false);
      g.strokePath();
    }

    // Center glow
    const centerPulse = 0.5 + 0.5 * Math.sin(t * 3);
    glow.fillStyle(0xffffff, 0.05 * centerPulse);
    glow.fillCircle(end.x, end.y, PORTAL_RADIUS * 0.6);
    g.fillStyle(TINT_A, 0.12 * centerPulse);
    g.fillCircle(end.x, end.y, 8);
    g.fillStyle(0xffffff, 0.2 * centerPulse);
    g.fillCircle(end.x, end.y, 3);

    // Orbiting dot
    const orbitAngle = t * 2;
    const orbitR = PORTAL_RADIUS * 0.7;
    const dotX = end.x + Math.cos(orbitAngle) * orbitR;
    const dotY = end.y + Math.sin(orbitAngle) * orbitR;
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(dotX, dotY, 2);
  }

  getZoneA(): Phaser.GameObjects.Zone { return this.endA.zone; }
  getZoneB(): Phaser.GameObjects.Zone { return this.endB.zone; }

  teleportFrom(which: 'A' | 'B', player: Phaser.Physics.Arcade.Sprite): boolean {
    const now = this.scene.time.now;
    if (now < this.cooldownUntil) return false;

    const target = which === 'A' ? this.endB : this.endA;
    this.cooldownUntil = now + COOLDOWN_MS;

    // Camera flash
    this.scene.cameras.main.flash(300, 130, 80, 255, false);

    player.setPosition(target.x, target.y);
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(body.velocity.x * 0.3, body.velocity.y * 0.3);

    // Arrival burst
    const burst = this.scene.add.particles(target.x, target.y, 'particle', {
      speed: { min: 40, max: 120 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 400,
      quantity: 15,
      tint: [TINT_A, TINT_B, 0xffffff],
      blendMode: 'ADD',
      emitting: false,
    });
    burst.explode(15);
    this.scene.time.delayedCall(500, () => burst.destroy());

    return true;
  }

  update(time: number, playerX: number, playerY: number): void {
    this.drawEnd(this.endA, time);
    this.drawEnd(this.endB, time);

    // Discovery reveal: fade in when player is nearby
    const revealDist = 300;
    const distA = Math.sqrt((playerX - this.endA.x) ** 2 + (playerY - this.endA.y) ** 2);
    const distB = Math.sqrt((playerX - this.endB.x) ** 2 + (playerY - this.endB.y) ** 2);

    if (!this.revealedA && distA < revealDist) {
      this.revealedA = true;
      this.targetAlphaA = 1;
      this.scene.tweens.add({
        targets: [this.endA.graphics, this.endA.glowGraphics, this.endA.emitter],
        alpha: 1,
        duration: 1200,
        ease: 'Sine.easeInOut',
      });
    }
    if (!this.revealedB && distB < revealDist) {
      this.revealedB = true;
      this.targetAlphaB = 1;
      this.scene.tweens.add({
        targets: [this.endB.graphics, this.endB.glowGraphics, this.endB.emitter],
        alpha: 1,
        duration: 1200,
        ease: 'Sine.easeInOut',
      });
    }
  }

  destroy(): void {
    this.endA.graphics.destroy();
    this.endA.glowGraphics.destroy();
    this.endA.zone.destroy();
    this.endA.emitter.destroy();
    this.endB.graphics.destroy();
    this.endB.glowGraphics.destroy();
    this.endB.zone.destroy();
    this.endB.emitter.destroy();
  }
}

import Phaser from 'phaser';

export class StarKid extends Phaser.Physics.Arcade.Sprite {
  private glowSprite: Phaser.GameObjects.Sprite;
  private auraParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private materialized = false;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'starkid');
    this.baseY = y;
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(15);
    this.setAlpha(0);
    this.setScale(0.05);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setCircle(500, -65, 0);

    this.glowSprite = scene.add.sprite(x, y, 'starkid');
    this.glowSprite.setScale(0.10);
    this.glowSprite.setAlpha(0);
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setDepth(14);

    this.auraParticles = scene.add.particles(x, y, 'particle', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 1500,
      frequency: 80,
      blendMode: 'ADD',
      tint: [0xffd700, 0xffcc00, 0xffe066],
      emitting: false,
    });
    this.auraParticles.setDepth(13);
  }

  materialize(): void {
    if (this.materialized) return;
    this.materialized = true;

    this.auraParticles.emitting = true;

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 3000,
      ease: 'Sine.easeInOut',
    });

    this.scene.tweens.add({
      targets: this.glowSprite,
      alpha: 0.3,
      duration: 3000,
      ease: 'Sine.easeInOut',
    });
  }

  update(time: number): void {
    if (!this.materialized) return;
    const t = time / 1000;
    const float = Math.sin(t * 0.8) * 5;
    this.y = this.baseY + float;
    this.glowSprite.setPosition(this.x, this.y);
    this.auraParticles.setPosition(this.x, this.y);

    const pulse = 0.08 + 0.03 * Math.sin(t * 1.2);
    this.glowSprite.setScale(pulse);
    this.glowSprite.setAlpha(0.15 + 0.1 * Math.sin(t * 0.9));
  }
}

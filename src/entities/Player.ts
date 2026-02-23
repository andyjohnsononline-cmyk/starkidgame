import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';

const ACCELERATION = 280;
const MAX_SPEED = 220;
const DRAG = 60;

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private exhaust: Phaser.GameObjects.Particles.ParticleEmitter;
  private stunTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'astronaut');
    this.sprite.setDepth(10);
    this.sprite.setDrag(DRAG);
    this.sprite.setMaxVelocity(MAX_SPEED);
    this.sprite.setCollideWorldBounds(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 36);
    body.setOffset(6, 6);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.moveTarget = new Phaser.Math.Vector2(
        pointer.worldX,
        pointer.worldY,
      );
    });

    this.exhaust = scene.add.particles(0, 0, 'exhaust', {
      speed: { min: 30, max: 80 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      frequency: 40,
      blendMode: 'ADD',
      emitting: false,
    });
    this.exhaust.setDepth(9);
  }

  stun(duration: number): void {
    this.stunTimer = duration;
    this.sprite.setTint(0xff8888);
  }

  update(delta: number): void {
    if (this.stunTimer > 0) {
      this.stunTimer -= delta / 1000;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.sprite.clearTint();
      }
      this.updateExhaust(false);
      return;
    }

    let ax = 0, ay = 0;
    let keyboardActive = false;

    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) { ax -= ACCELERATION; keyboardActive = true; }
      if (this.cursors.right.isDown || this.wasd.D.isDown) { ax += ACCELERATION; keyboardActive = true; }
      if (this.cursors.up.isDown || this.wasd.W.isDown) { ay -= ACCELERATION; keyboardActive = true; }
      if (this.cursors.down.isDown || this.wasd.S.isDown) { ay += ACCELERATION; keyboardActive = true; }
    }

    if (keyboardActive) {
      this.moveTarget = null;
    }

    if (this.moveTarget && !keyboardActive) {
      const dx = this.moveTarget.x - this.sprite.x;
      const dy = this.moveTarget.y - this.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        this.moveTarget = null;
      } else {
        ax = (dx / dist) * ACCELERATION;
        ay = (dy / dist) * ACCELERATION;
      }
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAcceleration(ax, ay);

    const isThrusting = ax !== 0 || ay !== 0;
    this.updateExhaust(isThrusting);

    if (ax !== 0) {
      this.sprite.setFlipX(ax < 0);
    }
  }

  private updateExhaust(active: boolean): void {
    if (active) {
      this.exhaust.emitting = true;
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      this.exhaust.setPosition(
        this.sprite.x - Math.cos(angle) * 16,
        this.sprite.y - Math.sin(angle) * 8 + 10,
      );
    } else {
      this.exhaust.emitting = false;
    }
  }
}

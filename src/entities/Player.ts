import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';
import { audioManager } from '../systems/AudioManager';
import type { VirtualJoystick } from '../ui/VirtualJoystick';

const ACCELERATION = 280;
const MAX_SPEED = 220;
const DRAG = 60;

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private pointerHeld = false;
  private exhaust: Phaser.GameObjects.Particles.ParticleEmitter;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private stunTimer = 0;
  private jetpackSoundCooldown = 0;
  private wasThrusting = false;
  private disoriented = false;
  private joystick: VirtualJoystick | null = null;

  constructor(scene: Phaser.Scene, spawnX: number = WORLD_WIDTH / 2, spawnY: number = WORLD_HEIGHT / 2, joystick?: VirtualJoystick) {
    this.scene = scene;
    this.joystick = joystick ?? null;

    this.sprite = scene.physics.add.sprite(spawnX, spawnY, 'astronaut');
    this.sprite.setDepth(10);
    this.sprite.setScale(1.0);
    this.sprite.setDrag(DRAG);
    this.sprite.setMaxVelocity(MAX_SPEED);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(48, 72);
    body.setOffset(8, 12);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    if (!this.joystick) {
      scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.pointerHeld = true;
        this.moveTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      });

      scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.pointerHeld) {
          this.moveTarget = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
        }
      });

      scene.input.on('pointerup', () => {
        this.pointerHeld = false;
        this.moveTarget = null;
      });
    }

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

    this.trail = scene.add.particles(0, 0, 'particle', {
      speed: { min: 2, max: 8 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.25, end: 0 },
      lifespan: 400,
      frequency: 30,
      tint: 0x8899bb,
      blendMode: 'ADD',
      emitting: false,
    });
    this.trail.setDepth(8);
  }

  stun(duration: number): void {
    this.stunTimer = duration;
    this.sprite.setTint(0xff8888);
  }

  setDisoriented(value: boolean): void {
    this.disoriented = value;
    if (value) {
      this.sprite.setMaxVelocity(MAX_SPEED * 0.5);
    } else {
      this.sprite.setMaxVelocity(MAX_SPEED);
    }
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

    if (!keyboardActive && this.joystick?.isActive) {
      const dir = this.joystick.direction;
      const magnitude = dir.length();
      if (magnitude > 0.1) {
        ax = dir.x * ACCELERATION;
        ay = dir.y * ACCELERATION;
      }
    } else if (this.moveTarget && !keyboardActive) {
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

    this.jetpackSoundCooldown = Math.max(0, this.jetpackSoundCooldown - delta / 1000);
    if (isThrusting && !this.wasThrusting && this.jetpackSoundCooldown <= 0) {
      audioManager.playJetpackBurst();
      this.jetpackSoundCooldown = 0.15;
    }
    this.wasThrusting = isThrusting;

    if (ax !== 0) {
      this.sprite.setFlipX(ax < 0);
    }

    this.clampToWorldEdges();
  }

  private clampToWorldEdges(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const halfW = body.width / 2;
    const halfH = body.height / 2;

    if (this.sprite.x - halfW < 0) {
      this.sprite.x = halfW;
      body.velocity.x = Math.max(0, body.velocity.x);
    } else if (this.sprite.x + halfW > WORLD_WIDTH) {
      this.sprite.x = WORLD_WIDTH - halfW;
      body.velocity.x = Math.min(0, body.velocity.x);
    }

    if (this.sprite.y - halfH < 0) {
      this.sprite.y = halfH;
      body.velocity.y = Math.max(0, body.velocity.y);
    } else if (this.sprite.y + halfH > WORLD_HEIGHT) {
      this.sprite.y = WORLD_HEIGHT - halfH;
      body.velocity.y = Math.min(0, body.velocity.y);
    }
  }

  private updateExhaust(active: boolean): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

    if (active) {
      this.exhaust.emitting = true;
      const angle = Math.atan2(body.velocity.y, body.velocity.x);
      this.exhaust.setPosition(
        this.sprite.x - Math.cos(angle) * 30,
        this.sprite.y - Math.sin(angle) * 15 + 25,
      );
    } else {
      this.exhaust.emitting = false;
    }

    const trailThreshold = MAX_SPEED * 0.45;
    if (speed > trailThreshold) {
      this.trail.emitting = true;
      this.trail.setPosition(this.sprite.x, this.sprite.y);
      this.trail.setParticleAlpha({ start: 0.15 + 0.15 * (speed / MAX_SPEED), end: 0 });
    } else {
      this.trail.emitting = false;
    }
  }
}

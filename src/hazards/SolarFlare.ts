import Phaser from 'phaser';

const FLARE_INTERVAL = 30000;
const FLARE_DURATION = 2500;
const WARNING_TIME = 3500;

export class SolarFlare {
  private scene: Phaser.Scene;
  private overlay: Phaser.GameObjects.Graphics;
  private timer: Phaser.Time.TimerEvent;
  private active = false;
  public isDisorienting = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.overlay = scene.add.graphics();
    this.overlay.setDepth(200);
    this.overlay.setScrollFactor(0);
    this.overlay.setAlpha(0);

    this.timer = scene.time.addEvent({
      delay: FLARE_INTERVAL + Math.random() * 10000,
      callback: this.triggerFlare,
      callbackScope: this,
      loop: true,
    });
  }

  private triggerFlare(): void {
    if (this.active) return;
    this.active = true;

    // Warning flash
    this.overlay.clear();
    this.overlay.fillStyle(0xffffcc, 1);
    this.overlay.fillRect(0, 0, 1024, 768);

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: { from: 0, to: 0.10 },
      duration: WARNING_TIME,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.fireFlare();
      },
    });
  }

  private fireFlare(): void {
    this.isDisorienting = true;

    this.scene.tweens.add({
      targets: this.overlay,
      alpha: { from: 0.35, to: 0 },
      duration: FLARE_DURATION,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.active = false;
        this.isDisorienting = false;
        this.overlay.setAlpha(0);
      },
    });

  }

  destroy(): void {
    this.timer.destroy();
    this.overlay.destroy();
  }
}

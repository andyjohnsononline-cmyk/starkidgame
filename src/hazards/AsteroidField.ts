import Phaser from 'phaser';

export class AsteroidField {
  public group: Phaser.Physics.Arcade.Group;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, zones: { x: number; y: number; count: number }[]) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    for (const zone of zones) {
      this.createField(zone.x, zone.y, zone.count);
    }
  }

  private createField(cx: number, cy: number, count: number): void {
    const textures = ['asteroid_sm', 'asteroid_md', 'asteroid_lg'];
    for (let i = 0; i < count; i++) {
      const tex = textures[Math.floor(Math.random() * textures.length)];
      const x = cx + (Math.random() - 0.5) * 400;
      const y = cy + (Math.random() - 0.5) * 400;
      const asteroid = this.scene.physics.add.sprite(x, y, tex);
      asteroid.setDepth(3);
      asteroid.setAngularVelocity((Math.random() - 0.5) * 30);

      const vx = (Math.random() - 0.5) * 20;
      const vy = (Math.random() - 0.5) * 20;
      asteroid.setVelocity(vx, vy);

      const body = asteroid.body as Phaser.Physics.Arcade.Body;
      body.setBounce(0.8);
      body.setCollideWorldBounds(true);
      body.setImmovable(true);

      this.group.add(asteroid);
    }
  }
}

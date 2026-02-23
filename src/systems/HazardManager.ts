import Phaser from 'phaser';
import { AsteroidField } from '../hazards/AsteroidField';
import { BlackHole } from '../hazards/BlackHole';
import { NebulaFog } from '../hazards/NebulaFog';
import { SolarFlare } from '../hazards/SolarFlare';
import { Player } from '../entities/Player';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../utils/colors';

export class HazardManager {
  private scene: Phaser.Scene;
  public asteroidField: AsteroidField;
  public blackHoles: BlackHole[] = [];
  public nebulaFogs: NebulaFog[] = [];
  public solarFlare: SolarFlare;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.asteroidField = new AsteroidField(scene, [
      { x: 800, y: 600, count: 8 },
      { x: 2800, y: 1200, count: 10 },
      { x: 1200, y: 2400, count: 7 },
      { x: 3400, y: 2200, count: 9 },
    ]);

    this.blackHoles.push(
      new BlackHole(scene, 1600, 900),
      new BlackHole(scene, 3000, 2000),
      new BlackHole(scene, 600, 2100),
    );

    this.nebulaFogs.push(
      new NebulaFog(scene, 2200, 700),
      new NebulaFog(scene, 1000, 1600),
      new NebulaFog(scene, 3300, 1400),
      new NebulaFog(scene, 2600, 2500),
    );

    this.solarFlare = new SolarFlare(scene);
  }

  update(player: Player): void {
    const body = player.sprite.body as Phaser.Physics.Arcade.Body;

    for (const bh of this.blackHoles) {
      bh.applyGravity(body);
    }

    for (const nf of this.nebulaFogs) {
      nf.update(player.sprite.x, player.sprite.y);
    }
  }

  setupCollisions(player: Player): void {
    this.scene.physics.add.collider(
      player.sprite,
      this.asteroidField.group,
      (_playerObj, _asteroid) => {
        const body = player.sprite.body as Phaser.Physics.Arcade.Body;
        const asteroidBody = (_asteroid as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;

        const dx = body.center.x - asteroidBody.center.x;
        const dy = body.center.y - asteroidBody.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        body.velocity.x = (dx / dist) * 200;
        body.velocity.y = (dy / dist) * 200;

        player.stun(0.5);
      },
    );
  }
}

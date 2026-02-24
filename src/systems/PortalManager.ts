import Phaser from 'phaser';
import { Portal } from '../entities/Portal';
import { WORLD_WIDTH, WORLD_HEIGHT, PLANET_CENTER_X, PLANET_CENTER_Y, PLANET_RADIUS } from '../utils/colors';

const PORTAL_PAIRS = 4;
const MARGIN = 250;
const MIN_PAIR_DISTANCE = 800;

export class PortalManager {
  private scene: Phaser.Scene;
  private portals: Portal[] = [];
  private overlaps: Phaser.Physics.Arcade.Collider[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.spawnPortals();
  }

  private isInsidePlanet(x: number, y: number): boolean {
    const dx = x - PLANET_CENTER_X;
    const dy = y - PLANET_CENTER_Y;
    return Math.sqrt(dx * dx + dy * dy) < PLANET_RADIUS + 100;
  }

  private safePosition(): { x: number; y: number } {
    for (let i = 0; i < 100; i++) {
      const x = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
      const y = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);
      if (!this.isInsidePlanet(x, y)) return { x, y };
    }
    return { x: WORLD_WIDTH / 2, y: MARGIN };
  }

  private spawnPortals(): void {
    for (let i = 0; i < PORTAL_PAIRS; i++) {
      const a = this.safePosition();

      let b = this.safePosition();
      for (let attempt = 0; attempt < 30; attempt++) {
        b = this.safePosition();
        const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
        if (dist >= MIN_PAIR_DISTANCE) break;
      }

      const portal = new Portal(this.scene, a.x, a.y, b.x, b.y);
      this.portals.push(portal);
    }
  }

  setupOverlaps(player: Phaser.Physics.Arcade.Sprite): void {
    for (const portal of this.portals) {
      const overlapA = this.scene.physics.add.overlap(
        player,
        portal.getZoneA(),
        () => portal.teleportFrom('A', player),
      );
      const overlapB = this.scene.physics.add.overlap(
        player,
        portal.getZoneB(),
        () => portal.teleportFrom('B', player),
      );
      this.overlaps.push(overlapA, overlapB);
    }
  }

  update(time: number, playerX: number, playerY: number): void {
    for (const portal of this.portals) {
      portal.update(time, playerX, playerY);
    }
  }
}

import Phaser from 'phaser';
import { Star } from '../entities/Star';
import { STAR_COLORS, StarColor, WORLD_WIDTH, WORLD_HEIGHT, GOLD_SPAWN_COUNT } from '../utils/colors';

const MARGIN = 150;
const CLUSTER_SPREAD = 120;

export class StarSpawner {
  private scene: Phaser.Scene;
  public stars: Star[] = [];
  public starGroup: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.starGroup = scene.physics.add.staticGroup();
    this.spawnAll();
  }

  private spawnAll(): void {
    for (const cfg of STAR_COLORS) {
      this.spawnColor(cfg.color, cfg.rarity, cfg.spawnCount);
    }
    this.spawnGoldStars();
  }

  private spawnGoldStars(): void {
    for (let i = 0; i < GOLD_SPAWN_COUNT; i++) {
      const x = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
      const y = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);
      this.placeStar(StarColor.Gold, x, y);
    }
  }

  private spawnColor(color: StarColor, rarity: string, count: number): void {
    if (rarity === 'common') {
      this.spawnClustered(color, count);
    } else if (rarity === 'uncommon') {
      this.spawnScattered(color, count);
    } else {
      this.spawnEdge(color, count);
    }
  }

  private spawnClustered(color: StarColor, count: number): void {
    let placed = 0;
    while (placed < count) {
      const clusterSize = Math.min(2 + Math.floor(Math.random() * 3), count - placed);
      const cx = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
      const cy = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);

      for (let i = 0; i < clusterSize; i++) {
        const x = cx + (Math.random() - 0.5) * CLUSTER_SPREAD;
        const y = cy + (Math.random() - 0.5) * CLUSTER_SPREAD;
        this.placeStar(color, clamp(x, MARGIN, WORLD_WIDTH - MARGIN), clamp(y, MARGIN, WORLD_HEIGHT - MARGIN));
        placed++;
      }
    }
  }

  private spawnScattered(color: StarColor, count: number): void {
    for (let i = 0; i < count; i++) {
      const x = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
      const y = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);
      this.placeStar(color, x, y);
    }
  }

  private spawnEdge(color: StarColor, count: number): void {
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      const edge = Math.floor(Math.random() * 4);
      const innerMargin = MARGIN * 2;
      const outerZone = 400;

      switch (edge) {
        case 0: // top edge
          x = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
          y = MARGIN + Math.random() * outerZone;
          break;
        case 1: // bottom edge
          x = MARGIN + Math.random() * (WORLD_WIDTH - MARGIN * 2);
          y = WORLD_HEIGHT - MARGIN - Math.random() * outerZone;
          break;
        case 2: // left edge
          x = MARGIN + Math.random() * outerZone;
          y = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);
          break;
        default: // right edge
          x = WORLD_WIDTH - MARGIN - Math.random() * outerZone;
          y = MARGIN + Math.random() * (WORLD_HEIGHT - MARGIN * 2);
          break;
      }
      this.placeStar(color, x, y);
    }
  }

  private placeStar(color: StarColor, x: number, y: number): void {
    const star = new Star(this.scene, x, y, color);
    this.starGroup.add(star);
    this.stars.push(star);
  }

  removeStar(star: Star): void {
    const idx = this.stars.indexOf(star);
    if (idx >= 0) this.stars.splice(idx, 1);
    star.collect();
  }

  removeAllStars(): void {
    for (const star of [...this.stars]) {
      star.collect();
    }
    this.stars.length = 0;
  }

  update(time: number, playerX?: number, playerY?: number): void {
    const magnetRadius = 60;
    const magnetStrength = 1.5;

    for (const star of this.stars) {
      star.update(time);

      if (playerX !== undefined && playerY !== undefined) {
        const dx = playerX - star.x;
        const dy = playerY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < magnetRadius && dist > 5) {
          const pull = magnetStrength * (1 - dist / magnetRadius);
          star.nudge(dx / dist * pull, dy / dist * pull);
        }
      }
    }
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

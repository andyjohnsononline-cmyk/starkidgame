import Phaser from 'phaser';
import { generateAllTextures } from '../utils/sprites';

const SPRITE_ASSETS: Array<{ key: string; path: string }> = [
  { key: 'astronaut', path: 'assets/astronaut.png' },
  { key: 'starkid', path: 'assets/starkid.png' },
  { key: 'star_red', path: 'assets/star_red.png' },
  { key: 'star_orange', path: 'assets/star_orange.png' },
  { key: 'star_yellow', path: 'assets/star_yellow.png' },
  { key: 'star_green', path: 'assets/star_green.png' },
  { key: 'star_blue', path: 'assets/star_blue.png' },
  { key: 'star_indigo', path: 'assets/star_indigo.png' },
  { key: 'star_violet', path: 'assets/star_violet.png' },
  { key: 'asteroid_sm', path: 'assets/asteroid_sm.png' },
  { key: 'asteroid_md', path: 'assets/asteroid_md.png' },
  { key: 'asteroid_lg', path: 'assets/asteroid_lg.png' },
  { key: 'blackhole', path: 'assets/blackhole.png' },
  { key: 'nebula', path: 'assets/nebula.png' },
  { key: 'particle', path: 'assets/particle.png' },
  { key: 'exhaust', path: 'assets/exhaust.png' },
  { key: 'planet', path: 'assets/planet.png' },
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.on('loaderror', () => {
      // Silently ignore missing asset files; programmatic fallbacks will be used
    });

    for (const asset of SPRITE_ASSETS) {
      this.load.image(asset.key, asset.path);
    }
  }

  create(): void {
    generateAllTextures(this);
    this.scene.start('GameScene');
  }
}

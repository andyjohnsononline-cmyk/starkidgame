import Phaser from 'phaser';
import { generateAllTextures } from '../utils/sprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    generateAllTextures(this);
    this.scene.start('GameScene');
  }
}

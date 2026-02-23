import Phaser from 'phaser';
import { STAR_COLORS, StarColor, REQUIRED_PER_COLOR, StarColorConfig } from '../utils/colors';

export class SpectrumHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private segments: Map<StarColor, { bg: Phaser.GameObjects.Graphics; fill: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text }> = new Map();
  private collected: Map<StarColor, number> = new Map();
  private completed: Set<StarColor> = new Set();
  private bloomed = false;
  private bloomOverlay: Phaser.GameObjects.Graphics;

  private readonly segWidth = 100;
  private readonly segHeight = 28;
  private readonly gap = 4;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setScrollFactor(0);

    this.bloomOverlay = scene.add.graphics();
    this.bloomOverlay.setDepth(99);
    this.bloomOverlay.setScrollFactor(0);
    this.bloomOverlay.setAlpha(0);

    for (const cfg of STAR_COLORS) {
      this.collected.set(cfg.color, 0);
    }

    this.createHUD();
  }

  private createHUD(): void {
    const totalWidth = STAR_COLORS.length * this.segWidth + (STAR_COLORS.length - 1) * this.gap;
    const startX = (1024 - totalWidth) / 2;
    const y = 768 - this.segHeight - 16;

    // Background panel
    const panelBg = this.scene.add.graphics();
    panelBg.fillStyle(0x000000, 0.5);
    panelBg.fillRoundedRect(startX - 10, y - 8, totalWidth + 20, this.segHeight + 16, 8);
    this.container.add(panelBg);

    STAR_COLORS.forEach((cfg, i) => {
      const x = startX + i * (this.segWidth + this.gap);

      const bg = this.scene.add.graphics();
      bg.fillStyle(cfg.hex, 0.15);
      bg.fillRoundedRect(x, y, this.segWidth, this.segHeight, 4);
      bg.lineStyle(1, cfg.hex, 0.3);
      bg.strokeRoundedRect(x, y, this.segWidth, this.segHeight, 4);
      this.container.add(bg);

      const fill = this.scene.add.graphics();
      this.container.add(fill);

      const text = this.scene.add.text(x + this.segWidth / 2, y + this.segHeight / 2, '0/10', {
        fontSize: '13px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center',
      });
      text.setOrigin(0.5);
      text.setAlpha(0.8);
      this.container.add(text);

      this.segments.set(cfg.color, { bg, fill, text });
    });
  }

  addStar(color: StarColor): { count: number; justCompleted: boolean; allComplete: boolean } {
    const current = (this.collected.get(color) || 0) + 1;
    this.collected.set(color, current);

    const justCompleted = current === REQUIRED_PER_COLOR && !this.completed.has(color);
    if (justCompleted) {
      this.completed.add(color);
      this.pulseSegment(color);
    }

    this.updateSegment(color);

    const allComplete = this.completed.size === STAR_COLORS.length;
    if (allComplete && !this.bloomed) {
      this.bloom();
    }

    return { count: current, justCompleted, allComplete };
  }

  private updateSegment(color: StarColor): void {
    const seg = this.segments.get(color);
    if (!seg) return;

    const count = this.collected.get(color) || 0;
    const cfg = STAR_COLORS.find(c => c.color === color)!;
    const idx = STAR_COLORS.indexOf(cfg);
    const totalWidth = STAR_COLORS.length * this.segWidth + (STAR_COLORS.length - 1) * this.gap;
    const startX = (1024 - totalWidth) / 2;
    const x = startX + idx * (this.segWidth + this.gap);
    const y = 768 - this.segHeight - 16;

    const fillRatio = Math.min(count / REQUIRED_PER_COLOR, 1);

    seg.fill.clear();
    if (fillRatio > 0) {
      const fillWidth = (this.segWidth - 4) * fillRatio;
      seg.fill.fillStyle(cfg.hex, 0.6);
      seg.fill.fillRoundedRect(x + 2, y + 2, fillWidth, this.segHeight - 4, 3);
    }

    seg.text.setText(`${Math.min(count, REQUIRED_PER_COLOR)}/${REQUIRED_PER_COLOR}`);
  }

  private pulseSegment(color: StarColor): void {
    const seg = this.segments.get(color);
    if (!seg) return;

    const cfg = STAR_COLORS.find(c => c.color === color)!;
    const idx = STAR_COLORS.indexOf(cfg);
    const totalWidth = STAR_COLORS.length * this.segWidth + (STAR_COLORS.length - 1) * this.gap;
    const startX = (1024 - totalWidth) / 2;
    const x = startX + idx * (this.segWidth + this.gap);
    const y = 768 - this.segHeight - 16;

    const flash = this.scene.add.graphics();
    flash.setScrollFactor(0);
    flash.setDepth(101);
    flash.fillStyle(cfg.hex, 0.5);
    flash.fillRoundedRect(x - 4, y - 4, this.segWidth + 8, this.segHeight + 8, 6);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      ease: 'Sine.easeOut',
      onComplete: () => flash.destroy(),
    });

    seg.fill.clear();
    seg.fill.fillStyle(cfg.hex, 0.9);
    seg.fill.fillRoundedRect(
      x + 2, y + 2,
      this.segWidth - 4, this.segHeight - 4, 3,
    );
  }

  private bloom(): void {
    this.bloomed = true;

    const totalWidth = STAR_COLORS.length * this.segWidth + (STAR_COLORS.length - 1) * this.gap;
    const startX = (1024 - totalWidth) / 2;
    const y = 768 - this.segHeight - 16;

    this.bloomOverlay.fillStyle(0xffffff, 0.3);
    this.bloomOverlay.fillRoundedRect(startX - 14, y - 12, totalWidth + 28, this.segHeight + 24, 10);

    this.scene.tweens.add({
      targets: this.bloomOverlay,
      alpha: { from: 0.8, to: 0.2 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  isComplete(): boolean {
    return this.bloomed;
  }

  getCollected(color: StarColor): number {
    return this.collected.get(color) || 0;
  }
}

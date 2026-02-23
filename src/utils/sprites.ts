import Phaser from 'phaser';
import { STAR_COLORS, GOLD_HEX } from './colors';

export function generateAllTextures(scene: Phaser.Scene): void {
  const has = (key: string) => scene.textures.exists(key) && scene.textures.get(key).key !== '__MISSING';

  if (!has('astronaut')) generateAstronautTexture(scene);

  if (!has('starkid')) generateStarKidTexture(scene);

  if (!has('star_red')) generateStarTextures(scene);
  if (!has('asteroid_sm')) generateAsteroidTextures(scene);
  if (!has('blackhole')) generateBlackHoleTexture(scene);
  if (!has('nebula')) generateNebulaTexture(scene);
  if (!has('particle')) generateParticleTexture(scene);
  if (!has('exhaust')) generateExhaustTexture(scene);
}

function generateAstronautTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const w = 32, h = 48;

  // Jetpack
  g.fillStyle(0x666666);
  g.fillRoundedRect(2, 16, 8, 20, 2);
  g.fillRoundedRect(22, 16, 8, 20, 2);

  // Jetpack nozzles
  g.fillStyle(0x444444);
  g.fillRect(3, 34, 6, 4);
  g.fillRect(23, 34, 6, 4);

  // Body (scrap metal suit)
  g.fillStyle(0x8899aa);
  g.fillRoundedRect(8, 18, 16, 22, 3);

  // Body panel lines
  g.lineStyle(1, 0x667788);
  g.lineBetween(12, 20, 12, 38);
  g.lineBetween(20, 20, 20, 38);
  g.lineBetween(10, 28, 22, 28);

  // Rivets
  g.fillStyle(0xaabbcc);
  g.fillCircle(10, 22, 1.5);
  g.fillCircle(22, 22, 1.5);
  g.fillCircle(10, 34, 1.5);
  g.fillCircle(22, 34, 1.5);

  // Glowing gauge on chest
  g.fillStyle(0x33ff88);
  g.fillCircle(16, 25, 2.5);
  g.fillStyle(0x88ffbb);
  g.fillCircle(16, 25, 1.2);

  // Arms
  g.fillStyle(0x778899);
  g.fillRoundedRect(4, 20, 6, 14, 2);
  g.fillRoundedRect(22, 20, 6, 14, 2);

  // Gloves
  g.fillStyle(0x556677);
  g.fillRoundedRect(4, 32, 6, 5, 2);
  g.fillRoundedRect(22, 32, 6, 5, 2);

  // Legs
  g.fillStyle(0x778899);
  g.fillRoundedRect(10, 38, 5, 8, 2);
  g.fillRoundedRect(17, 38, 5, 8, 2);

  // Boots
  g.fillStyle(0x556677);
  g.fillRoundedRect(9, 43, 7, 5, 2);
  g.fillRoundedRect(16, 43, 7, 5, 2);

  // Helmet
  g.fillStyle(0xccddee);
  g.fillCircle(16, 12, 11);

  // Visor
  g.fillStyle(0x224466);
  g.fillEllipse(16, 13, 16, 12);

  // Visor glare
  g.fillStyle(0x88bbff, 0.3);
  g.fillEllipse(13, 11, 5, 4);

  // Visor crack
  g.lineStyle(1, 0x99bbdd, 0.6);
  g.lineBetween(19, 9, 22, 15);
  g.lineBetween(22, 15, 20, 17);

  // Tuft of hair poking out top
  g.fillStyle(0x553311);
  g.fillTriangle(14, 2, 16, -2, 18, 2);
  g.fillTriangle(16, 3, 18, -1, 20, 3);

  g.generateTexture('astronaut', w, h);
  g.destroy();
}

function generateStarTextures(scene: Phaser.Scene): void {
  for (const cfg of STAR_COLORS) {
    const g = scene.add.graphics();
    const size = 24;
    const cx = size / 2, cy = size / 2;

    // Outer glow
    g.fillStyle(cfg.hex, 0.15);
    g.fillCircle(cx, cy, 11);
    g.fillStyle(cfg.hex, 0.3);
    g.fillCircle(cx, cy, 8);

    // Star shape (5-point)
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 7 : 3;
      points.push(new Phaser.Math.Vector2(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r));
    }
    g.fillStyle(cfg.hex);
    g.fillPoints(points, true);

    // Bright center
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx, cy, 2);

    g.generateTexture(`star_${cfg.color}`, size, size);
    g.destroy();
  }

  // Gold (bonus) star texture
  const gg = scene.add.graphics();
  const gSize = 24;
  const gcx = gSize / 2, gcy = gSize / 2;

  gg.fillStyle(GOLD_HEX, 0.15);
  gg.fillCircle(gcx, gcy, 11);
  gg.fillStyle(GOLD_HEX, 0.3);
  gg.fillCircle(gcx, gcy, 8);

  const gPoints: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? 7 : 3;
    gPoints.push(new Phaser.Math.Vector2(gcx + Math.cos(angle) * r, gcy + Math.sin(angle) * r));
  }
  gg.fillStyle(GOLD_HEX);
  gg.fillPoints(gPoints, true);

  gg.fillStyle(0xffffff, 0.8);
  gg.fillCircle(gcx, gcy, 2);

  gg.generateTexture('star_gold', gSize, gSize);
  gg.destroy();
}

function generateStarKidTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const w = 48, h = 64;
  const cx = w / 2, cy = h / 2;

  // Gold aura (outer glow layers)
  const auraColors = [0xffd700, 0xffcc00, 0xffaa00, 0xff9900, 0xffe066, 0xffc833, 0xffb700];
  for (let i = auraColors.length - 1; i >= 0; i--) {
    g.fillStyle(auraColors[i], 0.08);
    g.fillCircle(cx, cy, 30 - i * 1.5);
  }

  // Warm gold glow
  g.fillStyle(0xffd700, 0.15);
  g.fillCircle(cx, cy, 22);
  g.fillStyle(0xffe566, 0.12);
  g.fillCircle(cx, cy, 18);

  // Body silhouette (glowing child form)
  g.fillStyle(0xffeedd, 0.9);
  g.fillCircle(cx, 18, 9);

  g.fillStyle(0xffeedd, 0.85);
  g.fillRoundedRect(cx - 7, 25, 14, 20, 4);

  // Arms
  g.fillRoundedRect(cx - 13, 27, 7, 12, 3);
  g.fillRoundedRect(cx + 6, 27, 7, 12, 3);

  // Legs
  g.fillRoundedRect(cx - 6, 43, 5, 10, 2);
  g.fillRoundedRect(cx + 1, 43, 5, 10, 2);

  // Face — simple, warm
  g.fillStyle(0x553300);
  g.fillCircle(cx - 3, 17, 1.5);
  g.fillCircle(cx + 3, 17, 1.5);

  // Smile
  g.lineStyle(1.5, 0x553300);
  g.beginPath();
  g.arc(cx, 19, 3, 0.2, Math.PI - 0.2, false);
  g.strokePath();

  // Star sparkles around body
  const sparklePositions = [
    [8, 10], [38, 12], [6, 50], [40, 48], [cx, 4], [cx, 58],
  ];
  for (const [sx, sy] of sparklePositions) {
    drawSparkle(g, sx, sy, 4, 0xffffff, 0.7);
  }

  g.generateTexture('starkid', w, h);
  g.destroy();
}

function drawSparkle(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number, alpha: number): void {
  g.fillStyle(color, alpha);
  g.fillRect(x - size / 2, y - 0.5, size, 1);
  g.fillRect(x - 0.5, y - size / 2, 1, size);
  g.fillStyle(color, alpha * 0.5);
  const d = size * 0.35;
  g.fillRect(x - d, y - d, d * 2, d * 2);
}

function generateAsteroidTextures(scene: Phaser.Scene): void {
  const sizes = [
    { key: 'asteroid_sm', size: 32 },
    { key: 'asteroid_md', size: 48 },
    { key: 'asteroid_lg', size: 64 },
  ];

  for (const { key, size } of sizes) {
    const g = scene.add.graphics();
    const cx = size / 2, cy = size / 2;
    const r = size / 2 - 4;

    // Irregular polygon shape
    const points: Phaser.Math.Vector2[] = [];
    const numVerts = 8;
    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * Math.PI * 2;
      const wobble = 0.7 + Math.sin(i * 2.5) * 0.3;
      points.push(new Phaser.Math.Vector2(
        cx + Math.cos(angle) * r * wobble,
        cy + Math.sin(angle) * r * wobble,
      ));
    }

    g.fillStyle(0x555566);
    g.fillPoints(points, true);

    // Surface detail
    g.lineStyle(1, 0x444455);
    g.strokePoints(points, true);

    // Craters
    g.fillStyle(0x444455);
    g.fillCircle(cx - r * 0.3, cy - r * 0.2, r * 0.2);
    g.fillCircle(cx + r * 0.2, cy + r * 0.3, r * 0.15);
    g.fillStyle(0x666677);
    g.fillCircle(cx - r * 0.3, cy - r * 0.3, r * 0.08);

    g.generateTexture(key, size, size);
    g.destroy();
  }
}

function generateBlackHoleTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const size = 128;
  const cx = size / 2, cy = size / 2;

  // Accretion disk rings
  for (let i = 5; i > 0; i--) {
    const radius = 20 + i * 10;
    const alpha = 0.05 + i * 0.03;
    g.lineStyle(3, 0x8866ff, alpha);
    g.strokeCircle(cx, cy, radius);
  }

  // Inner glow
  g.fillStyle(0x5533aa, 0.15);
  g.fillCircle(cx, cy, 25);
  g.fillStyle(0x3322aa, 0.2);
  g.fillCircle(cx, cy, 18);

  // Event horizon (dark center)
  g.fillStyle(0x000011, 0.9);
  g.fillCircle(cx, cy, 12);
  g.fillStyle(0x000000);
  g.fillCircle(cx, cy, 8);

  g.generateTexture('blackhole', size, size);
  g.destroy();
}

function generateNebulaTexture(scene: Phaser.Scene): void {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const blobs = [
    { x: 100, y: 120, r: 90, color: [170, 51, 204], alpha: 0.18 },
    { x: 145, y: 95, r: 75, color: [68, 85, 221], alpha: 0.14 },
    { x: 165, y: 155, r: 100, color: [204, 68, 170], alpha: 0.20 },
    { x: 105, y: 160, r: 65, color: [51, 136, 170], alpha: 0.12 },
    { x: 128, y: 128, r: 110, color: [119, 51, 204], alpha: 0.22 },
    { x: 75, y: 140, r: 70, color: [187, 85, 204], alpha: 0.16 },
    { x: 175, y: 115, r: 60, color: [34, 102, 187], alpha: 0.12 },
    { x: 128, y: 100, r: 85, color: [153, 51, 187], alpha: 0.10 },
    { x: 90, y: 90, r: 50, color: [100, 70, 200], alpha: 0.08 },
  ];

  for (const b of blobs) {
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    const [r, g, a] = b.color;
    grad.addColorStop(0, `rgba(${r},${g},${a},${b.alpha})`);
    grad.addColorStop(0.3, `rgba(${r},${g},${a},${b.alpha * 0.7})`);
    grad.addColorStop(0.6, `rgba(${r},${g},${a},${b.alpha * 0.35})`);
    grad.addColorStop(1, `rgba(${r},${g},${a},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  scene.textures.addCanvas('nebula', canvas);
}

function generateParticleTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

function generateExhaustTexture(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0xff8844, 0.8);
  g.fillCircle(3, 3, 3);
  g.fillStyle(0xffcc44, 0.6);
  g.fillCircle(3, 3, 2);
  g.generateTexture('exhaust', 6, 6);
  g.destroy();
}

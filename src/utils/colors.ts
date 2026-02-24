export enum StarColor {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Indigo = 'indigo',
  Violet = 'violet',
  Gold = 'gold',
}

export type Rarity = 'common' | 'uncommon' | 'rare';

export interface StarColorConfig {
  color: StarColor;
  hex: number;
  cssHex: string;
  rarity: Rarity;
  spawnCount: number;
  chimeFrequency: number;
}

export const STAR_COLORS: StarColorConfig[] = [
  { color: StarColor.Red, hex: 0xff3333, cssHex: '#ff3333', rarity: 'common', spawnCount: 47, chimeFrequency: 262 },
  { color: StarColor.Orange, hex: 0xff8833, cssHex: '#ff8833', rarity: 'common', spawnCount: 47, chimeFrequency: 294 },
  { color: StarColor.Yellow, hex: 0xffdd33, cssHex: '#ffdd33', rarity: 'common', spawnCount: 46, chimeFrequency: 330 },
  { color: StarColor.Green, hex: 0x33ff66, cssHex: '#33ff66', rarity: 'uncommon', spawnCount: 45, chimeFrequency: 349 },
  { color: StarColor.Blue, hex: 0x3388ff, cssHex: '#3388ff', rarity: 'uncommon', spawnCount: 43, chimeFrequency: 392 },
  { color: StarColor.Indigo, hex: 0x5533ff, cssHex: '#5533ff', rarity: 'rare', spawnCount: 43, chimeFrequency: 440 },
  { color: StarColor.Violet, hex: 0xcc33ff, cssHex: '#cc33ff', rarity: 'rare', spawnCount: 42, chimeFrequency: 494 },
];

export const REQUIRED_PER_COLOR = 10;
export const TOTAL_REQUIRED = REQUIRED_PER_COLOR * STAR_COLORS.length;

export const GOLD_SPAWN_COUNT = 200;
export const GOLD_HEX = 0xffd700;
export const GOLD_CSS_HEX = '#ffd700';

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 3000;

export const PLANET_RADIUS = 533;
export const PLANET_CENTER_X = WORLD_WIDTH / 2;
export const PLANET_CENTER_Y = WORLD_HEIGHT + PLANET_RADIUS - 350;
export const PLANET_GRAVITY = 60;
export const PLANET_GRAVITY_RANGE = 350;

export function getStarConfig(color: StarColor): StarColorConfig {
  return STAR_COLORS.find(c => c.color === color)!;
}

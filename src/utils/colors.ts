export enum StarColor {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Indigo = 'indigo',
  Violet = 'violet',
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
  { color: StarColor.Red, hex: 0xff3333, cssHex: '#ff3333', rarity: 'common', spawnCount: 14, chimeFrequency: 262 },
  { color: StarColor.Orange, hex: 0xff8833, cssHex: '#ff8833', rarity: 'common', spawnCount: 14, chimeFrequency: 294 },
  { color: StarColor.Yellow, hex: 0xffdd33, cssHex: '#ffdd33', rarity: 'common', spawnCount: 13, chimeFrequency: 330 },
  { color: StarColor.Green, hex: 0x33ff66, cssHex: '#33ff66', rarity: 'uncommon', spawnCount: 12, chimeFrequency: 349 },
  { color: StarColor.Blue, hex: 0x3388ff, cssHex: '#3388ff', rarity: 'uncommon', spawnCount: 11, chimeFrequency: 392 },
  { color: StarColor.Indigo, hex: 0x5533ff, cssHex: '#5533ff', rarity: 'rare', spawnCount: 11, chimeFrequency: 440 },
  { color: StarColor.Violet, hex: 0xcc33ff, cssHex: '#cc33ff', rarity: 'rare', spawnCount: 10, chimeFrequency: 494 },
];

export const REQUIRED_PER_COLOR = 10;
export const TOTAL_REQUIRED = REQUIRED_PER_COLOR * STAR_COLORS.length;

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 3000;

export function getStarConfig(color: StarColor): StarColorConfig {
  return STAR_COLORS.find(c => c.color === color)!;
}

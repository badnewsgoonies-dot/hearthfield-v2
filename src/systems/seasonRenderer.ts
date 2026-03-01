/**
 * Season Renderer — provides seasonal color palettes and tree variation
 * NEW FILE — does not modify any existing files
 */
import { Season } from '../types';

export interface SeasonPalette {
  grassLight: number;
  grassDark: number;
  dirtLight: number;
  dirtDark: number;
  treeTrunk: number;
  treeLeaves: number;
  treeLeaves2: number;
  waterColor: number;
  ambient: number;
  ambientAlpha: number;
  particleColor: number;
  particleCount: number;
  skyTint: number;
}

const PALETTES: Record<Season, SeasonPalette> = {
  [Season.SPRING]: {
    grassLight: 0x5a8c3a, grassDark: 0x4e7a32,
    dirtLight: 0x8B6B4A, dirtDark: 0x6B4A2A,
    treeTrunk: 0x6b4226, treeLeaves: 0x44aa44, treeLeaves2: 0x66cc66,
    waterColor: 0x4488cc, ambient: 0xffeedd, ambientAlpha: 0.03,
    particleColor: 0xffaacc, particleCount: 2, skyTint: 0x87CEEB,
  },
  [Season.SUMMER]: {
    grassLight: 0x4a7a2a, grassDark: 0x3d6b22,
    dirtLight: 0x9B7B5A, dirtDark: 0x7B5A3A,
    treeTrunk: 0x6b4226, treeLeaves: 0x338833, treeLeaves2: 0x44aa33,
    waterColor: 0x3377bb, ambient: 0xffeeaa, ambientAlpha: 0.05,
    particleColor: 0xffff88, particleCount: 1, skyTint: 0x6BB5E0,
  },
  [Season.FALL]: {
    grassLight: 0x8a7a3a, grassDark: 0x7a6a2a,
    dirtLight: 0x8B6B4A, dirtDark: 0x6B4A2A,
    treeTrunk: 0x6b4226, treeLeaves: 0xcc7722, treeLeaves2: 0xdd4422,
    waterColor: 0x557799, ambient: 0xddaa66, ambientAlpha: 0.06,
    particleColor: 0xcc8833, particleCount: 3, skyTint: 0xC4956A,
  },
  [Season.WINTER]: {
    grassLight: 0xbbccbb, grassDark: 0xaabbaa,
    dirtLight: 0x998877, dirtDark: 0x776655,
    treeTrunk: 0x6b4226, treeLeaves: 0x557755, treeLeaves2: 0x446644,
    waterColor: 0x88aacc, ambient: 0xccddff, ambientAlpha: 0.08,
    particleColor: 0xffffff, particleCount: 5, skyTint: 0xCCDDEE,
  },
};

export class SeasonRenderer {
  static getPalette(season: Season): SeasonPalette {
    return PALETTES[season];
  }

  static getRandomTree(season: Season, x: number, y: number): {
    leafColor: number; hasLeaves: boolean; hasFruit: boolean; fruitColor: number;
  } {
    const seed = (x * 7 + y * 13) & 0xffff;
    const r = (seed % 100) / 100; // 0-0.99
    const pal = PALETTES[season];
    const useAlt = (seed % 3) === 0;
    const leafColor = useAlt ? pal.treeLeaves2 : pal.treeLeaves;

    switch (season) {
      case Season.SPRING:
        return { leafColor, hasLeaves: true, hasFruit: r < 0.2, fruitColor: 0xffaacc };
      case Season.SUMMER:
        return { leafColor, hasLeaves: true, hasFruit: r < 0.3, fruitColor: 0xff4444 };
      case Season.FALL:
        return { leafColor, hasLeaves: r < 0.8, hasFruit: r < 0.4, fruitColor: 0xffaa22 };
      case Season.WINTER:
        return { leafColor, hasLeaves: r < 0.3, hasFruit: false, fruitColor: 0 };
    }
  }
}

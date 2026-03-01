/**
 * Hearthfield v2 — Game Entry Point
 */
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { IntroScene } from './scenes/IntroScene';
import { PlayScene } from './scenes/PlayScene';
import { UIScene } from './scenes/UIScene';
import { ShopScene } from './scenes/ShopScene';
import { MineScene } from './scenes/MineScene';
import { FishingScene } from './scenes/FishingScene';

import { InteriorScene } from './scenes/InteriorScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1a1a2e',
  input: {
    keyboard: true,
    gamepad: true,
    touch: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, IntroScene, PlayScene, UIScene, ShopScene, MineScene, FishingScene, InteriorScene],
};

new Phaser.Game(config);

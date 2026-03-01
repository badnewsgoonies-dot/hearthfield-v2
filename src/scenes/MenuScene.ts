import Phaser from 'phaser';
import { Scenes } from '../types';

export class MenuScene extends Phaser.Scene {
  constructor() { super(Scenes.MENU); }

  create() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.add.text(cx, cy - 80, 'HEARTHFIELD', {
      fontSize: '48px', color: '#88cc44', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'A Farming Adventure', {
      fontSize: '18px', color: '#ccddaa'
    }).setOrigin(0.5);

    const newBtn = this.add.text(cx, cy + 40, '[ New Game ]', {
      fontSize: '24px', color: '#ffffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const loadBtn = this.add.text(cx, cy + 80, '[ Continue ]', {
      fontSize: '24px', color: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    newBtn.on('pointerover', () => newBtn.setColor('#ffdd44'));
    newBtn.on('pointerout', () => newBtn.setColor('#ffffff'));
    newBtn.on('pointerdown', () => {
      this.scene.start(Scenes.PLAY);
    });

    loadBtn.on('pointerover', () => loadBtn.setColor('#ffdd44'));
    loadBtn.on('pointerout', () => loadBtn.setColor('#aaaaaa'));
    loadBtn.on('pointerdown', () => {
      // Load save if exists, otherwise start new
      this.scene.start(Scenes.PLAY, { loadSave: true });
    });
  }
}

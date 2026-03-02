import { GAME_HEIGHT, GAME_WIDTH } from '../data/config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel', 1, 1);
    g.destroy();

    this.cameras.main.setBackgroundColor('#05070e');
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'IRON VIPER\nBLACK SUN', {
      fontSize: '46px',
      align: 'center',
      color: '#ffdb7d',
    }).setOrigin(0.5);

    this.time.delayedCall(350, () => this.scene.start('TitleScene'));
  }
}

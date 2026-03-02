import { SaveManager } from '../systems/SaveManager.js';

export class VictoryScene extends Phaser.Scene {
  constructor() { super('VictoryScene'); }
  init(data) { this.score = data.score || 0; }
  create() {
    const save = SaveManager.load();
    save.highScore = Math.max(save.highScore, this.score);
    save.unlockedLevel = 10;
    SaveManager.save(save);
    this.cameras.main.setBackgroundColor('#050c16');
    this.add.text(480, 120, 'BLACK SUN DESTROYED', { fontSize: '54px', color: '#ffe289' }).setOrigin(0.5);
    this.add.text(480, 210, `Final Score: ${this.score}\nHigh Score: ${save.highScore}`, { fontSize: '30px', color: '#d6e5ff', align: 'center' }).setOrigin(0.5);
    this.add.text(480, 310, 'Voss falls as the reactor fractures.\nIron Viper escapes through collapsing fire.\nThe war is not over... but today, the sun sets in silence.', { fontSize: '24px', color: '#b8c9f2', align: 'center' }).setOrigin(0.5);
    this.add.text(480, 470, 'Press Enter to return to title', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.enter = this.input.keyboard.addKey('ENTER');
  }
  update() { if (Phaser.Input.Keyboard.JustDown(this.enter)) this.scene.start('TitleScene'); }
}

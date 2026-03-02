import { GAME_HEIGHT, GAME_WIDTH } from '../data/config.js';
import { InputManager } from '../systems/InputManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create() {
    this.inputManager = new InputManager(this);
    this.cameras.main.setBackgroundColor('#0b1229');
    this.add.text(GAME_WIDTH / 2, 130, 'IRON VIPER: BLACK SUN', { fontSize: '48px', color: '#ffe289' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 198, 'Single-Player Run-and-Gun', { fontSize: '20px', color: '#b6ccff' }).setOrigin(0.5);
    this.prompt = this.add.text(GAME_WIDTH / 2, 260, 'Press any button / key', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

    this.options = ['Start Game', 'Level Select', 'Controls', 'Settings'];
    this.selected = 0;
    this.optionTexts = this.options.map((opt, i) => this.add.text(GAME_WIDTH / 2, 325 + i * 38, opt, { fontSize: '26px', color: '#8ea9f5' }).setOrigin(0.5));
    this.selectionKeys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', w: 'W', s: 'S', confirm: 'ENTER' });
    this.drawSelection();
  }

  drawSelection() {
    this.optionTexts.forEach((t, i) => t.setColor(i === this.selected ? '#ffe289' : '#8ea9f5'));
  }

  update() {
    this.prompt.alpha = 0.6 + Math.sin(this.time.now / 260) * 0.4;
    if (Phaser.Input.Keyboard.JustDown(this.selectionKeys.up) || Phaser.Input.Keyboard.JustDown(this.selectionKeys.w)) {
      this.selected = (this.selected + this.options.length - 1) % this.options.length;
      this.drawSelection();
    }
    if (Phaser.Input.Keyboard.JustDown(this.selectionKeys.down) || Phaser.Input.Keyboard.JustDown(this.selectionKeys.s)) {
      this.selected = (this.selected + 1) % this.options.length;
      this.drawSelection();
    }

    if (this.inputManager.anyPress() || Phaser.Input.Keyboard.JustDown(this.selectionKeys.confirm)) {
      if (this.selected === 0) this.scene.start('LevelScene', { levelIndex: 0, newRun: true });
      if (this.selected === 1) this.scene.start('LevelSelectScene');
      if (this.selected === 2) this.scene.start('ControlsScene');
      if (this.selected === 3) this.scene.start('SettingsScene');
    }
  }
}

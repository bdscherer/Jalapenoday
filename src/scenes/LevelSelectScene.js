import { GAME_WIDTH } from '../data/config.js';
import { SaveManager } from '../systems/SaveManager.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() { super('LevelSelectScene'); }

  create() {
    const save = SaveManager.load();
    this.unlocked = save.unlockedLevel;
    this.add.text(GAME_WIDTH / 2, 80, 'LEVEL SELECT', { fontSize: '40px', color: '#ffe289' }).setOrigin(0.5);
    this.levels = Array.from({ length: 10 }, (_, i) => i + 1);
    this.selected = 0;
    this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER', back: 'ESC' });
    this.texts = this.levels.map((n, i) => this.add.text(GAME_WIDTH / 2, 140 + i * 34, `Stage ${n}${n <= this.unlocked ? '' : ' (LOCKED)'}`, { fontSize: '22px', color: '#98a7d0' }).setOrigin(0.5));
    this.redraw();
  }

  redraw() { this.texts.forEach((t, i) => t.setColor(i === this.selected ? '#fff3b3' : (i + 1 <= this.unlocked ? '#98a7d0' : '#666'))); }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.selected = (this.selected + 9) % 10; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.selected = (this.selected + 1) % 10; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.back)) this.scene.start('TitleScene');
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter) && this.selected + 1 <= this.unlocked) this.scene.start('LevelScene', { levelIndex: this.selected });
  }
}

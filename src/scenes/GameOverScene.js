export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  init(data) { this.score = data.score || 0; this.levelIndex = data.levelIndex || 0; }
  create() {
    this.cameras.main.setBackgroundColor('#160a0a');
    this.add.text(480, 170, 'GAME OVER', { fontSize: '64px', color: '#ff7070' }).setOrigin(0.5);
    this.add.text(480, 240, `Score: ${this.score}`, { fontSize: '30px', color: '#ffffff' }).setOrigin(0.5);
    this.items = ['Continue', 'Retry', 'Quit'];
    this.sel = 0;
    this.texts = this.items.map((label, i) => this.add.text(480, 320 + i * 44, label, { fontSize: '30px', color: '#a5b9ff' }).setOrigin(0.5));
    this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER' });
    this.redraw();
  }
  redraw() { this.texts.forEach((t, i) => t.setColor(i === this.sel ? '#ffe289' : '#a5b9ff')); }
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + 2) % 3; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % 3; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
      if (this.sel === 0) this.scene.start('LevelScene', { levelIndex: Math.max(0, this.levelIndex - 1), continueRun: true });
      else if (this.sel === 1) this.scene.start('LevelScene', { levelIndex: this.levelIndex });
      else this.scene.start('TitleScene');
    }
  }
}

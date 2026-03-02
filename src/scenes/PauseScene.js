export class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  init(data) { this.parentKey = data.parentKey; }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.5);
    this.items = ['Resume', 'Restart Level', 'Controls', 'Quit to Title'];
    this.sel = 0;
    this.texts = this.items.map((label, i) => this.add.text(480, 210 + i * 50, label, { fontSize: '32px', color: '#95b1ff' }).setOrigin(0.5));
    this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER', esc: 'ESC' });
    this.redraw();
  }

  redraw() { this.texts.forEach((t, i) => t.setColor(i === this.sel ? '#ffe289' : '#95b1ff')); }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % this.items.length; this.redraw(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) this.sel = 0;
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      if (this.sel === 0) {
        this.scene.stop();
        this.scene.resume(this.parentKey);
      } else if (this.sel === 1) {
        this.scene.stop(this.parentKey);
        this.scene.stop();
        this.scene.start('LevelScene', { levelIndex: this.registry.get('levelIndex') });
      } else if (this.sel === 2) {
        this.scene.pause();
        this.scene.launch('ControlsScene');
      } else {
        this.scene.stop(this.parentKey);
        this.scene.stop();
        this.scene.start('TitleScene');
      }
    }
  }
}

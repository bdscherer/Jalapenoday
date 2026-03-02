import { GAME_WIDTH } from '../data/config.js';
import { SaveManager } from '../systems/SaveManager.js';

export class SettingsScene extends Phaser.Scene {
  constructor() { super('SettingsScene'); }

  create() {
    this.state = SaveManager.load();
    this.options = [
      { key: 'masterVolume', label: 'Master Volume', step: 0.1 },
      { key: 'sfxVolume', label: 'SFX Volume', step: 0.1 },
      { key: 'musicVolume', label: 'Music Volume', step: 0.1 },
      { key: 'screenShake', label: 'Screen Shake', step: 1 },
    ];
    this.sel = 0;
    this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', back: 'ESC', enter: 'ENTER', f: 'F' });
    this.add.text(GAME_WIDTH / 2, 90, 'SETTINGS', { fontSize: '42px', color: '#ffe289' }).setOrigin(0.5);
    this.rows = this.options.map((_, i) => this.add.text(180, 170 + i * 44, '', { fontSize: '24px', color: '#c8d9ff' }));
    this.hint = this.add.text(180, 400, 'Arrows: navigate/adjust, F: fullscreen, Esc: back', { fontSize: '19px', color: '#8ca8de' });
    this.refresh();
  }

  refresh() {
    this.rows.forEach((r, i) => {
      const o = this.options[i];
      const value = this.state.settings[o.key];
      r.setText(`${i === this.sel ? '>' : ' '} ${o.label}: ${typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value.toFixed(1)}`);
      r.setColor(i === this.sel ? '#fff1ac' : '#c8d9ff');
    });
  }

  adjust(direction) {
    const o = this.options[this.sel];
    if (typeof this.state.settings[o.key] === 'boolean') {
      this.state.settings[o.key] = !this.state.settings[o.key];
    } else {
      this.state.settings[o.key] = Phaser.Math.Clamp(this.state.settings[o.key] + direction * o.step, 0, 1);
    }
    SaveManager.save(this.state);
    this.refresh();
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + this.options.length - 1) % this.options.length; this.refresh(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % this.options.length; this.refresh(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.left)) this.adjust(-1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.right)) this.adjust(1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) this.adjust(1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.f)) this.scale.toggleFullscreen();
    if (Phaser.Input.Keyboard.JustDown(this.keys.back)) this.scene.start('TitleScene');
  }
}

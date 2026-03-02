import { GAME_WIDTH } from '../data/config.js';

export class ControlsScene extends Phaser.Scene {
  constructor() { super('ControlsScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a1026');
    this.add.text(GAME_WIDTH / 2, 90, 'CONTROLS', { fontSize: '42px', color: '#ffe289' }).setOrigin(0.5);
    this.add.text(130, 160,
      'GAMEPAD (PRIMARY)\n- Left stick / D-pad: move + aim\n- A/Cross: Jump\n- X/Square: Shoot\n- RB/R1: Bomb\n- Start/Options: Pause\n\nKEYBOARD FALLBACK\n- Arrows/WASD: move + aim\n- Z: Jump\n- X: Shoot\n- C: Bomb\n- Enter or Esc: Pause\n\nPress Esc to return.',
      { fontSize: '22px', color: '#d8e4ff', lineSpacing: 8 });
    this.key = this.input.keyboard.addKey('ESC');
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.key)) this.scene.start('TitleScene');
  }
}

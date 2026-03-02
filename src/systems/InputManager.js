export class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.keys = scene.input.keyboard.addKeys({
      left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN',
      a: 'A', d: 'D', w: 'W', s: 'S',
      jump: 'Z', shoot: 'X', bomb: 'C',
      pauseEsc: 'ESC', pauseEnter: 'ENTER',
    });
    this.pad = null;
    this.pauseLatch = false;
    this.prevPadState = { bomb: false, pause: false, jump: false };
    this.scene.input.gamepad.once('connected', (pad) => { this.pad = pad; });
    this.scene.input.gamepad.on('connected', (pad) => { this.pad = pad; });
    this.scene.input.gamepad.on('disconnected', (pad) => {
      if (this.pad && this.pad.index === pad.index) {
        this.pad = null;
        this.prevPadState = { bomb: false, pause: false, jump: false };
      }
    });
  }

  getMoveX() {
    const k = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    let g = 0;
    if (this.pad) {
      g = Math.abs(this.pad.axes.length ? this.pad.axes[0].getValue() : 0) > 0.22 ? this.pad.axes[0].getValue() : 0;
      if (this.pad.left || this.pad.right) g = (this.pad.left ? -1 : 0) + (this.pad.right ? 1 : 0);
    }
    const value = Math.abs(g) > Math.abs(k) ? g : k;
    return Math.max(-1, Math.min(1, value));
  }

  getAim() {
    let x = this.getMoveX();
    let y = (this.keys.up.isDown || this.keys.w.isDown ? -1 : 0) + (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0);
    if (this.pad) {
      const axX = Math.abs(this.pad.axes[2]?.getValue() || 0) > 0.22 ? this.pad.axes[2].getValue() : x;
      const axY = Math.abs(this.pad.axes[3]?.getValue() || 0) > 0.22 ? this.pad.axes[3].getValue() : y;
      x = axX;
      y = axY;
      if (this.pad.up || this.pad.down) y = (this.pad.up ? -1 : 0) + (this.pad.down ? 1 : 0);
      if (this.pad.left || this.pad.right) x = (this.pad.left ? -1 : 0) + (this.pad.right ? 1 : 0);
    }
    if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) return { x: 1, y: 0 };
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  }

  consumePadEdge(name, isPressed) {
    const wasPressed = this.prevPadState[name];
    this.prevPadState[name] = !!isPressed;
    return !!isPressed && !wasPressed;
  }

  jumpPressed() {
    const padJump = this.consumePadEdge('jump', !!this.pad?.A);
    return Phaser.Input.Keyboard.JustDown(this.keys.jump) || padJump;
  }

  shootHeld() {
    return this.keys.shoot.isDown || !!this.pad?.X;
  }

  bombPressed() {
    const padBomb = this.consumePadEdge('bomb', !!this.pad?.R1);
    return Phaser.Input.Keyboard.JustDown(this.keys.bomb) || padBomb;
  }

  pausePressed() {
    const keyboardPause = Phaser.Input.Keyboard.JustDown(this.keys.pauseEsc) || Phaser.Input.Keyboard.JustDown(this.keys.pauseEnter);
    const gamepadPause = this.consumePadEdge('pause', !!this.pad?.START);
    const pressed = keyboardPause || gamepadPause;
    if (pressed && !this.pauseLatch) {
      this.pauseLatch = true;
      this.scene.time.delayedCall(180, () => { this.pauseLatch = false; });
      return true;
    }
    return false;
  }

  anyPress() {
    const keyAny = this.scene.input.keyboard.checkDown(this.keys.jump, 1) || this.scene.input.keyboard.checkDown(this.keys.shoot, 1) || this.scene.input.keyboard.checkDown(this.keys.pauseEnter, 1);
    const padAny = this.pad && this.pad.buttons.some((b) => b.pressed);
    return keyAny || !!padAny;
  }
}

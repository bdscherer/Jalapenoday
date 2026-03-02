import { PLAYER_CONFIG } from '../data/config.js';
import { WeaponManager } from './WeaponManager.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'pixel');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(24, 36);
    this.setTint(0x88d1ff);
    this.body.setCollideWorldBounds(true);
    this.weaponManager = new WeaponManager(scene, this);
    this.maxHp = PLAYER_CONFIG.maxHp;
    this.hp = this.maxHp;
    this.lives = PLAYER_CONFIG.lives;
    this.bombs = PLAYER_CONFIG.bombsPerLife;
    this.invuln = 0;
    this.spawnInvuln = 0;
    this.shieldHits = 0;
    this.lastFacing = 1;
  }

  resetOnRespawn(x, y) {
    this.setPosition(x, y);
    this.hp = this.maxHp;
    this.bombs = PLAYER_CONFIG.bombsPerLife;
    this.spawnInvuln = PLAYER_CONFIG.respawnInvulnMs;
    this.setActive(true).setVisible(true);
    this.body.enable = true;
  }

  update(input, time, delta) {
    this.weaponManager.update(delta);
    this.invuln = Math.max(0, this.invuln - delta);
    this.spawnInvuln = Math.max(0, this.spawnInvuln - delta);
    this.alpha = this.invuln > 0 || this.spawnInvuln > 0 ? (Math.floor(time / 50) % 2 ? 0.4 : 1) : 1;

    const move = input.getMoveX();
    this.body.setVelocityX(move * PLAYER_CONFIG.speed);
    if (move !== 0) this.lastFacing = Math.sign(move);

    if (input.jumpPressed() && this.body.blocked.down) {
      this.setVelocityY(PLAYER_CONFIG.jumpVelocity);
      this.scene.events.emit('player-jump');
    }

    if (!this.body.blocked.down && this.body.velocity.y > 0) this.setTint(0x6cc3ff);
    else this.setTint(0x88d1ff);

    if (input.shootHeld()) {
      const aim = input.getAim();
      if (Math.abs(aim.x) < 0.1 && Math.abs(aim.y) < 0.1) aim.x = this.lastFacing;
      this.weaponManager.fire(aim, time);
    }
  }

  damage(amount) {
    if (this.invuln > 0 || this.spawnInvuln > 0) return false;
    if (this.shieldHits > 0) {
      this.shieldHits -= 1;
      this.invuln = 300;
      return false;
    }
    this.hp -= amount;
    this.invuln = PLAYER_CONFIG.invulnMs;
    return this.hp <= 0;
  }
}

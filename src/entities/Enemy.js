import { ENEMY_TYPES } from '../data/config.js';
import { Projectile } from './Projectile.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type, difficulty) {
    super(scene, x, y, 'pixel');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.type = type;
    this.cfg = ENEMY_TYPES[type];
    this.hp = this.cfg.hp * difficulty.hpMult;
    this.score = Math.round(this.cfg.score * difficulty.hpMult);
    this.setScale(type === 'pod' ? 20 : 24, type === 'pod' ? 20 : 28);
    this.setTint(this.cfg.color);
    this.body.setCollideWorldBounds(true);
    this.body.setAllowGravity(type !== 'pod');
    this.nextFire = 0;
    this.fireRate = this.cfg.cadence > 0 ? this.cfg.cadence / difficulty.fireMult : 99999;
  }

  updateBehavior(player, time, enemyBullets) {
    if (!this.active) return;
    const dir = Math.sign(player.x - this.x) || -1;
    switch (this.cfg.behavior) {
      case 'runner':
      case 'mine':
        this.setVelocityX(dir * this.cfg.speed);
        break;
      case 'flying':
        this.body.setAllowGravity(false);
        this.setVelocity(dir * this.cfg.speed, Math.sin(time / 260 + this.x * 0.01) * 70);
        break;
      case 'jumper':
        this.setVelocityX(dir * this.cfg.speed * 0.6);
        if (this.body.blocked.down && Math.random() < 0.015) this.setVelocityY(-320);
        break;
      case 'sniper':
        this.setVelocityX(0);
        break;
      case 'missile':
      case 'turret':
        this.setVelocityX(0);
        break;
      default:
        this.setVelocityX(dir * this.cfg.speed * 0.45);
    }

    if (time > this.nextFire && this.cfg.cadence > 0) {
      this.nextFire = time + this.fireRate;
      if (this.cfg.behavior === 'sniper') {
        const line = this.scene.add.rectangle(this.x, this.y, Math.max(20, Math.abs(player.x - this.x)), 3, 0xff4444).setOrigin(0, 0.5);
        line.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.scene.time.delayedCall(this.cfg.telegraph, () => {
          if (!this.active) return;
          line.destroy();
          this.shootAt(player, enemyBullets, 1.5);
        });
      } else if (this.cfg.behavior === 'missile') {
        this.scene.spawnWarning(player.x + Phaser.Math.Between(-180, 180));
        this.scene.time.delayedCall(this.cfg.telegraph, () => this.shootAt(player, enemyBullets, 1));
      } else {
        this.shootAt(player, enemyBullets, 1);
      }
    }
  }

  shootAt(player, enemyBullets, scale) {
    if (!this.active || !player.active) return;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const b = new Projectile(this.scene, this.x, this.y, 'pixel', 'enemy', 1, 2500, 0xff6f6f);
    b.setScale(7, 3 * scale);
    enemyBullets.add(b);
    this.scene.physics.velocityFromRotation(angle, this.cfg.projectileSpeed, b.body.velocity);
  }

  receiveDamage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.scene.events.emit('enemy-killed', this.score, this.x, this.y);
      this.destroy();
    }
  }
}

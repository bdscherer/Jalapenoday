import { Projectile } from './Projectile.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config, difficulty) {
    super(scene, x, y, 'pixel');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cfg = config;
    this.hpMax = Math.round(config.baseHp * difficulty.hpMult * 1.4);
    this.hp = this.hpMax;
    this.phase = 1;
    this.nextAction = 1200;
    this.attackIndex = 0;
    this.setTint(config.color);
    this.setScale(78, 82);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.introDone = false;
  }

  startIntro() {
    this.y -= 200;
    this.scene.tweens.add({
      targets: this,
      y: this.scene.groundY - 70,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => { this.introDone = true; },
    });
  }

  updateBoss(player, time, bullets) {
    if (!this.active || !this.introDone) return;
    if (this.hp < this.hpMax * 0.5) this.phase = 2;
    this.x = Phaser.Math.Clamp(this.x + Math.sin(time / 700) * 1.2, this.scene.levelWidth - 360, this.scene.levelWidth - 90);
    if (time < this.nextAction) return;
    const pattern = this.cfg.patterns[(this.attackIndex++) % this.cfg.patterns.length];
    this.nextAction = time + pattern.cooldown / (this.phase === 2 ? 1.2 : 1);
    if (pattern.type === 'spread') {
      for (let i = -2; i <= 2; i += 1) this.spawnBullet(player, bullets, i * 0.2, 290 + this.phase * 30);
    }
    if (pattern.type === 'dash') {
      const tx = Phaser.Math.Clamp(player.x + Phaser.Math.Between(-40, 40), this.scene.levelWidth - 420, this.scene.levelWidth - 120);
      this.scene.tweens.add({ targets: this, x: tx, duration: 280, yoyo: true });
      this.scene.cameras.main.shake(100, 0.008);
    }
    if (pattern.type === 'ring') {
      for (let a = 0; a < 12; a += 1) {
        const angle = (Math.PI * 2 * a) / 12;
        this.spawnBulletAngle(angle, bullets, 210 + this.phase * 45);
      }
    }
    if (pattern.type === 'missiles') {
      for (let i = 0; i < 3 + this.phase; i += 1) {
        const wx = player.x + Phaser.Math.Between(-180, 180);
        this.scene.spawnWarning(wx);
        this.scene.time.delayedCall(420 + i * 120, () => {
          if (this.active) {
            const b = new Projectile(this.scene, wx, -20, 'pixel', 'enemy', 1, 3000, 0xff9b59);
            b.setScale(6, 18);
            bullets.add(b);
            b.body.velocity.y = 260;
          }
        });
      }
    }
  }

  spawnBullet(player, bullets, angleOffset, speed) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + angleOffset;
    this.spawnBulletAngle(angle, bullets, speed);
  }

  spawnBulletAngle(angle, bullets, speed) {
    const b = new Projectile(this.scene, this.x - 40, this.y - 20, 'pixel', 'enemy', 1, 2800, 0xff7f7f);
    b.setScale(8, 4);
    bullets.add(b);
    this.scene.physics.velocityFromRotation(angle, speed, b.body.velocity);
  }

  receiveDamage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.scene.events.emit('boss-defeated', this.cfg.score || 5000);
      this.destroy();
    }
  }
}

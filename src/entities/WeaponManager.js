import { WEAPONS } from '../data/config.js';
import { Projectile } from './Projectile.js';

export class WeaponManager {
  constructor(scene, owner) {
    this.scene = scene;
    this.owner = owner;
    this.weaponKey = 'rifle';
    this.rapidTimer = 0;
    this.lastFire = 0;
    this.projectiles = scene.physics.add.group({ runChildUpdate: true, classType: Projectile });
  }

  setWeapon(key) {
    if (WEAPONS[key]) this.weaponKey = key;
  }

  activateRapid(ms = 8000) {
    this.rapidTimer = Math.max(this.rapidTimer, ms);
  }

  update(delta) {
    this.rapidTimer = Math.max(0, this.rapidTimer - delta);
  }

  fire(aim, now) {
    const base = WEAPONS[this.weaponKey];
    const cooldown = this.rapidTimer > 0 ? base.cooldown * 0.5 : base.cooldown;
    if (now - this.lastFire < cooldown) return;
    this.lastFire = now;

    for (let i = 0; i < base.count; i += 1) {
      const spreadOffset = (i - (base.count - 1) / 2) * base.spread;
      const angle = Phaser.Math.Angle.Between(0, 0, aim.x, aim.y) + Phaser.Math.DegToRad(spreadOffset);
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);
      const p = new Projectile(this.scene, this.owner.x + dirX * 22, this.owner.y + dirY * 8, 'pixel', 'player', base.damage, base.life, 0xfff7a8);
      p.setScale(8, 3);
      p.pierce = base.pierce;
      this.projectiles.add(p);
      this.scene.physics.velocityFromRotation(angle, base.speed, p.body.velocity);
      if (base.homing) p.homing = true;
    }
    this.scene.events.emit('player-fire');
  }
}

export class Projectile extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture, owner, damage, life, color) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.owner = owner;
    this.damage = damage;
    this.life = life;
    this.pierce = 0;
    this.setTint(color);
    this.setDepth(5);
    this.body.setAllowGravity(false);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.life -= delta;
    if (this.life <= 0 || this.x < -100 || this.x > this.scene.levelWidth + 100 || this.y < -50 || this.y > 650) {
      this.destroy();
    }
  }
}

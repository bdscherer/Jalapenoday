import { DIFFICULTY_BY_LEVEL, GAME_HEIGHT, GAME_WIDTH, LEVELS, PICKUPS } from '../data/config.js';
import { BOSS_CONFIGS } from '../data/bosses.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { createHazards } from '../entities/HazardFactory.js';
import { HUD } from '../systems/HUD.js';
import { InputManager } from '../systems/InputManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { AudioManager } from '../systems/AudioManager.js';

export class LevelScene extends Phaser.Scene {
  constructor() { super('LevelScene'); }

  init(data) {
    this.levelIndex = Phaser.Math.Clamp(data.levelIndex || 0, 0, 9);
    this.levelData = LEVELS[this.levelIndex];
    this.difficulty = DIFFICULTY_BY_LEVEL[this.levelIndex];
    this.save = SaveManager.load();
    this.registry.set('levelIndex', this.levelIndex);
    this.score = this.registry.get('score') || 0;
    if (data.newRun) this.score = 0;
    if (data.continueRun) this.score = Math.max(0, this.score - 500);
    this.levelWidth = 4500 + this.levelIndex * 420;
    this.groundY = 452;
    this.checkpoints = [260, this.levelWidth * 0.34, this.levelWidth * 0.62, this.levelWidth * 0.82];
    this.currentCheckpoint = 0;
    this.spawnTimer = 0;
    this.wave = 0;
    this.bossMode = false;
    this.bossDefeated = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(Phaser.Display.Color.IntegerToColor(this.levelData.theme).rgba);
    this.physics.world.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
    this.addParallax();

    this.platforms = this.physics.add.staticGroup();
    const ground = this.add.rectangle(this.levelWidth / 2, this.groundY + 18, this.levelWidth, 40, 0x2a2d37);
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);

    this.enemies = this.physics.add.group({ runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ runChildUpdate: true });
    this.pickups = this.physics.add.staticGroup();

    this.player = new Player(this, 80, this.groundY - 40);
    this.inputManager = new InputManager(this);
    this.audio = new AudioManager(this, this.save.settings);
    this.hud = new HUD(this);
    this.hud.showStageCard(`Stage ${this.levelData.id}\n${this.levelData.name}`);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    const hz = createHazards(this, this.levelData, this.levelWidth);
    this.hazards = hz.hazards;
    this.dynamicHazards = hz.dynamic;
    this.physics.add.collider(this.player, this.dynamicHazards, this.onPlayerHazard, null, this);
    this.physics.add.collider(this.player, this.hazards, this.onPlayerHazard, null, this);
    this.physics.add.collider(this.player, this.dynamicHazards);
    this.physics.add.collider(this.enemies, this.dynamicHazards);

    this.physics.add.overlap(this.player.weaponManager.projectiles, this.enemies, this.onPlayerBulletHitsEnemy, null, this);
    this.physics.add.overlap(this.player.weaponManager.projectiles, this.enemyBullets, (a, b) => { a.destroy(); b.destroy(); });
    this.physics.add.overlap(this.enemyBullets, this.player, this.onEnemyBulletHitsPlayer, null, this);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.damagePlayer(1, e.x), null, this);
    this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);

    this.events.on('enemy-killed', (score, x, y) => {
      this.score += score;
      if (Math.random() < 0.12) this.spawnPickup(x, y);
      this.spawnImpact(x, y, 0xff9d9d);
    });
    this.events.on('boss-defeated', (score) => this.onBossDefeated(score));

    this.events.on('player-fire', () => this.spawnMuzzle());

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
  }

  addParallax() {
    for (let i = 0; i < 14; i += 1) {
      const y = 120 + (i % 4) * 65;
      const width = 200 + (i % 3) * 80;
      const layer = this.add.rectangle(i * 380 + 90, y, width, 45, 0x000000, 0.2 + (i % 3) * 0.07);
      layer.setScrollFactor(0.2 + (i % 5) * 0.13, 1);
    }
  }

  spawnWave() {
    const pool = this.levelData.enemyPool;
    const count = 2 + Math.floor(this.levelIndex / 2) + (this.wave % 2);
    for (let i = 0; i < count; i += 1) {
      const type = pool[(this.wave + i) % pool.length];
      const x = this.player.x + GAME_WIDTH + Phaser.Math.Between(100, 480) + i * 80;
      const y = this.groundY - 30 - (type === 'pod' ? Phaser.Math.Between(40, 170) : 0);
      const enemy = new Enemy(this, x, y, type, this.difficulty);
      this.enemies.add(enemy);
    }
    this.wave += 1;
  }

  maybeBossTrigger() {
    if (this.bossMode || this.bossDefeated) return;
    if (this.player.x < this.levelWidth - 700) return;
    this.bossMode = true;
    this.enemies.clear(true, true);
    this.enemyBullets.clear(true, true);
    this.cameraLockX = this.levelWidth - 950;
    this.player.body.setVelocityX(0);
    const cfg = BOSS_CONFIGS[this.levelIndex];
    this.boss = new Boss(this, this.levelWidth - 210, this.groundY - 70, cfg, this.difficulty);
    this.physics.add.overlap(this.player.weaponManager.projectiles, this.boss, this.onPlayerBulletHitsBoss, null, this);
    this.physics.add.overlap(this.player, this.boss, () => this.damagePlayer(1, this.boss.x), null, this);
    this.boss.startIntro();
  }

  update(_time, delta) {
    if (this.inputManager.pausePressed()) {
      this.scene.pause();
      this.scene.launch('PauseScene', { parentKey: this.scene.key });
      return;
    }

    this.player.update(this.inputManager, this.time.now, delta);
    this.updateCheckpoints();

    if (this.inputManager.bombPressed() && this.player.bombs > 0) {
      this.player.bombs -= 1;
      this.cameras.main.shake(130, this.save.settings.screenShake ? 0.015 : 0);
      this.enemies.children.iterate((e) => e?.receiveDamage?.(999));
      if (this.boss) this.boss.receiveDamage(8);
      this.enemyBullets.clear(true, true);
    }

    if (!this.bossMode) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0 && this.wave < this.difficulty.waveCount * 2) {
        this.spawnWave();
        this.spawnTimer = this.difficulty.spawnGap;
      }
    }

    this.enemies.children.iterate((enemy) => enemy?.updateBehavior?.(this.player, this.time.now, this.enemyBullets));
    this.player.weaponManager.projectiles.children.iterate((p) => this.updateHoming(p, delta));
    if (this.boss) this.boss.updateBoss(this.player, this.time.now, this.enemyBullets);
    this.maybeBossTrigger();

    if (this.cameraLockX) {
      this.player.x = Math.max(this.player.x, this.cameraLockX + 90);
      this.player.x = Math.min(this.player.x, this.levelWidth - 50);
    }

    this.hud.update({
      hp: Math.max(0, Math.ceil(this.player.hp)),
      maxHp: this.player.maxHp,
      lives: this.player.lives,
      bombs: this.player.bombs,
      weapon: this.player.weaponManager.weaponKey,
      score: this.score,
      stage: `${this.levelData.id} ${this.levelData.name}`,
      boss: this.boss ? { hp: Math.max(0, this.boss.hp), max: this.boss.hpMax } : null,
    });
  }

  updateHoming(projectile, delta) {
    if (!projectile?.active || !projectile.homing) return;
    let target = null;
    let bestDist = Infinity;
    this.enemies.children.iterate((e) => {
      if (!e?.active) return;
      const d = Phaser.Math.Distance.Between(projectile.x, projectile.y, e.x, e.y);
      if (d < bestDist) { target = e; bestDist = d; }
    });
    if (!target && this.boss?.active) target = this.boss;
    if (!target) return;
    const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
    const speed = Phaser.Math.Clamp(projectile.body.velocity.length() + delta * 0.02, 260, 420);
    this.physics.velocityFromRotation(angle, speed, projectile.body.velocity);
  }

  onPlayerBulletHitsEnemy(bullet, enemy) {
    enemy.receiveDamage(bullet.damage);
    bullet.pierce -= 1;
    this.spawnImpact(bullet.x, bullet.y, 0xfff7a8);
    if (bullet.pierce < 0) bullet.destroy();
  }

  onPlayerBulletHitsBoss(bullet, bossBody) {
    const boss = bossBody?.receiveDamage ? bossBody : this.boss;
    if (!boss?.receiveDamage) {
      bullet.destroy();
      return;
    }
    boss.receiveDamage(bullet.damage);
    bullet.pierce -= 1;
    this.spawnImpact(bullet.x, bullet.y, 0xffe4a0);
    if (bullet.pierce < 0) bullet.destroy();
  }

  onEnemyBulletHitsPlayer(_player, bullet) {
    bullet.destroy();
    this.damagePlayer(1, bullet.x);
  }

  onPlayerHazard(player, hazard) {
    const activeTimed = hazard.activeHazard !== undefined ? hazard.activeHazard : true;
    if (!activeTimed) return;
    this.damagePlayer(hazard.hazardDamage || 1, hazard.x);
    if (hazard.isCollapsing) {
      hazard.body.enable = false;
      this.tweens.add({ targets: hazard, alpha: 0.2, y: hazard.y + 220, duration: 900, onComplete: () => hazard.destroy() });
    }
  }

  damagePlayer(amount, sourceX) {
    const dead = this.player.damage(amount);
    this.spawnImpact(this.player.x, this.player.y - 10, 0xff6666);
    if (this.save.settings.screenShake) this.cameras.main.shake(90, 0.004);
    if (dead) {
      this.player.lives -= 1;
      if (this.player.lives < 0) {
        this.registry.set('score', this.score);
        this.scene.start('GameOverScene', { score: this.score, levelIndex: this.levelIndex });
        return;
      }
      this.time.delayedCall(500, () => {
        this.respawnPlayer();
      });
    } else {
      this.player.body.setVelocityX((this.player.x < sourceX ? -1 : 1) * 180);
    }
  }

  respawnPlayer() {
    this.player.resetOnRespawn(this.currentCheckpoint, this.groundY - 40);
    this.enemyBullets.clear(true, true);
    this.enemies.children.iterate((e) => {
      if (e && e.x < this.currentCheckpoint - 100) e.destroy();
    });
  }

  updateCheckpoints() {
    this.checkpoints.forEach((cp) => {
      if (this.player.x >= cp && cp > this.currentCheckpoint) {
        this.currentCheckpoint = cp;
      }
    });
  }

  spawnPickup(x, y) {
    const p = PICKUPS[Phaser.Math.Between(0, PICKUPS.length - 1)];
    const pickup = this.add.rectangle(x, y - 8, 22, 22, p.color);
    this.physics.add.existing(pickup, true);
    pickup.pickupType = p.type;
    this.pickups.add(pickup);
    this.add.text(x - 10, y - 16, p.label, { fontSize: '12px', color: '#000' });
  }

  collectPickup(_player, pickup) {
    const type = pickup.pickupType;
    if (['spread', 'laser', 'flame', 'homing'].includes(type)) this.player.weaponManager.setWeapon(type);
    if (type === 'rapid') this.player.weaponManager.activateRapid();
    if (type === 'shieldDrone') this.player.shieldHits = 3;
    if (type === 'bomb') this.player.bombs = Math.min(9, this.player.bombs + 1);
    if (type === 'health') this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2);
    if (type === 'life') this.player.lives += 1;
    pickup.destroy();
  }

  spawnMuzzle() {
    const fx = this.add.rectangle(this.player.x + this.player.lastFacing * 18, this.player.y - 6, 12, 8, 0xfff4aa).setDepth(7);
    this.tweens.add({ targets: fx, alpha: 0, duration: 70, onComplete: () => fx.destroy() });
  }

  spawnImpact(x, y, color) {
    const fx = this.add.circle(x, y, 10, color, 0.7).setDepth(7);
    this.tweens.add({ targets: fx, radius: 22, alpha: 0, duration: 140, onComplete: () => fx.destroy() });
  }

  spawnWarning(x) {
    const marker = this.add.triangle(x, 50, 0, 20, 20, 0, 40, 20, 0xff5959).setDepth(16);
    marker.setScrollFactor(1, 0);
    this.tweens.add({ targets: marker, alpha: 0, y: marker.y + 25, duration: 500, repeat: 2, yoyo: true, onComplete: () => marker.destroy() });
  }

  onBossDefeated(scoreGain) {
    this.score += scoreGain;
    this.bossDefeated = true;
    this.cameraLockX = null;
    this.time.delayedCall(1200, () => {
      const save = SaveManager.load();
      save.unlockedLevel = Math.max(save.unlockedLevel, this.levelIndex + 2);
      save.highScore = Math.max(save.highScore, this.score);
      SaveManager.save(save);
      this.registry.set('score', this.score);
      if (this.levelIndex === 9) this.scene.start('VictoryScene', { score: this.score });
      else this.scene.start('LevelScene', { levelIndex: this.levelIndex + 1 });
    });
  }
}

(() => {
  const GAME_WIDTH = 960;
  const GAME_HEIGHT = 540;
  const PLAYER_CONFIG = { lives: 3, maxHp: 5, bombsPerLife: 3, speed: 220, jumpVelocity: -430, invulnMs: 1000, respawnInvulnMs: 1500 };
  const WEAPONS = {
    rifle: { key: 'rifle', cooldown: 170, speed: 640, damage: 1, count: 1, spread: 0, pierce: 0, life: 1400 },
    spread: { key: 'spread', cooldown: 280, speed: 530, damage: 1, count: 3, spread: 16, pierce: 0, life: 900 },
    laser: { key: 'laser', cooldown: 340, speed: 760, damage: 2, count: 1, spread: 0, pierce: 2, life: 850 },
    flame: { key: 'flame', cooldown: 85, speed: 340, damage: 0.7, count: 3, spread: 24, pierce: 0, life: 350 },
    homing: { key: 'homing', cooldown: 360, speed: 330, damage: 0.85, count: 2, spread: 8, pierce: 0, life: 1700, homing: true },
  };
  const ENEMY_TYPES = {
    grunt: { hp: 2, speed: 65, score: 100, cadence: 1300, color: 0x9aa0b4, behavior: 'grunt', projectileSpeed: 280, telegraph: 0 },
    runner: { hp: 1.5, speed: 150, score: 140, cadence: 0, color: 0xff7a7a, behavior: 'runner', projectileSpeed: 0, telegraph: 0 },
    turret: { hp: 3, speed: 0, score: 180, cadence: 1300, color: 0x7f8fb2, behavior: 'turret', projectileSpeed: 300, telegraph: 120 },
    jumper: { hp: 2.2, speed: 100, score: 180, cadence: 1100, color: 0xbd9fe0, behavior: 'jumper', projectileSpeed: 280, telegraph: 120 },
    shield: { hp: 4, speed: 55, score: 220, cadence: 1400, color: 0x4f92d1, behavior: 'shield', projectileSpeed: 290, telegraph: 140 },
    sniper: { hp: 2.5, speed: 30, score: 260, cadence: 2200, color: 0x8ff0ff, behavior: 'sniper', projectileSpeed: 620, telegraph: 600 },
    pod: { hp: 1, speed: 120, score: 80, cadence: 1200, color: 0xc6f57f, behavior: 'flying', projectileSpeed: 230, telegraph: 0 },
    heavy: { hp: 6, speed: 45, score: 300, cadence: 920, color: 0xb76f5f, behavior: 'heavy', projectileSpeed: 340, telegraph: 90 },
    mine: { hp: 1.5, speed: 90, score: 120, cadence: 0, color: 0xf9ca59, behavior: 'mine', projectileSpeed: 0, telegraph: 450 },
    missile: { hp: 2.2, speed: 50, score: 210, cadence: 2100, color: 0xf2934d, behavior: 'missile', projectileSpeed: 260, telegraph: 500 },
  };
  const PICKUPS = [
    { type: 'spread', color: 0x77ff77, label: 'S' }, { type: 'laser', color: 0x77b9ff, label: 'L' }, { type: 'flame', color: 0xff884d, label: 'F' },
    { type: 'homing', color: 0xff7af5, label: 'H' }, { type: 'rapid', color: 0xffffff, label: 'R' }, { type: 'shieldDrone', color: 0x91fff8, label: 'D' },
    { type: 'bomb', color: 0xffe077, label: 'B' }, { type: 'health', color: 0xff6f6f, label: '+' }, { type: 'life', color: 0xc8ff7f, label: '1UP' },
  ];
  const LEVELS = [
    { id: 1, name: 'Jungle Insertion', theme: 0x214025, hazardSet: ['spike', 'collapse'], enemyPool: ['grunt', 'runner', 'turret'] },
    { id: 2, name: 'River Outpost', theme: 0x224b54, hazardSet: ['moving', 'acid'], enemyPool: ['pod', 'mine', 'turret'] },
    { id: 3, name: 'Steel Rail Ambush', theme: 0x3f3b46, hazardSet: ['debris', 'laser'], enemyPool: ['jumper', 'missile', 'grunt'] },
    { id: 4, name: 'Desert Foundry', theme: 0x5f3a22, hazardSet: ['flame', 'crusher'], enemyPool: ['shield', 'heavy', 'turret'] },
    { id: 5, name: 'Midnight City Siege', theme: 0x302850, hazardSet: ['laser', 'spike'], enemyPool: ['sniper', 'pod', 'missile'] },
    { id: 6, name: 'Arctic Relay', theme: 0x3e5675, hazardSet: ['electric', 'collapse'], enemyPool: ['heavy', 'mine', 'jumper'] },
    { id: 7, name: 'Bio-Lab Breach', theme: 0x1f4f45, hazardSet: ['acid', 'electric'], enemyPool: ['runner', 'pod', 'sniper', 'shield'] },
    { id: 8, name: 'Sky Fortress Lift', theme: 0x284a5d, hazardSet: ['debris', 'moving'], enemyPool: ['pod', 'missile', 'jumper'] },
    { id: 9, name: 'Black Sun Citadel', theme: 0x2a2f3d, hazardSet: ['laser', 'crusher'], enemyPool: ['shield', 'sniper', 'heavy', 'missile'] },
    { id: 10, name: 'Core of the Black Sun', theme: 0x4e2427, hazardSet: ['debris', 'electric', 'acid'], enemyPool: ['heavy', 'sniper', 'runner', 'pod', 'missile'] },
  ];
  const DIFFICULTY_BY_LEVEL = LEVELS.map((_, idx) => ({ hpMult: 1 + idx * 0.13, fireMult: 1 + idx * 0.09, waveCount: 4 + idx, spawnGap: Math.max(450, 1300 - idx * 70) }));
  const BOSS_CONFIGS = [
    { name: 'Siege Walker Mk I', color: 0xbb996b, baseHp: 80, score: 5000, patterns: [{ type: 'spread', cooldown: 1400 }, { type: 'dash', cooldown: 1700 }] },
    { name: 'Gator Tank', color: 0x4e9e7b, baseHp: 86, score: 5500, patterns: [{ type: 'spread', cooldown: 1300 }, { type: 'missiles', cooldown: 2300 }] },
    { name: 'Iron Locomotive Core', color: 0xa1a1bc, baseHp: 92, score: 6000, patterns: [{ type: 'ring', cooldown: 2300 }, { type: 'spread', cooldown: 1200 }] },
    { name: 'Furnace Colossus', color: 0xd17e47, baseHp: 98, score: 6500, patterns: [{ type: 'dash', cooldown: 1300 }, { type: 'spread', cooldown: 1100 }, { type: 'ring', cooldown: 2300 }] },
    { name: 'Widow Gunship', color: 0x8a78de, baseHp: 100, score: 7000, patterns: [{ type: 'missiles', cooldown: 2100 }, { type: 'spread', cooldown: 900 }] },
    { name: 'Polar Drill Beast', color: 0x90c0e2, baseHp: 108, score: 7600, patterns: [{ type: 'dash', cooldown: 1100 }, { type: 'ring', cooldown: 1900 }] },
    { name: 'Chimera Node', color: 0x5bbf97, baseHp: 114, score: 8200, patterns: [{ type: 'ring', cooldown: 1700 }, { type: 'missiles', cooldown: 2100 }, { type: 'spread', cooldown: 1000 }] },
    { name: 'Twin Sentinels', color: 0x7dc4c9, baseHp: 116, score: 8800, patterns: [{ type: 'spread', cooldown: 850 }, { type: 'ring', cooldown: 1800 }, { type: 'dash', cooldown: 1200 }] },
    { name: 'Warden Magnus', color: 0x8f8f8f, baseHp: 122, score: 9500, patterns: [{ type: 'missiles', cooldown: 1700 }, { type: 'dash', cooldown: 980 }, { type: 'spread', cooldown: 760 }] },
    { name: 'Director Voss / Helios Engine', color: 0xe56f6f, baseHp: 134, score: 12000, patterns: [{ type: 'ring', cooldown: 1400 }, { type: 'missiles', cooldown: 1600 }, { type: 'dash', cooldown: 920 }, { type: 'spread', cooldown: 700 }] },
  ];

  const SAVE_KEY = 'iron-viper-black-sun-save-v1';
  const defaultSave = { highScore: 0, unlockedLevel: 1, settings: { masterVolume: 0.8, sfxVolume: 0.8, musicVolume: 0.6, screenShake: true } };
  const Save = {
    load() { try { return { ...defaultSave, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'), settings: { ...defaultSave.settings, ...(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}').settings || {}) } }; } catch { return structuredClone(defaultSave); } },
    save(state) { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); },
  };

  class InputManager {
    constructor(scene) {
      this.scene = scene;
      this.keys = scene.input.keyboard.addKeys({ left: 'LEFT', right: 'RIGHT', up: 'UP', down: 'DOWN', a: 'A', d: 'D', w: 'W', s: 'S', jump: 'Z', shoot: 'X', bomb: 'C', pauseEsc: 'ESC', pauseEnter: 'ENTER' });
      this.pad = null; this.pauseLatch = false; this.prevPadState = { bomb: false, pause: false, jump: false };
      scene.input.gamepad.on('connected', (pad) => { this.pad = pad; });
      scene.input.gamepad.on('disconnected', (pad) => { if (this.pad && this.pad.index === pad.index) { this.pad = null; this.prevPadState = { bomb: false, pause: false, jump: false }; } });
    }
    getMoveX() { const k = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0); let g = 0; if (this.pad) { g = Math.abs(this.pad.axes[0]?.getValue?.() || 0) > 0.22 ? this.pad.axes[0].getValue() : 0; if (this.pad.left || this.pad.right) g = (this.pad.left ? -1 : 0) + (this.pad.right ? 1 : 0); } return Phaser.Math.Clamp(Math.abs(g) > Math.abs(k) ? g : k, -1, 1); }
    getAim() { let x = this.getMoveX(); let y = (this.keys.up.isDown || this.keys.w.isDown ? -1 : 0) + (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0); if (this.pad) { const axX = Math.abs(this.pad.axes[2]?.getValue?.() || 0) > 0.22 ? this.pad.axes[2].getValue() : x; const axY = Math.abs(this.pad.axes[3]?.getValue?.() || 0) > 0.22 ? this.pad.axes[3].getValue() : y; x = axX; y = axY; if (this.pad.up || this.pad.down) y = (this.pad.up ? -1 : 0) + (this.pad.down ? 1 : 0); if (this.pad.left || this.pad.right) x = (this.pad.left ? -1 : 0) + (this.pad.right ? 1 : 0); } if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) return { x: 1, y: 0 }; const len = Math.hypot(x, y) || 1; return { x: x / len, y: y / len }; }
    consumePadEdge(name, isPressed) { const wasPressed = this.prevPadState[name]; this.prevPadState[name] = !!isPressed; return !!isPressed && !wasPressed; }
    jumpPressed() { const padJump = this.consumePadEdge('jump', !!this.pad?.A); return Phaser.Input.Keyboard.JustDown(this.keys.jump) || padJump; }
    shootHeld() { return this.keys.shoot.isDown || !!this.pad?.X; }
    bombPressed() { const padBomb = this.consumePadEdge('bomb', !!this.pad?.R1); return Phaser.Input.Keyboard.JustDown(this.keys.bomb) || padBomb; }
    pausePressed() { const keyboardPause = Phaser.Input.Keyboard.JustDown(this.keys.pauseEsc) || Phaser.Input.Keyboard.JustDown(this.keys.pauseEnter); const gamepadPause = this.consumePadEdge('pause', !!this.pad?.START); const pressed = keyboardPause || gamepadPause; if (pressed && !this.pauseLatch) { this.pauseLatch = true; this.scene.time.delayedCall(180, () => { this.pauseLatch = false; }); return true; } return false; }
    anyPress() { const keyAny = this.scene.input.keyboard.checkDown(this.keys.jump, 1) || this.scene.input.keyboard.checkDown(this.keys.shoot, 1) || this.scene.input.keyboard.checkDown(this.keys.pauseEnter, 1); const padAny = this.pad && this.pad.buttons.some((b) => b.pressed); return keyAny || !!padAny; }
  }

  class Projectile extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y, owner, damage, life, color) { super(scene, x, y, 'pixel'); scene.add.existing(this); scene.physics.add.existing(this); this.owner = owner; this.damage = damage; this.life = life; this.pierce = 0; this.setTint(color); this.setDepth(5); this.body.setAllowGravity(false); }
    preUpdate(_time, delta) { this.life -= delta; if (this.life <= 0 || this.x < -100 || this.x > this.scene.levelWidth + 100 || this.y < -50 || this.y > 650) this.destroy(); }
  }

  class WeaponManager {
    constructor(scene, owner) { this.scene = scene; this.owner = owner; this.weaponKey = 'rifle'; this.rapidTimer = 0; this.lastFire = 0; this.projectiles = scene.physics.add.group({ runChildUpdate: true, classType: Projectile }); }
    setWeapon(key) { if (WEAPONS[key]) this.weaponKey = key; }
    activateRapid(ms = 8000) { this.rapidTimer = Math.max(this.rapidTimer, ms); }
    update(delta) { this.rapidTimer = Math.max(0, this.rapidTimer - delta); }
    fire(aim, now) { const base = WEAPONS[this.weaponKey]; const cooldown = this.rapidTimer > 0 ? base.cooldown * 0.5 : base.cooldown; if (now - this.lastFire < cooldown) return; this.lastFire = now;
      for (let i = 0; i < base.count; i++) { const offset = (i - (base.count - 1) / 2) * base.spread; const angle = Phaser.Math.Angle.Between(0, 0, aim.x, aim.y) + Phaser.Math.DegToRad(offset); const dx = Math.cos(angle); const dy = Math.sin(angle); const p = new Projectile(this.scene, this.owner.x + dx * 22, this.owner.y + dy * 8, 'player', base.damage, base.life, 0xfff7a8); p.setScale(8, 3); p.pierce = base.pierce; this.projectiles.add(p); this.scene.physics.velocityFromRotation(angle, base.speed, p.body.velocity); if (base.homing) p.homing = true; }
      this.scene.events.emit('player-fire');
    }
  }

  class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) { super(scene, x, y, 'pixel'); scene.add.existing(this); scene.physics.add.existing(this); this.setScale(24, 36).setTint(0x88d1ff); this.body.setCollideWorldBounds(true); this.weaponManager = new WeaponManager(scene, this); this.maxHp = PLAYER_CONFIG.maxHp; this.hp = this.maxHp; this.lives = PLAYER_CONFIG.lives; this.bombs = PLAYER_CONFIG.bombsPerLife; this.invuln = 0; this.spawnInvuln = 0; this.shieldHits = 0; this.lastFacing = 1; }
    resetOnRespawn(x, y) { this.setPosition(x, y); this.hp = this.maxHp; this.bombs = PLAYER_CONFIG.bombsPerLife; this.spawnInvuln = PLAYER_CONFIG.respawnInvulnMs; this.setActive(true).setVisible(true); this.body.enable = true; }
    update(input, time, delta) { this.weaponManager.update(delta); this.invuln = Math.max(0, this.invuln - delta); this.spawnInvuln = Math.max(0, this.spawnInvuln - delta); this.alpha = this.invuln > 0 || this.spawnInvuln > 0 ? (Math.floor(time / 50) % 2 ? 0.4 : 1) : 1; const move = input.getMoveX(); this.body.setVelocityX(move * PLAYER_CONFIG.speed); if (move !== 0) this.lastFacing = Math.sign(move); if (input.jumpPressed() && this.body.blocked.down) this.setVelocityY(PLAYER_CONFIG.jumpVelocity); if (input.shootHeld()) { const aim = input.getAim(); if (Math.abs(aim.x) < 0.1 && Math.abs(aim.y) < 0.1) aim.x = this.lastFacing; this.weaponManager.fire(aim, time); } }
    damage(amount) { if (this.invuln > 0 || this.spawnInvuln > 0) return false; if (this.shieldHits > 0) { this.shieldHits -= 1; this.invuln = 300; return false; } this.hp -= amount; this.invuln = PLAYER_CONFIG.invulnMs; return this.hp <= 0; }
  }

  class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, diff) { super(scene, x, y, 'pixel'); scene.add.existing(this); scene.physics.add.existing(this); this.type = type; this.cfg = ENEMY_TYPES[type]; this.hp = this.cfg.hp * diff.hpMult; this.score = Math.round(this.cfg.score * diff.hpMult); this.setScale(type === 'pod' ? 20 : 24, type === 'pod' ? 20 : 28).setTint(this.cfg.color); this.body.setAllowGravity(type !== 'pod').setCollideWorldBounds(true); this.nextFire = 0; this.fireRate = this.cfg.cadence > 0 ? this.cfg.cadence / diff.fireMult : 99999; }
    updateBehavior(player, time, bullets) { if (!this.active) return; const dir = Math.sign(player.x - this.x) || -1; switch (this.cfg.behavior) { case 'runner': case 'mine': this.setVelocityX(dir * this.cfg.speed); break; case 'flying': this.setVelocity(dir * this.cfg.speed, Math.sin(time / 260 + this.x * 0.01) * 70); break; case 'jumper': this.setVelocityX(dir * this.cfg.speed * 0.6); if (this.body.blocked.down && Math.random() < 0.015) this.setVelocityY(-320); break; case 'sniper': case 'missile': case 'turret': this.setVelocityX(0); break; default: this.setVelocityX(dir * this.cfg.speed * 0.45); }
      if (time > this.nextFire && this.cfg.cadence > 0) { this.nextFire = time + this.fireRate; if (this.cfg.behavior === 'sniper') { const line = this.scene.add.rectangle(this.x, this.y, Math.max(20, Math.abs(player.x - this.x)), 3, 0xff4444).setOrigin(0, 0.5); line.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y); this.scene.time.delayedCall(this.cfg.telegraph, () => { if (!this.active) return; line.destroy(); this.shootAt(player, bullets, 1.5); }); } else if (this.cfg.behavior === 'missile') { this.scene.spawnWarning(player.x + Phaser.Math.Between(-180, 180)); this.scene.time.delayedCall(this.cfg.telegraph, () => this.shootAt(player, bullets, 1)); } else this.shootAt(player, bullets, 1); }
    }
    shootAt(player, bullets, scale) { if (!this.active || !player.active) return; const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y); const b = new Projectile(this.scene, this.x, this.y, 'enemy', 1, 2500, 0xff6f6f); b.setScale(7, 3 * scale); bullets.add(b); this.scene.physics.velocityFromRotation(angle, this.cfg.projectileSpeed, b.body.velocity); }
    receiveDamage(d) { this.hp -= d; if (this.hp <= 0) { this.scene.events.emit('enemy-killed', this.score, this.x, this.y); this.destroy(); } }
  }

  class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, cfg, diff) { super(scene, x, y, 'pixel'); scene.add.existing(this); scene.physics.add.existing(this); this.cfg = cfg; this.hpMax = Math.round(cfg.baseHp * diff.hpMult * 1.4); this.hp = this.hpMax; this.phase = 1; this.nextAction = 1200; this.attackIndex = 0; this.setTint(cfg.color).setScale(78, 82); this.body.setAllowGravity(false).setImmovable(true); this.introDone = false; }
    startIntro() { this.y -= 200; this.scene.tweens.add({ targets: this, y: this.scene.groundY - 70, duration: 900, ease: 'Cubic.easeOut', onComplete: () => { this.introDone = true; } }); }
    updateBoss(player, time, bullets) { if (!this.active || !this.introDone) return; if (this.hp < this.hpMax * 0.5) this.phase = 2; this.x = Phaser.Math.Clamp(this.x + Math.sin(time / 700) * 1.2, this.scene.levelWidth - 360, this.scene.levelWidth - 90); if (time < this.nextAction) return; const pattern = this.cfg.patterns[(this.attackIndex++) % this.cfg.patterns.length]; this.nextAction = time + pattern.cooldown / (this.phase === 2 ? 1.2 : 1);
      if (pattern.type === 'spread') for (let i = -2; i <= 2; i++) this.spawnBullet(player, bullets, i * 0.2, 290 + this.phase * 30);
      if (pattern.type === 'dash') { const tx = Phaser.Math.Clamp(player.x + Phaser.Math.Between(-40, 40), this.scene.levelWidth - 420, this.scene.levelWidth - 120); this.scene.tweens.add({ targets: this, x: tx, duration: 280, yoyo: true }); this.scene.cameras.main.shake(100, 0.008); }
      if (pattern.type === 'ring') for (let a = 0; a < 12; a++) this.spawnBulletAngle((Math.PI * 2 * a) / 12, bullets, 210 + this.phase * 45);
      if (pattern.type === 'missiles') for (let i = 0; i < 3 + this.phase; i++) { const wx = player.x + Phaser.Math.Between(-180, 180); this.scene.spawnWarning(wx); this.scene.time.delayedCall(420 + i * 120, () => { if (!this.active) return; const b = new Projectile(this.scene, wx, -20, 'enemy', 1, 3000, 0xff9b59); b.setScale(6, 18); bullets.add(b); b.body.velocity.y = 260; }); }
    }
    spawnBullet(player, bullets, off, speed) { this.spawnBulletAngle(Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + off, bullets, speed); }
    spawnBulletAngle(angle, bullets, speed) { const b = new Projectile(this.scene, this.x - 40, this.y - 20, 'enemy', 1, 2800, 0xff7f7f); b.setScale(8, 4); bullets.add(b); this.scene.physics.velocityFromRotation(angle, speed, b.body.velocity); }
    receiveDamage(d) { this.hp -= d; if (this.hp <= 0) { this.scene.events.emit('boss-defeated', this.cfg.score || 5000); this.destroy(); } }
  }

  const createHazards = (scene, level, width) => {
    const hazards = scene.physics.add.staticGroup();
    const dynamic = scene.physics.add.group({ allowGravity: false, immovable: true });
    const chunk = width / 5;
    level.hazardSet.forEach((haz, idx) => {
      const x = chunk * (idx + 1) + 120;
      if (haz === 'spike' || haz === 'acid') { const z = scene.add.rectangle(x, scene.groundY - 8, 120, 16, haz === 'spike' ? 0xbb5555 : 0x66d16b); scene.physics.add.existing(z, true); hazards.add(z); z.hazardDamage = haz === 'spike' ? 1 : 2; }
      if (haz === 'flame' || haz === 'electric' || haz === 'laser') { const z = scene.add.rectangle(x, scene.groundY - 60, 22, 120, haz === 'flame' ? 0xff9050 : haz === 'electric' ? 0x7ae5ff : 0xff4a9f); scene.physics.add.existing(z); z.body.setAllowGravity(false).setImmovable(true); dynamic.add(z); z.hazardDamage = haz === 'flame' ? 2 : 1; z.setAlpha(0.2); scene.time.addEvent({ delay: 1500, loop: true, callback: () => { z.activeHazard = !z.activeHazard; z.setAlpha(z.activeHazard ? 0.95 : 0.2); } }); }
      if (haz === 'moving' || haz === 'collapse') { const p = scene.add.rectangle(x, scene.groundY - 90, 130, 18, 0x858ca6); scene.physics.add.existing(p); p.body.setAllowGravity(false).setImmovable(true); dynamic.add(p); if (haz === 'moving') scene.tweens.add({ targets: p, y: scene.groundY - 140, yoyo: true, repeat: -1, duration: 1800 }); else p.isCollapsing = true; }
      if (haz === 'crusher' || haz === 'debris') { const y = haz === 'crusher' ? 90 : -100; const s = scene.add.rectangle(x, y, 68, 30, 0xa0a0a0); scene.physics.add.existing(s); s.body.setAllowGravity(false).setImmovable(true); dynamic.add(s); s.hazardDamage = 2; scene.tweens.add({ targets: s, y: scene.groundY - 25, duration: 650, yoyo: true, repeat: -1, hold: 650 }); }
    });
    return { hazards, dynamic };
  };

  class HUD {
    constructor(scene) { this.scene = scene; this.text = scene.add.text(16, 14, '', { fontSize: '18px', color: '#fff' }).setScrollFactor(0).setDepth(20); this.bossBg = scene.add.rectangle(480, 30, 420, 14, 0x333333).setScrollFactor(0).setDepth(20).setVisible(false); this.boss = scene.add.rectangle(270, 30, 410, 10, 0xff5f5f).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21).setVisible(false); this.card = scene.add.text(480, 240, '', { fontSize: '32px', color: '#ffe9a2', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(22).setStroke('#000', 6); }
    showStageCard(t) { this.card.setText(t).setAlpha(1); this.scene.tweens.add({ targets: this.card, alpha: 0, duration: 1600, delay: 700 }); }
    update(s) { this.text.setText(`HP ${s.hp}/${s.maxHp}   Lives ${s.lives}   Bombs ${s.bombs}   Weapon ${s.weapon}   Score ${s.score}   Stage ${s.stage}`); if (s.boss) { this.bossBg.setVisible(true); this.boss.setVisible(true); this.boss.width = 410 * Phaser.Math.Clamp(s.boss.hp / s.boss.max, 0, 1); } else { this.bossBg.setVisible(false); this.boss.setVisible(false); } }
  }

  class BootScene extends Phaser.Scene { constructor() { super('BootScene'); } create() { const g = this.add.graphics(); g.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1).generateTexture('pixel', 1, 1).destroy(); this.cameras.main.setBackgroundColor('#05070e'); this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'IRON VIPER\nBLACK SUN', { fontSize: '46px', align: 'center', color: '#ffdb7d' }).setOrigin(0.5); this.time.delayedCall(350, () => this.scene.start('TitleScene')); } }

  class TitleScene extends Phaser.Scene {
    constructor() { super('TitleScene'); }
    create() { this.inputManager = new InputManager(this); this.cameras.main.setBackgroundColor('#0b1229'); this.add.text(GAME_WIDTH / 2, 130, 'IRON VIPER: BLACK SUN', { fontSize: '48px', color: '#ffe289' }).setOrigin(0.5); this.add.text(GAME_WIDTH / 2, 198, 'Single-Player Run-and-Gun', { fontSize: '20px', color: '#b6ccff' }).setOrigin(0.5); this.prompt = this.add.text(GAME_WIDTH / 2, 260, 'Press any button / key', { fontSize: '28px', color: '#fff' }).setOrigin(0.5); this.options = ['Start Game', 'Level Select', 'Controls', 'Settings']; this.selected = 0; this.optionTexts = this.options.map((o, i) => this.add.text(GAME_WIDTH / 2, 325 + i * 38, o, { fontSize: '26px', color: '#8ea9f5' }).setOrigin(0.5)); this.selection = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', w: 'W', s: 'S', confirm: 'ENTER' }); this.draw(); }
    draw() { this.optionTexts.forEach((t, i) => t.setColor(i === this.selected ? '#ffe289' : '#8ea9f5')); }
    update() { this.prompt.alpha = 0.6 + Math.sin(this.time.now / 260) * 0.4; if (Phaser.Input.Keyboard.JustDown(this.selection.up) || Phaser.Input.Keyboard.JustDown(this.selection.w)) { this.selected = (this.selected + this.options.length - 1) % this.options.length; this.draw(); } if (Phaser.Input.Keyboard.JustDown(this.selection.down) || Phaser.Input.Keyboard.JustDown(this.selection.s)) { this.selected = (this.selected + 1) % this.options.length; this.draw(); } if (this.inputManager.anyPress() || Phaser.Input.Keyboard.JustDown(this.selection.confirm)) { if (this.selected === 0) this.scene.start('LevelScene', { levelIndex: 0, newRun: true }); if (this.selected === 1) this.scene.start('LevelSelectScene'); if (this.selected === 2) this.scene.start('ControlsScene'); if (this.selected === 3) this.scene.start('SettingsScene'); } }
  }

  class LevelSelectScene extends Phaser.Scene { constructor() { super('LevelSelectScene'); } create() { const save = Save.load(); this.unlocked = save.unlockedLevel; this.add.text(GAME_WIDTH / 2, 80, 'LEVEL SELECT', { fontSize: '40px', color: '#ffe289' }).setOrigin(0.5); this.levels = Array.from({ length: 10 }, (_, i) => i + 1); this.selected = 0; this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER', back: 'ESC' }); this.texts = this.levels.map((n, i) => this.add.text(GAME_WIDTH / 2, 140 + i * 34, `Stage ${n}${n <= this.unlocked ? '' : ' (LOCKED)'}`, { fontSize: '22px', color: '#98a7d0' }).setOrigin(0.5)); this.redraw(); } redraw() { this.texts.forEach((t, i) => t.setColor(i === this.selected ? '#fff3b3' : (i + 1 <= this.unlocked ? '#98a7d0' : '#666'))); } update() { if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.selected = (this.selected + 9) % 10; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.selected = (this.selected + 1) % 10; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.back)) this.scene.start('TitleScene'); if (Phaser.Input.Keyboard.JustDown(this.keys.enter) && this.selected + 1 <= this.unlocked) this.scene.start('LevelScene', { levelIndex: this.selected }); } }

  class ControlsScene extends Phaser.Scene { constructor() { super('ControlsScene'); } create() { this.cameras.main.setBackgroundColor('#0a1026'); this.add.text(GAME_WIDTH / 2, 90, 'CONTROLS', { fontSize: '42px', color: '#ffe289' }).setOrigin(0.5); this.add.text(130, 160, 'GAMEPAD (PRIMARY)\n- Left stick / D-pad: move + aim\n- A/Cross: Jump\n- X/Square: Shoot\n- RB/R1: Bomb\n- Start/Options: Pause\n\nKEYBOARD FALLBACK\n- Arrows/WASD: move + aim\n- Z: Jump\n- X: Shoot\n- C: Bomb\n- Enter or Esc: Pause\n\nPress Esc to return.', { fontSize: '22px', color: '#d8e4ff', lineSpacing: 8 }); this.key = this.input.keyboard.addKey('ESC'); } update() { if (Phaser.Input.Keyboard.JustDown(this.key)) this.scene.start('TitleScene'); } }

  class SettingsScene extends Phaser.Scene {
    constructor() { super('SettingsScene'); }
    create() { this.state = Save.load(); this.options = [{ key: 'masterVolume', label: 'Master Volume', step: 0.1 }, { key: 'sfxVolume', label: 'SFX Volume', step: 0.1 }, { key: 'musicVolume', label: 'Music Volume', step: 0.1 }, { key: 'screenShake', label: 'Screen Shake', step: 1 }]; this.sel = 0; this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', back: 'ESC', enter: 'ENTER', f: 'F' }); this.add.text(GAME_WIDTH / 2, 90, 'SETTINGS', { fontSize: '42px', color: '#ffe289' }).setOrigin(0.5); this.rows = this.options.map((_, i) => this.add.text(180, 170 + i * 44, '', { fontSize: '24px', color: '#c8d9ff' })); this.add.text(180, 400, 'Arrows: navigate/adjust, F: fullscreen, Esc: back', { fontSize: '19px', color: '#8ca8de' }); this.refresh(); }
    refresh() { this.rows.forEach((r, i) => { const o = this.options[i]; const v = this.state.settings[o.key]; r.setText(`${i === this.sel ? '>' : ' '} ${o.label}: ${typeof v === 'boolean' ? (v ? 'ON' : 'OFF') : v.toFixed(1)}`); r.setColor(i === this.sel ? '#fff1ac' : '#c8d9ff'); }); }
    adjust(d) { const o = this.options[this.sel]; if (typeof this.state.settings[o.key] === 'boolean') this.state.settings[o.key] = !this.state.settings[o.key]; else this.state.settings[o.key] = Phaser.Math.Clamp(this.state.settings[o.key] + d * o.step, 0, 1); Save.save(this.state); this.refresh(); }
    update() { if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + this.options.length - 1) % this.options.length; this.refresh(); } if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % this.options.length; this.refresh(); } if (Phaser.Input.Keyboard.JustDown(this.keys.left)) this.adjust(-1); if (Phaser.Input.Keyboard.JustDown(this.keys.right) || Phaser.Input.Keyboard.JustDown(this.keys.enter)) this.adjust(1); if (Phaser.Input.Keyboard.JustDown(this.keys.f)) this.scale.toggleFullscreen(); if (Phaser.Input.Keyboard.JustDown(this.keys.back)) this.scene.start('TitleScene'); }
  }

  class PauseScene extends Phaser.Scene { constructor() { super('PauseScene'); } init(data) { this.parentKey = data.parentKey; } create() { this.add.rectangle(480, 270, 960, 540, 0x000, 0.5); this.items = ['Resume', 'Restart Level', 'Controls', 'Quit to Title']; this.sel = 0; this.texts = this.items.map((l, i) => this.add.text(480, 210 + i * 50, l, { fontSize: '32px', color: '#95b1ff' }).setOrigin(0.5)); this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER', esc: 'ESC' }); this.redraw(); } redraw() { this.texts.forEach((t, i) => t.setColor(i === this.sel ? '#ffe289' : '#95b1ff')); } update() { if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % this.items.length; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.enter) || Phaser.Input.Keyboard.JustDown(this.keys.esc)) { if (this.sel === 0 || Phaser.Input.Keyboard.JustDown(this.keys.esc)) { this.scene.stop(); this.scene.resume(this.parentKey); } else if (this.sel === 1) { this.scene.stop(this.parentKey); this.scene.stop(); this.scene.start('LevelScene', { levelIndex: this.registry.get('levelIndex') }); } else if (this.sel === 2) { this.scene.pause(); this.scene.launch('ControlsScene'); } else { this.scene.stop(this.parentKey); this.scene.stop(); this.scene.start('TitleScene'); } } } }

  class GameOverScene extends Phaser.Scene { constructor() { super('GameOverScene'); } init(data) { this.score = data.score || 0; this.levelIndex = data.levelIndex || 0; } create() { this.cameras.main.setBackgroundColor('#160a0a'); this.add.text(480, 170, 'GAME OVER', { fontSize: '64px', color: '#ff7070' }).setOrigin(0.5); this.add.text(480, 240, `Score: ${this.score}`, { fontSize: '30px', color: '#fff' }).setOrigin(0.5); this.items = ['Continue', 'Retry', 'Quit']; this.sel = 0; this.texts = this.items.map((l, i) => this.add.text(480, 320 + i * 44, l, { fontSize: '30px', color: '#a5b9ff' }).setOrigin(0.5)); this.keys = this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', enter: 'ENTER' }); this.redraw(); } redraw() { this.texts.forEach((t, i) => t.setColor(i === this.sel ? '#ffe289' : '#a5b9ff')); } update() { if (Phaser.Input.Keyboard.JustDown(this.keys.up)) { this.sel = (this.sel + 2) % 3; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.down)) { this.sel = (this.sel + 1) % 3; this.redraw(); } if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) { if (this.sel === 0) this.scene.start('LevelScene', { levelIndex: Math.max(0, this.levelIndex - 1), continueRun: true }); else if (this.sel === 1) this.scene.start('LevelScene', { levelIndex: this.levelIndex }); else this.scene.start('TitleScene'); } } }

  class VictoryScene extends Phaser.Scene { constructor() { super('VictoryScene'); } init(data) { this.score = data.score || 0; } create() { const save = Save.load(); save.highScore = Math.max(save.highScore, this.score); save.unlockedLevel = 10; Save.save(save); this.cameras.main.setBackgroundColor('#050c16'); this.add.text(480, 120, 'BLACK SUN DESTROYED', { fontSize: '54px', color: '#ffe289' }).setOrigin(0.5); this.add.text(480, 210, `Final Score: ${this.score}\nHigh Score: ${save.highScore}`, { fontSize: '30px', color: '#d6e5ff', align: 'center' }).setOrigin(0.5); this.add.text(480, 310, 'Voss falls as the reactor fractures.\nIron Viper escapes through collapsing fire.\nThe war is not over... but today, the sun sets in silence.', { fontSize: '24px', color: '#b8c9f2', align: 'center' }).setOrigin(0.5); this.add.text(480, 470, 'Press Enter to return to title', { fontSize: '24px', color: '#fff' }).setOrigin(0.5); this.enter = this.input.keyboard.addKey('ENTER'); } update() { if (Phaser.Input.Keyboard.JustDown(this.enter)) this.scene.start('TitleScene'); } }

  class LevelScene extends Phaser.Scene {
    constructor() { super('LevelScene'); }
    init(data) { this.levelIndex = Phaser.Math.Clamp(data.levelIndex || 0, 0, 9); this.levelData = LEVELS[this.levelIndex]; this.difficulty = DIFFICULTY_BY_LEVEL[this.levelIndex]; this.save = Save.load(); this.registry.set('levelIndex', this.levelIndex); this.score = this.registry.get('score') || 0; if (data.newRun) this.score = 0; if (data.continueRun) this.score = Math.max(0, this.score - 500); this.levelWidth = 4500 + this.levelIndex * 420; this.groundY = 452; this.checkpoints = [260, this.levelWidth * 0.34, this.levelWidth * 0.62, this.levelWidth * 0.82]; this.currentCheckpoint = 0; this.spawnTimer = 0; this.wave = 0; this.bossMode = false; this.bossDefeated = false; }
    create() {
      this.cameras.main.setBackgroundColor(Phaser.Display.Color.IntegerToColor(this.levelData.theme).rgba);
      this.physics.world.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
      for (let i = 0; i < 14; i++) { const y = 120 + (i % 4) * 65; const w = 200 + (i % 3) * 80; this.add.rectangle(i * 380 + 90, y, w, 45, 0x000000, 0.2 + (i % 3) * 0.07).setScrollFactor(0.2 + (i % 5) * 0.13, 1); }
      this.platforms = this.physics.add.staticGroup(); const ground = this.add.rectangle(this.levelWidth / 2, this.groundY + 18, this.levelWidth, 40, 0x2a2d37); this.physics.add.existing(ground, true); this.platforms.add(ground);
      this.enemies = this.physics.add.group({ runChildUpdate: true }); this.enemyBullets = this.physics.add.group({ runChildUpdate: true }); this.pickups = this.physics.add.staticGroup();
      this.player = new Player(this, 80, this.groundY - 40); this.inputManager = new InputManager(this); this.hud = new HUD(this); this.hud.showStageCard(`Stage ${this.levelData.id}\n${this.levelData.name}`);
      this.physics.add.collider(this.player, this.platforms); this.physics.add.collider(this.enemies, this.platforms);
      const hz = createHazards(this, this.levelData, this.levelWidth); this.hazards = hz.hazards; this.dynamicHazards = hz.dynamic;
      this.physics.add.collider(this.player, this.dynamicHazards, this.onPlayerHazard, null, this); this.physics.add.collider(this.player, this.hazards, this.onPlayerHazard, null, this); this.physics.add.collider(this.player, this.dynamicHazards); this.physics.add.collider(this.enemies, this.dynamicHazards);
      this.physics.add.overlap(this.player.weaponManager.projectiles, this.enemies, this.onPlayerBulletHitsEnemy, null, this);
      this.physics.add.overlap(this.player.weaponManager.projectiles, this.enemyBullets, (a, b) => { a.destroy(); b.destroy(); });
      this.physics.add.overlap(this.enemyBullets, this.player, this.onEnemyBulletHitsPlayer, null, this);
      this.physics.add.overlap(this.player, this.enemies, (_p, e) => this.damagePlayer(1, e.x), null, this);
      this.physics.add.overlap(this.player, this.pickups, this.collectPickup, null, this);
      this.events.on('enemy-killed', (score, x, y) => { this.score += score; if (Math.random() < 0.12) this.spawnPickup(x, y); this.spawnImpact(x, y, 0xff9d9d); });
      this.events.on('boss-defeated', (score) => this.onBossDefeated(score)); this.events.on('player-fire', () => this.spawnMuzzle());
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08); this.cameras.main.setBounds(0, 0, this.levelWidth, GAME_HEIGHT);
    }
    spawnWave() { const pool = this.levelData.enemyPool; const count = 2 + Math.floor(this.levelIndex / 2) + (this.wave % 2); for (let i = 0; i < count; i++) { const type = pool[(this.wave + i) % pool.length]; const x = this.player.x + GAME_WIDTH + Phaser.Math.Between(100, 480) + i * 80; const y = this.groundY - 30 - (type === 'pod' ? Phaser.Math.Between(40, 170) : 0); this.enemies.add(new Enemy(this, x, y, type, this.difficulty)); } this.wave += 1; }
    maybeBossTrigger() { if (this.bossMode || this.bossDefeated || this.player.x < this.levelWidth - 700) return; this.bossMode = true; this.enemies.clear(true, true); this.enemyBullets.clear(true, true); this.cameraLockX = this.levelWidth - 950; this.player.body.setVelocityX(0); this.boss = new Boss(this, this.levelWidth - 210, this.groundY - 70, BOSS_CONFIGS[this.levelIndex], this.difficulty); this.physics.add.overlap(this.player.weaponManager.projectiles, this.boss, this.onPlayerBulletHitsBoss, null, this); this.physics.add.overlap(this.player, this.boss, () => this.damagePlayer(1, this.boss.x), null, this); this.boss.startIntro(); }
    update(_time, delta) {
      if (this.inputManager.pausePressed()) { this.scene.pause(); this.scene.launch('PauseScene', { parentKey: this.scene.key }); return; }
      this.player.update(this.inputManager, this.time.now, delta); this.updateCheckpoints();
      if (this.inputManager.bombPressed() && this.player.bombs > 0) { this.player.bombs -= 1; this.cameras.main.shake(130, this.save.settings.screenShake ? 0.015 : 0); this.enemies.children.iterate((e) => e?.receiveDamage?.(999)); if (this.boss) this.boss.receiveDamage(8); this.enemyBullets.clear(true, true); }
      if (!this.bossMode) { this.spawnTimer -= delta; if (this.spawnTimer <= 0 && this.wave < this.difficulty.waveCount * 2) { this.spawnWave(); this.spawnTimer = this.difficulty.spawnGap; } }
      this.enemies.children.iterate((e) => e?.updateBehavior?.(this.player, this.time.now, this.enemyBullets));
      this.player.weaponManager.projectiles.children.iterate((p) => this.updateHoming(p, delta));
      if (this.boss) this.boss.updateBoss(this.player, this.time.now, this.enemyBullets);
      this.maybeBossTrigger();
      if (this.cameraLockX) { this.player.x = Math.max(this.player.x, this.cameraLockX + 90); this.player.x = Math.min(this.player.x, this.levelWidth - 50); }
      this.hud.update({ hp: Math.max(0, Math.ceil(this.player.hp)), maxHp: this.player.maxHp, lives: this.player.lives, bombs: this.player.bombs, weapon: this.player.weaponManager.weaponKey, score: this.score, stage: `${this.levelData.id} ${this.levelData.name}`, boss: this.boss ? { hp: Math.max(0, this.boss.hp), max: this.boss.hpMax } : null });
    }
    updateHoming(p, delta) { if (!p?.active || !p.homing) return; let target = null; let best = Infinity; this.enemies.children.iterate((e) => { if (!e?.active) return; const d = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y); if (d < best) { target = e; best = d; } }); if (!target && this.boss?.active) target = this.boss; if (!target) return; const a = Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y); const s = Phaser.Math.Clamp(p.body.velocity.length() + delta * 0.02, 260, 420); this.physics.velocityFromRotation(a, s, p.body.velocity); }
    onPlayerBulletHitsEnemy(b, e) { e.receiveDamage(b.damage); b.pierce -= 1; this.spawnImpact(b.x, b.y, 0xfff7a8); if (b.pierce < 0) b.destroy(); }
    onPlayerBulletHitsBoss(b, boss) { boss.receiveDamage(b.damage); b.pierce -= 1; this.spawnImpact(b.x, b.y, 0xffe4a0); if (b.pierce < 0) b.destroy(); }
    onEnemyBulletHitsPlayer(_p, b) { b.destroy(); this.damagePlayer(1, b.x); }
    onPlayerHazard(_p, h) { const active = h.activeHazard !== undefined ? h.activeHazard : true; if (!active) return; this.damagePlayer(h.hazardDamage || 1, h.x); if (h.isCollapsing) { h.body.enable = false; this.tweens.add({ targets: h, alpha: 0.2, y: h.y + 220, duration: 900, onComplete: () => h.destroy() }); } }
    damagePlayer(amount, sourceX) { const dead = this.player.damage(amount); this.spawnImpact(this.player.x, this.player.y - 10, 0xff6666); if (this.save.settings.screenShake) this.cameras.main.shake(90, 0.004); if (dead) { this.player.lives -= 1; if (this.player.lives < 0) { this.registry.set('score', this.score); this.scene.start('GameOverScene', { score: this.score, levelIndex: this.levelIndex }); return; } this.time.delayedCall(500, () => this.respawnPlayer()); } else this.player.body.setVelocityX((this.player.x < sourceX ? -1 : 1) * 180); }
    respawnPlayer() { this.player.resetOnRespawn(this.currentCheckpoint, this.groundY - 40); this.enemyBullets.clear(true, true); this.enemies.children.iterate((e) => { if (e && e.x < this.currentCheckpoint - 100) e.destroy(); }); }
    updateCheckpoints() { this.checkpoints.forEach((cp) => { if (this.player.x >= cp && cp > this.currentCheckpoint) this.currentCheckpoint = cp; }); }
    spawnPickup(x, y) { const p = PICKUPS[Phaser.Math.Between(0, PICKUPS.length - 1)]; const pickup = this.add.rectangle(x, y - 8, 22, 22, p.color); this.physics.add.existing(pickup, true); pickup.pickupType = p.type; this.pickups.add(pickup); this.add.text(x - 10, y - 16, p.label, { fontSize: '12px', color: '#000' }); }
    collectPickup(_p, pickup) { const t = pickup.pickupType; if (['spread', 'laser', 'flame', 'homing'].includes(t)) this.player.weaponManager.setWeapon(t); if (t === 'rapid') this.player.weaponManager.activateRapid(); if (t === 'shieldDrone') this.player.shieldHits = 3; if (t === 'bomb') this.player.bombs = Math.min(9, this.player.bombs + 1); if (t === 'health') this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2); if (t === 'life') this.player.lives += 1; pickup.destroy(); }
    spawnMuzzle() { const fx = this.add.rectangle(this.player.x + this.player.lastFacing * 18, this.player.y - 6, 12, 8, 0xfff4aa).setDepth(7); this.tweens.add({ targets: fx, alpha: 0, duration: 70, onComplete: () => fx.destroy() }); }
    spawnImpact(x, y, color) { const fx = this.add.circle(x, y, 10, color, 0.7).setDepth(7); this.tweens.add({ targets: fx, radius: 22, alpha: 0, duration: 140, onComplete: () => fx.destroy() }); }
    spawnWarning(x) { const m = this.add.triangle(x, 50, 0, 20, 20, 0, 40, 20, 0xff5959).setDepth(16); m.setScrollFactor(1, 0); this.tweens.add({ targets: m, alpha: 0, y: m.y + 25, duration: 500, repeat: 2, yoyo: true, onComplete: () => m.destroy() }); }
    onBossDefeated(scoreGain) { this.score += scoreGain; this.bossDefeated = true; this.cameraLockX = null; this.time.delayedCall(1200, () => { const save = Save.load(); save.unlockedLevel = Math.max(save.unlockedLevel, this.levelIndex + 2); save.highScore = Math.max(save.highScore, this.score); Save.save(save); this.registry.set('score', this.score); if (this.levelIndex === 9) this.scene.start('VictoryScene', { score: this.score }); else this.scene.start('LevelScene', { levelIndex: this.levelIndex + 1 }); }); }
  }

  window.__ironViperGame = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 860 }, debug: false } },
    input: { gamepad: true },
    scene: [BootScene, TitleScene, LevelSelectScene, ControlsScene, SettingsScene, LevelScene, PauseScene, GameOverScene, VictoryScene],
  });
})();

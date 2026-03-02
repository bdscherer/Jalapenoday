export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const PLAYER_CONFIG = {
  lives: 3,
  maxHp: 5,
  bombsPerLife: 3,
  speed: 220,
  jumpVelocity: -430,
  invulnMs: 1000,
  respawnInvulnMs: 1500,
  fireCooldown: 170,
};

export const WEAPONS = {
  rifle: { key: 'rifle', name: 'Rifle', cooldown: 170, speed: 640, damage: 1, count: 1, spread: 0, pierce: 0, life: 1400 },
  spread: { key: 'spread', name: 'Spread', cooldown: 280, speed: 530, damage: 1, count: 3, spread: 16, pierce: 0, life: 900 },
  laser: { key: 'laser', name: 'Laser', cooldown: 340, speed: 760, damage: 2, count: 1, spread: 0, pierce: 2, life: 850 },
  flame: { key: 'flame', name: 'Flame', cooldown: 85, speed: 340, damage: 0.7, count: 3, spread: 24, pierce: 0, life: 350 },
  homing: { key: 'homing', name: 'Homing', cooldown: 360, speed: 330, damage: 0.85, count: 2, spread: 8, pierce: 0, life: 1700, homing: true },
};

export const ENEMY_TYPES = {
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

export const PICKUPS = [
  { type: 'spread', color: 0x77ff77, label: 'S' },
  { type: 'laser', color: 0x77b9ff, label: 'L' },
  { type: 'flame', color: 0xff884d, label: 'F' },
  { type: 'homing', color: 0xff7af5, label: 'H' },
  { type: 'rapid', color: 0xffffff, label: 'R' },
  { type: 'shieldDrone', color: 0x91fff8, label: 'D' },
  { type: 'bomb', color: 0xffe077, label: 'B' },
  { type: 'health', color: 0xff6f6f, label: '+' },
  { type: 'life', color: 0xc8ff7f, label: '1UP' },
];

export const LEVELS = [
  { id: 1, name: 'Jungle Insertion', theme: 0x214025, hazardSet: ['spike', 'collapse'], boss: 'Siege Walker Mk I', enemyPool: ['grunt', 'runner', 'turret'] },
  { id: 2, name: 'River Outpost', theme: 0x224b54, hazardSet: ['moving', 'acid'], boss: 'Gator Tank', enemyPool: ['pod', 'mine', 'turret'] },
  { id: 3, name: 'Steel Rail Ambush', theme: 0x3f3b46, hazardSet: ['debris', 'laser'], boss: 'Iron Locomotive Core', enemyPool: ['jumper', 'missile', 'grunt'] },
  { id: 4, name: 'Desert Foundry', theme: 0x5f3a22, hazardSet: ['flame', 'crusher'], boss: 'Furnace Colossus', enemyPool: ['shield', 'heavy', 'turret'] },
  { id: 5, name: 'Midnight City Siege', theme: 0x302850, hazardSet: ['laser', 'spike'], boss: 'Widow Gunship', enemyPool: ['sniper', 'pod', 'missile'] },
  { id: 6, name: 'Arctic Relay', theme: 0x3e5675, hazardSet: ['electric', 'collapse'], boss: 'Polar Drill Beast', enemyPool: ['heavy', 'mine', 'jumper'] },
  { id: 7, name: 'Bio-Lab Breach', theme: 0x1f4f45, hazardSet: ['acid', 'electric'], boss: 'Chimera Node', enemyPool: ['runner', 'pod', 'sniper', 'shield'] },
  { id: 8, name: 'Sky Fortress Lift', theme: 0x284a5d, hazardSet: ['debris', 'moving'], boss: 'Twin Sentinels', enemyPool: ['pod', 'missile', 'jumper'] },
  { id: 9, name: 'Black Sun Citadel', theme: 0x2a2f3d, hazardSet: ['laser', 'crusher'], boss: 'Warden Magnus', enemyPool: ['shield', 'sniper', 'heavy', 'missile'] },
  { id: 10, name: 'Core of the Black Sun', theme: 0x4e2427, hazardSet: ['debris', 'electric', 'acid'], boss: 'Director Voss / Helios Engine', enemyPool: ['heavy', 'sniper', 'runner', 'pod', 'missile'] },
];

export const DIFFICULTY_BY_LEVEL = LEVELS.map((_, idx) => ({
  hpMult: 1 + idx * 0.13,
  fireMult: 1 + idx * 0.09,
  waveCount: 4 + idx,
  spawnGap: Math.max(450, 1300 - idx * 70),
}));

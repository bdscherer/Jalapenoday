import { GAME_HEIGHT, GAME_WIDTH } from './data/config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { LevelScene } from './scenes/LevelScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { ControlsScene } from './scenes/ControlsScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { VictoryScene } from './scenes/VictoryScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 860 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
  scene: [BootScene, TitleScene, LevelSelectScene, ControlsScene, SettingsScene, LevelScene, PauseScene, GameOverScene, VictoryScene],
});

window.__ironViperGame = game;

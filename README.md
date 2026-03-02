# Iron Viper: Black Sun

A complete browser-playable single-player 2D side-scrolling run-and-gun built with Phaser 3 + Arcade Physics.

## Run locally

### Quick start (double-click supported)
Open `index.html` directly in a browser. The runtime now uses a non-module script entry (`src/game.js`) so it does not fail on `file://` due to ES module CORS restrictions.

### Optional local server
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

## Controls

### Gamepad (primary)
- Left stick / D-pad: move + aim
- A / Cross: jump
- X / Square: shoot
- RB / R1: bomb
- Start / Options: pause

### Keyboard fallback
- Arrow keys or WASD: move + aim
- Z: jump
- X: shoot
- C: bomb
- Enter or Esc: pause

## Game features included
- Single-player arcade run-and-gun loop
- 10 stages and 10 bosses with escalating stats/pattern intensity
- Gamepad connect/disconnect support and “press any button/key” title behavior
- Keyboard fallback parity
- Pause menu, controls, settings, game over, victory ending
- HUD: HP, lives, bombs, weapon, score, stage, boss HP
- Checkpoint respawns
- Weapon and utility pickups
- localStorage persistence for settings/high score/unlocks

## Difficulty / tuning notes
Tune core balance in these files:
- `src/data/config.js`
  - `PLAYER_CONFIG`: lives, HP, bombs, movement, i-frames
  - `WEAPONS`: cadence, damage, spread, projectile speed
  - `ENEMY_TYPES`: HP/speed/cadence/projectile speed/telegraph timing
  - `DIFFICULTY_BY_LEVEL`: HP multiplier, fire multiplier, wave count, spawn gap
- `src/data/bosses.js`
  - `baseHp`, `patterns`, and pattern cooldowns

## Known limitations
- Placeholder geometric visuals/audio hooks are used (consistent original style).
- Phaser is loaded from CDN; if offline/no network, load may fail unless you vendor Phaser locally.

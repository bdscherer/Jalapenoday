# Iron Viper: Black Sun

A complete browser-playable single-player 2D side-scrolling run-and-gun built with **Phaser 3 + Arcade Physics**.

## Run locally

Because modules are used, run from a static server (recommended):

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080`

(Direct file double-click may be blocked by module/CORS rules in some browsers.)

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

Tune core balance in data files:

- `src/data/config.js`
  - `PLAYER_CONFIG`: lives, HP, bombs, movement, i-frames
  - `WEAPONS`: per-weapon cadence/damage/spread/projectile speed
  - `ENEMY_TYPES`: HP/speed/cadence/projectile speed/telegraph timing
  - `DIFFICULTY_BY_LEVEL`: per-stage HP multiplier, fire multiplier, wave count/spawn gaps
- `src/data/bosses.js`
  - `baseHp`, `patterns`, `cooldown`, score values

## Known limitations

- Placeholder geometric visuals/audio hooks are used (original and consistent style).
- Bosses use a shared base framework + per-stage pattern configurations rather than bespoke sprites.
- Fullscreen toggle is available in Settings via `F` key.

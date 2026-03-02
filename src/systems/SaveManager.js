const KEY = 'iron-viper-black-sun-save-v1';

const defaultState = {
  highScore: 0,
  unlockedLevel: 1,
  settings: {
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    screenShake: true,
  },
};

export class SaveManager {
  static load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultState);
    try {
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(defaultState),
        ...parsed,
        settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  static save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
}

export class AudioManager {
  constructor(scene, settings) {
    this.scene = scene;
    this.settings = settings;
  }

  setSettings(settings) {
    this.settings = settings;
  }

  sfx(_name, pitch = 0) {
    if (this.settings.masterVolume <= 0 || this.settings.sfxVolume <= 0) return;
    const volume = 0.03 * this.settings.masterVolume * this.settings.sfxVolume;
    const freq = 220 + Math.random() * 220 + pitch;
    this.scene.sound.playAudioSprite?.('sfx', _name);
    this.scene.tweens.addCounter({
      from: freq,
      to: freq * 1.3,
      duration: 40,
      onUpdate: () => {},
      onComplete: () => {},
    });
    if (this.scene.cameras.main) this.scene.cameras.main.flash(20, 255 * volume, 255 * volume, 255 * volume, false);
  }

  music(_track) {}
}

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.text = scene.add.text(16, 14, '', { fontSize: '18px', color: '#ffffff' }).setScrollFactor(0).setDepth(20);
    this.bossBarBg = scene.add.rectangle(480, 30, 420, 14, 0x333333).setScrollFactor(0).setDepth(20).setVisible(false);
    this.bossBar = scene.add.rectangle(270, 30, 410, 10, 0xff5f5f).setOrigin(0, 0.5).setScrollFactor(0).setDepth(21).setVisible(false);
    this.stageCard = scene.add.text(480, 240, '', { fontSize: '32px', color: '#ffe9a2', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(22);
    this.stageCard.setStroke('#000000', 6);
  }

  showStageCard(label) {
    this.stageCard.setText(label).setAlpha(1);
    this.scene.tweens.add({ targets: this.stageCard, alpha: 0, duration: 1600, delay: 700 });
  }

  update(state) {
    this.text.setText(`HP ${state.hp}/${state.maxHp}   Lives ${state.lives}   Bombs ${state.bombs}   Weapon ${state.weapon}   Score ${state.score}   Stage ${state.stage}`);
    if (state.boss) {
      this.bossBarBg.setVisible(true);
      this.bossBar.setVisible(true);
      const ratio = Phaser.Math.Clamp(state.boss.hp / state.boss.max, 0, 1);
      this.bossBar.width = 410 * ratio;
    } else {
      this.bossBarBg.setVisible(false);
      this.bossBar.setVisible(false);
    }
  }
}

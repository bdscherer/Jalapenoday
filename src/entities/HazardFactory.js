export function createHazards(scene, level, worldWidth) {
  const hazards = scene.physics.add.staticGroup();
  const dynamic = scene.physics.add.group({ allowGravity: false, immovable: true });
  const chunk = worldWidth / 5;

  level.hazardSet.forEach((haz, idx) => {
    const x = chunk * (idx + 1) + 120;
    if (haz === 'spike' || haz === 'acid') {
      const zone = scene.add.rectangle(x, scene.groundY - 8, 120, 16, haz === 'spike' ? 0xbb5555 : 0x66d16b);
      scene.physics.add.existing(zone, true);
      hazards.add(zone);
      zone.hazardDamage = haz === 'spike' ? 1 : 2;
    }
    if (haz === 'flame' || haz === 'electric' || haz === 'laser') {
      const zone = scene.add.rectangle(x, scene.groundY - 60, 22, 120, haz === 'flame' ? 0xff9050 : haz === 'electric' ? 0x7ae5ff : 0xff4a9f);
      scene.physics.add.existing(zone);
      zone.body.setAllowGravity(false);
      zone.body.setImmovable(true);
      dynamic.add(zone);
      zone.hazardDamage = haz === 'flame' ? 2 : 1;
      zone.setAlpha(0.2);
      scene.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          zone.activeHazard = !zone.activeHazard;
          zone.setAlpha(zone.activeHazard ? 0.95 : 0.2);
        },
      });
    }
    if (haz === 'moving' || haz === 'collapse') {
      const platform = scene.add.rectangle(x, scene.groundY - 90, 130, 18, 0x858ca6);
      scene.physics.add.existing(platform);
      platform.body.setAllowGravity(false);
      platform.body.setImmovable(true);
      dynamic.add(platform);
      if (haz === 'moving') {
        scene.tweens.add({ targets: platform, y: scene.groundY - 140, yoyo: true, repeat: -1, duration: 1800 });
      } else {
        platform.isCollapsing = true;
      }
    }
    if (haz === 'crusher' || haz === 'debris') {
      const yStart = haz === 'crusher' ? 90 : -100;
      const slam = scene.add.rectangle(x, yStart, 68, 30, 0xa0a0a0);
      scene.physics.add.existing(slam);
      slam.body.setAllowGravity(false);
      slam.body.setImmovable(true);
      dynamic.add(slam);
      slam.hazardDamage = 2;
      scene.tweens.add({ targets: slam, y: scene.groundY - 25, duration: 650, yoyo: true, repeat: -1, hold: 650 });
    }
  });

  return { hazards, dynamic };
}

/**
 * 集中管理 BGM、SFX、瀏覽器自動播放限制與靜音狀態。
 */
export class AudioManager {
  constructor(assets) {
    this.assets = assets;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.unlocked = false;
    this.bgm = assets.bgm;
    this.bgm.loop = true;
    this.bgm.volume = 0.22;
  }

  unlock() {
    if (!this.unlocked) this.unlocked = true;
    if (this.musicEnabled && this.bgm.paused) {
      this.bgm.play().catch(() => {});
    }
  }

  play(name, volume = 0.35) {
    if (!this.unlocked || !this.sfxEnabled || !this.assets[name]) return;
    const sound = this.assets[name].cloneNode();
    sound.volume = volume;
    sound.play().catch(() => {});
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) this.unlock();
    else this.bgm.pause();
    return this.musicEnabled;
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }
}

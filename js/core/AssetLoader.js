/**
 * 圖像與音訊資產預載器。所有必要素材完成後才啟動遊戲。
 */
export class AssetLoader {
  constructor(manifest) {
    this.manifest = manifest;
  }

  async load() {
    const images = {};
    const audio = {};

    await Promise.all([
      ...Object.entries(this.manifest.images).map(async ([key, src]) => {
        images[key] = await this.loadImage(src);
      }),
      ...Object.entries(this.manifest.audio).map(async ([key, src]) => {
        audio[key] = await this.loadAudio(src);
      }),
    ]);

    return { images, audio };
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`圖片載入失敗：${src}`));
      image.src = src;
    });
  }

  loadAudio(src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve(audio);
      };
      audio.preload = 'auto';
      audio.addEventListener('canplaythrough', done, { once: true });
      audio.addEventListener('loadeddata', done, { once: true });
      audio.addEventListener('error', () => reject(new Error(`音訊載入失敗：${src}`)), { once: true });
      audio.src = src;
      audio.load();
      window.setTimeout(done, 2500);
    });
  }
}

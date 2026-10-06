import { Game } from './core/Game.js';
import { AssetLoader } from './core/AssetLoader.js';
import { CONFIG } from './config.js';

/**
 * 遊戲主程式入口
 */
async function init() {
  const loading = document.getElementById('loadingOverlay');
  try {
    const assets = await new AssetLoader(CONFIG.ASSETS).load();
    const game = new Game(assets);
    game.init();
    loading?.classList.add('is-hidden');
    window.__PINBALL_GAME__ = game;
  } catch (error) {
    console.error(error);
    if (loading) {
      loading.classList.add('is-error');
      loading.innerHTML = '<strong>素材載入失敗</strong><span>請重新整理頁面再試一次</span>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

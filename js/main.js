import { Game } from './core/Game.js';

/**
 * 遊戲主程式入口
 */
function init() {
  const game = new Game();
  game.init();
  // 提供全域偵錯或擴充存取
  window.__PINBALL_GAME__ = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

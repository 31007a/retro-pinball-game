/**
 * HUD 與使用者介面管理器（得分、Combo、Overdrive、結算畫面與晃動特效）
 */
export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('score');
    this.highScoreEl = document.getElementById('highScore');
    this.finalScoreEl = document.getElementById('finalScore');
    this.gameOverEl = document.getElementById('gameOver');
    this.restartBtn = document.getElementById('restart');
    this.comboHud = document.getElementById('comboHud');
    this.overdriveHud = document.getElementById('overdriveHud');
    this.boardWrap = document.querySelector('.board-wrap');
    this.musicToggle = document.getElementById('musicToggle');
    this.sfxToggle = document.getElementById('sfxToggle');
  }

  updateScore(score, highScore) {
    if (this.scoreEl) {
      this.scoreEl.textContent = String(score).padStart(4, '0');
    }
    if (this.highScoreEl) {
      this.highScoreEl.textContent = String(highScore).padStart(4, '0');
    }
  }

  updateStatus(combo, overdriveTimer) {
    if (this.comboHud) {
      this.comboHud.hidden = combo <= 0;
      this.comboHud.textContent = `COMBO x${Math.max(1, combo)}`;
    }
    if (this.overdriveHud) {
      this.overdriveHud.hidden = overdriveTimer <= 0;
      this.overdriveHud.textContent = `OVERDRIVE ${Math.max(0, overdriveTimer).toFixed(1)}s`;
    }
  }

  showGameOver(score) {
    if (this.boardWrap) {
      this.boardWrap.classList.remove('game-over-shake');
      void this.boardWrap.offsetWidth;
      this.boardWrap.classList.add('game-over-shake');
    }
    if (this.finalScoreEl) {
      this.finalScoreEl.textContent = String(score);
    }
    if (this.gameOverEl) {
      this.gameOverEl.hidden = false;
    }
    if (this.restartBtn) {
      this.restartBtn.focus();
    }
  }

  hideGameOver() {
    if (this.gameOverEl) {
      this.gameOverEl.hidden = true;
    }
    if (this.boardWrap) {
      this.boardWrap.classList.remove('game-over-shake');
    }
  }

  bindRestart(handler) {
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', handler);
    }
  }

  bindAudioControls({ onMusic, onSfx }) {
    this.musicToggle?.addEventListener('click', () => {
      const enabled = onMusic();
      this.musicToggle.setAttribute('aria-pressed', String(enabled));
      this.musicToggle.textContent = enabled ? '♫ 音樂' : '♫ 靜音';
    });
    this.sfxToggle?.addEventListener('click', () => {
      const enabled = onSfx();
      this.sfxToggle.setAttribute('aria-pressed', String(enabled));
      this.sfxToggle.textContent = enabled ? '✦ 音效' : '✦ 靜音';
    });
  }
}

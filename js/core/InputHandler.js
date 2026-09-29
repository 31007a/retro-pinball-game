/**
 * 輸入管理器（鍵盤、觸控指標與視窗失焦防禦）
 */
export class InputHandler {
  constructor({ onUserAction, onSpacePress }) {
    this.keys = { left: false, right: false };
    this.onUserAction = onUserAction;
    this.onSpacePress = onSpacePress;

    this.leftButton = document.getElementById('leftButton');
    this.rightButton = document.getElementById('rightButton');

    this.initKeyboard();
    this.initTouch();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => this.setKey(e, true));
    window.addEventListener('keyup', (e) => this.setKey(e, false));
    window.addEventListener('blur', () => this.resetKeys());
  }

  setKey(event, down) {
    if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(event.code)) {
      event.preventDefault();
    }

    if (down && this.onUserAction) {
      this.onUserAction();
    }

    if (event.code === 'Space') {
      if (down && this.onSpacePress) {
        this.onSpacePress();
      }
      return;
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.keys.left = down;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.keys.right = down;
    }
  }

  initTouch() {
    if (this.leftButton) this.bindTouchButton(this.leftButton, 'left');
    if (this.rightButton) this.bindTouchButton(this.rightButton, 'right');
  }

  bindTouchButton(button, side) {
    const release = (event) => {
      event.preventDefault();
      this.keys[side] = false;
      button.classList.remove('is-pressed');
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (this.onUserAction) this.onUserAction();
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // 某些瀏覽器環境或未啟動 pointer 捕獲時略過
      }
      this.keys[side] = true;
      button.classList.add('is-pressed');
    });

    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', () => {
      this.keys[side] = false;
      button.classList.remove('is-pressed');
    });
  }

  resetKeys() {
    this.keys.left = false;
    this.keys.right = false;
    if (this.leftButton) this.leftButton.classList.remove('is-pressed');
    if (this.rightButton) this.rightButton.classList.remove('is-pressed');
  }

  isLeftPressed() {
    return this.keys.left;
  }

  isRightPressed() {
    return this.keys.right;
  }
}

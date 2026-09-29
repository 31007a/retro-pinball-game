/**
 * 遊戲主迴圈（RAF、Delta 時間更新與畫面渲染驅動）
 */
export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.animationId = null;
    this.previousTime = 0;
    this.running = false;
  }

  start() {
    this.stop();
    this.running = true;
    this.previousTime = performance.now();

    const loop = (now) => {
      if (!this.running) return;
      const frameTime = Math.min((now - this.previousTime) / 1000, 0.025);
      this.previousTime = now;

      this.updateFn(frameTime);
      this.renderFn();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  isRunning() {
    return this.running;
  }
}

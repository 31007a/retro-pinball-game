import { CONFIG } from '../config.js';

/**
 * 8 格水平 Sprite Sheet：0-3 Idle、4-7 Attack。
 */
export class Mascot {
  constructor(image) {
    this.image = image;
    this.state = 'idle';
    this.frameIndex = 0;
    this.elapsed = 0;
    this.facing = 1;
  }

  attack(side) {
    this.state = 'attack';
    this.frameIndex = 0;
    this.elapsed = 0;
    this.facing = side === 'left' ? -1 : 1;
  }

  update(dt) {
    const frames = this.state === 'attack' ? CONFIG.MASCOT.ATTACK_FRAMES : CONFIG.MASCOT.IDLE_FRAMES;
    const fps = this.state === 'attack' ? CONFIG.MASCOT.ATTACK_FPS : CONFIG.MASCOT.IDLE_FPS;
    this.elapsed += dt;
    this.frameIndex = Math.floor(this.elapsed * fps);
    if (this.state === 'attack' && this.frameIndex >= frames.length) {
      this.state = 'idle';
      this.frameIndex = 0;
      this.elapsed = 0;
    }
  }

  draw(ctx) {
    if (!this.image) return;
    const frames = this.state === 'attack' ? CONFIG.MASCOT.ATTACK_FRAMES : CONFIG.MASCOT.IDLE_FRAMES;
    const frame = frames[this.frameIndex % frames.length];
    const sw = this.image.naturalWidth / CONFIG.MASCOT.FRAME_COUNT;
    const sh = this.image.naturalHeight;
    const { X, Y, WIDTH, HEIGHT } = CONFIG.MASCOT;

    ctx.save();
    ctx.globalAlpha = .92;
    ctx.translate(X, Y);
    ctx.scale(this.facing, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.image, frame * sw, 0, sw, sh, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
    ctx.restore();
  }
}

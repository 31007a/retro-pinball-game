import { Entity } from './Entity.js';

/**
 * 玩家控制核心實體（彈珠 Ball）
 */
export class Player extends Entity {
  constructor(config = {}, image = null) {
    super(config.x || 0, config.y || 0);
    this.vx = config.vx || 0;
    this.vy = config.vy || 0;
    this.r = config.r || 11;
    this.image = image;
  }

  reset(config) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx;
    this.vy = config.vy;
    this.r = config.r;
  }

  update(dt, gravity = 0) {
    this.vy += gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    if (this.image) {
      const size = this.r * 2.65;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.shadowColor = '#5cf7ff';
      ctx.shadowBlur = 9;
      ctx.drawImage(this.image, this.x - size / 2, this.y - size / 2, size, size);
      ctx.restore();
      return;
    }
    const g = ctx.createRadialGradient(this.x - 4, this.y - 5, 2, this.x, this.y, this.r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#cfe3f8');
    g.addColorStop(1, '#607a99');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export { Player as Ball };

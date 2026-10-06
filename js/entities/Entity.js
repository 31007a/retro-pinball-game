/**
 * 實體基類與場景靜態/運動物件
 */
export class Entity {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  update(dt) {}
  draw(ctx) {}
}

export class Bumper extends Entity {
  constructor(x, y, r, value = 100, image = null) {
    super(x, y);
    this.r = r;
    this.value = value;
    this.hit = 0;
    this.image = image;
  }

  reset() {
    this.hit = 0;
  }

  update(dt) {
    this.hit = Math.max(0, this.hit - dt * 4);
  }

  draw(ctx) {
    const pulse = this.hit * 7;
    if (this.image) {
      const size = (this.r + pulse * .18) * 2.2;
      ctx.save();
      ctx.shadowColor = this.hit ? '#ffffff' : '#42f5ff';
      ctx.shadowBlur = 12 + pulse;
      ctx.drawImage(this.image, this.x - size / 2, this.y - size / 2, size, size);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.shadowColor = this.hit ? '#ffffff' : '#ffd166';
    ctx.shadowBlur = 12 + pulse;
    ctx.fillStyle = this.hit ? '#fff3bd' : '#ffd166';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r + pulse * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#9b6517';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff1b2';
    ctx.font = '700 14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(this.value), this.x, this.y + 1);
    ctx.restore();
  }
}

export class Post extends Entity {
  constructor(x, y, r) {
    super(x, y);
    this.r = r;
  }

  draw(ctx) {
    ctx.fillStyle = '#ff6178';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9baa';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

export class Flipper extends Entity {
  constructor(config, image = null) {
    super(config.pivotX, config.pivotY);
    this.pivotX = config.pivotX;
    this.pivotY = config.pivotY;
    this.length = config.length;
    this.radius = config.radius;
    this.rest = config.rest;
    this.active = config.active;
    this.angle = config.rest;
    this.speedFactor = config.speedFactor || 22;
    this.isRight = Boolean(config.isRight);
    this.image = image;
  }

  reset() {
    this.angle = this.rest;
  }

  update(dt, isPressed) {
    const target = isPressed ? this.active : this.rest;
    this.angle += (target - this.angle) * Math.min(1, dt * this.speedFactor);
  }

  getTip() {
    return {
      x: this.pivotX + Math.cos(this.angle) * this.length,
      y: this.pivotY + Math.sin(this.angle) * this.length,
    };
  }

  draw(ctx) {
    const tip = this.getTip();
    if (this.image) {
      const visualHeight = this.radius * 2 + 12;
      ctx.save();
      ctx.translate(this.pivotX, this.pivotY);
      ctx.rotate(this.angle);
      ctx.imageSmoothingEnabled = true;
      ctx.shadowColor = '#27deed';
      ctx.shadowBlur = 8;
      ctx.drawImage(this.image, -visualHeight * .45, -visualHeight / 2, this.length + visualHeight * .65, visualHeight);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.strokeStyle = '#57e6db';
    ctx.lineWidth = this.radius * 2;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#1e9f99';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(this.pivotX, this.pivotY);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.restore();
  }
}

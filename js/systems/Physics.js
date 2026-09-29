import { CONFIG } from '../config.js';

/**
 * 彈珠台物理引擎與碰撞系統
 */
export class Physics {
  /**
   * 圓形物體碰撞檢測與反彈（Bumpers、Posts）
   */
  static circleCollision(ball, target, boost = 1.0, givesScore = false, onHit = null) {
    const dx = ball.x - target.x;
    const dy = ball.y - target.y;
    const minDist = ball.r + target.r;
    const distSq = dx * dx + dy * dy;
    if (distSq >= minDist * minDist) return false;

    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = target.x + nx * minDist;
    ball.y = target.y + ny * minDist;

    const toward = ball.vx * nx + ball.vy * ny;
    if (toward < 0) {
      ball.vx -= (1 + boost) * toward * nx;
      ball.vy -= (1 + boost) * toward * ny;
    }

    if (givesScore && target.hit <= 0) {
      if (onHit) onHit(target);
    }
    return true;
  }

  /**
   * 線段膠囊體碰撞檢測（牆面邊界、導軌、擋板）
   */
  static segmentCollision(ball, x1, y1, x2, y2, radius, bounce) {
    const sx = x2 - x1;
    const sy = y2 - y1;
    const lenSq = sx * sx + sy * sy;
    const t = Math.max(0, Math.min(1, ((ball.x - x1) * sx + (ball.y - y1) * sy) / lenSq));
    const px = x1 + sx * t;
    const py = y1 + sy * t;
    const dx = ball.x - px;
    const dy = ball.y - py;
    const minDist = ball.r + radius;
    const distSq = dx * dx + dy * dy;
    if (distSq >= minDist * minDist) return false;

    const dist = Math.sqrt(distSq) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    ball.x = px + nx * minDist;
    ball.y = py + ny * minDist;

    const toward = ball.vx * nx + ball.vy * ny;
    if (toward < 0) {
      ball.vx -= (1 + bounce) * toward * nx;
      ball.vy -= (1 + bounce) * toward * ny;
    }
    return true;
  }

  /**
   * 外牆與引導斜面碰撞
   */
  static wallCollisions(ball, width, height) {
    const left = CONFIG.PHYSICS.WALL_PADDING;
    const right = width - CONFIG.PHYSICS.WALL_PADDING;
    const top = CONFIG.PHYSICS.WALL_PADDING;
    const bounce = CONFIG.PHYSICS.WALL_BOUNCE;

    if (ball.x - ball.r < left) {
      ball.x = left + ball.r;
      ball.vx = Math.abs(ball.vx) * bounce;
    } else if (ball.x + ball.r > right) {
      ball.x = right - ball.r;
      ball.vx = -Math.abs(ball.vx) * bounce;
    }

    if (ball.y - ball.r < top) {
      ball.y = top + ball.r;
      ball.vy = Math.abs(ball.vy) * bounce;
    }

    // 引導球進入擋板區的斜坡導軌
    for (const guide of CONFIG.DRAIN_GUIDES) {
      this.segmentCollision(ball, guide.x1, guide.y1, guide.x2, guide.y2, guide.radius, guide.bounce);
    }
  }

  /**
   * 擋板碰撞與擊球衝量
   */
  static flipperCollision(ball, flipper, pressed, isRight, isOverdrive) {
    const tip = flipper.getTip ? flipper.getTip() : {
      x: flipper.pivotX + Math.cos(flipper.angle) * flipper.length,
      y: flipper.pivotY + Math.sin(flipper.angle) * flipper.length,
    };

    if (!this.segmentCollision(ball, flipper.pivotX, flipper.pivotY, tip.x, tip.y, flipper.radius, 0.88)) {
      return false;
    }

    if (pressed) {
      const kickStrength = isOverdrive ? 468 : 390;
      ball.vy -= kickStrength;
      ball.vx += isRight ? -105 : 105;
    }
    return true;
  }

  /**
   * 球速上限鉗制
   */
  static clampSpeed(ball, isOverdrive) {
    const speed = Math.hypot(ball.vx, ball.vy);
    const maxSpeed = isOverdrive ? CONFIG.PHYSICS.OVERDRIVE_MAX_BALL_SPEED : CONFIG.PHYSICS.BASE_MAX_BALL_SPEED;
    if (speed > maxSpeed) {
      ball.vx = (ball.vx / speed) * maxSpeed;
      ball.vy = (ball.vy / speed) * maxSpeed;
    }
  }
}

import { CONFIG } from '../config.js';

/**
 * 粒子系統：撞擊特效、爆破與飄散重力運算
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  spawn(x, y) {
    const { COUNT, COLORS, MIN_SPEED, MAX_SPEED_ADD, MIN_SIZE, MAX_SIZE_ADD, LIFE, MAX_PARTICLES } = CONFIG.PARTICLES;
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = MIN_SPEED + Math.random() * MAX_SPEED_ADD;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: MIN_SIZE + Math.random() * MAX_SIZE_ADD,
        life: LIFE,
        maxLife: LIFE,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        square: Math.random() > 0.5,
      });
    }

    if (this.particles.length > MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES);
    }
  }

  update(dt) {
    const gravity = CONFIG.PARTICLES.GRAVITY;
    for (const particle of this.particles) {
      particle.vy += gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  draw(ctx) {
    for (const particle of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
      ctx.fillStyle = particle.color;
      if (particle.square) {
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

import { CONFIG } from '../config.js';
import { GameLoop } from './GameLoop.js';
import { InputHandler } from './InputHandler.js';
import { HUD } from '../ui/HUD.js';
import { Player } from '../entities/Player.js';
import { Bumper, Post, Flipper } from '../entities/Entity.js';
import { Physics } from '../systems/Physics.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';

/**
 * 彈珠台主遊戲控制類別
 */
export class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.score = 0;
    this.highScore = this.loadHighScore();
    this.playing = false;

    this.combo = 0;
    this.comboTimer = 0;
    this.overdriveTimer = 0;

    this.shakeTime = 0;
    this.shakeMagnitude = 0;

    this.audioContext = null;

    // 實體初始化
    this.player = new Player(CONFIG.BALL_INIT);
    this.bumpers = CONFIG.BUMPERS.map(b => new Bumper(b.x, b.y, b.r, b.value));
    this.posts = CONFIG.POSTS.map(p => new Post(p.x, p.y, p.r));
    this.leftFlipper = new Flipper(CONFIG.FLIPPERS.left);
    this.rightFlipper = new Flipper(CONFIG.FLIPPERS.right);

    // 系統與介面初始化
    this.particles = new ParticleSystem();
    this.hud = new HUD();

    this.input = new InputHandler({
      onUserAction: () => this.ensureAudio(),
      onSpacePress: () => {
        if (!this.playing) this.resetGame();
      },
    });

    this.hud.bindRestart(() => {
      this.ensureAudio();
      this.resetGame();
    });

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.draw()
    );
  }

  init() {
    this.resetGame();
  }

  loadHighScore() {
    try {
      return Number(localStorage.getItem(CONFIG.GAMEPLAY.STORAGE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  saveHighScore() {
    try {
      localStorage.setItem(CONFIG.GAMEPLAY.STORAGE_KEY, String(this.highScore));
    } catch {
      // 容錯機制
    }
  }

  ensureAudio() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.audioContext = new AudioContextClass();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playHitSound(multiplier) {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(CONFIG.AUDIO.HIT_BASE_FREQ + multiplier * CONFIG.AUDIO.HIT_MULT_FREQ, now);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    oscillator.connect(gain).connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.08);
  }

  playGameOverSound() {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(CONFIG.AUDIO.GAME_OVER_START_FREQ, now);
    oscillator.frequency.exponentialRampToValueAtTime(CONFIG.AUDIO.GAME_OVER_END_FREQ, now + 0.35);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    oscillator.connect(gain).connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  triggerShake(magnitude, duration) {
    this.shakeMagnitude = Math.max(this.shakeMagnitude, magnitude);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  activateOverdrive() {
    this.overdriveTimer = CONFIG.GAMEPLAY.OVERDRIVE_DURATION;
    this.combo = CONFIG.GAMEPLAY.OVERDRIVE_COMBO_TRIGGER;
    this.comboTimer = 0;
    this.hud.updateStatus(this.combo, this.overdriveTimer);
  }

  registerTargetHit(target) {
    if (this.overdriveTimer > 0) {
      this.combo = CONFIG.GAMEPLAY.OVERDRIVE_COMBO_TRIGGER;
    } else {
      this.combo = this.comboTimer > 0 ? Math.min(CONFIG.GAMEPLAY.OVERDRIVE_COMBO_TRIGGER, this.combo + 1) : 1;
      this.comboTimer = CONFIG.GAMEPLAY.COMBO_WINDOW;
      if (this.combo === CONFIG.GAMEPLAY.OVERDRIVE_COMBO_TRIGGER) {
        this.activateOverdrive();
      }
    }

    const multiplier = this.overdriveTimer > 0 ? 5 : this.combo;
    this.score += target.value * multiplier;
    target.hit = 1;
    this.particles.spawn(target.x, target.y);
    this.triggerShake(6, 0.12);
    this.playHitSound(multiplier);
    this.hud.updateScore(this.score, this.highScore);
    this.hud.updateStatus(this.combo, this.overdriveTimer);
  }

  resetGame() {
    this.loop.stop();
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.overdriveTimer = 0;
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.particles.reset();

    this.player.reset(CONFIG.BALL_INIT);
    this.bumpers.forEach(b => b.reset());
    this.leftFlipper.reset();
    this.rightFlipper.reset();
    this.input.resetKeys();

    this.hud.updateScore(this.score, this.highScore);
    this.hud.updateStatus(this.combo, this.overdriveTimer);
    this.hud.hideGameOver();

    this.playing = true;
    this.loop.start();
  }

  endGame() {
    this.playing = false;
    this.loop.stop();
    this.playGameOverSound();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.hud.updateScore(this.score, this.highScore);
    }

    this.hud.showGameOver(this.score);
  }

  update(dt) {
    if (!this.playing) return;

    // Overdrive 與 Combo 倒數計時
    if (this.overdriveTimer > 0) {
      this.overdriveTimer = Math.max(0, this.overdriveTimer - dt);
      if (this.overdriveTimer === 0) {
        this.combo = 0;
        this.comboTimer = 0;
      }
      this.hud.updateStatus(this.combo, this.overdriveTimer);
    } else if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) {
        this.combo = 0;
      }
      this.hud.updateStatus(this.combo, this.overdriveTimer);
    }

    // 粒子系統更新
    this.particles.update(dt);

    // 晃動倒數
    this.shakeTime = Math.max(0, this.shakeTime - dt);
    if (this.shakeTime === 0) this.shakeMagnitude = 0;

    // 擋板動態角度內插
    this.leftFlipper.update(dt, this.input.isLeftPressed());
    this.rightFlipper.update(dt, this.input.isRightPressed());

    // 次步驟物理模擬以防高速穿模
    const steps = CONFIG.PHYSICS.SUB_STEPS;
    const subDt = dt / steps;
    const isOverdrive = this.overdriveTimer > 0;

    for (let i = 0; i < steps; i++) {
      if (!this.playing) break;

      this.player.update(subDt, CONFIG.PHYSICS.GRAVITY);
      Physics.wallCollisions(this.player, this.width, this.height);

      this.bumpers.forEach(b => {
        Physics.circleCollision(this.player, b, 1.09, true, (target) => this.registerTargetHit(target));
      });

      this.posts.forEach(p => {
        Physics.circleCollision(this.player, p, 0.94, false);
      });

      Physics.flipperCollision(this.player, this.leftFlipper, this.input.isLeftPressed(), false, isOverdrive);
      Physics.flipperCollision(this.player, this.rightFlipper, this.input.isRightPressed(), true, isOverdrive);

      Physics.clampSpeed(this.player, isOverdrive);

      if (this.player.y - this.player.r > this.height) {
        this.endGame();
        return;
      }
    }

    // Bumper 受擊發光冷卻
    this.bumpers.forEach(b => b.update(dt));
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.save();

    // 畫面晃動效果
    if (this.shakeTime > 0) {
      const sx = (Math.random() * 2 - 1) * this.shakeMagnitude;
      const sy = (Math.random() * 2 - 1) * this.shakeMagnitude;
      this.ctx.translate(sx, sy);
    }

    this.drawBoard();
    this.bumpers.forEach(b => b.draw(this.ctx));
    this.posts.forEach(p => p.draw(this.ctx));
    this.leftFlipper.draw(this.ctx);
    this.rightFlipper.draw(this.ctx);
    this.player.draw(this.ctx);
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }

  drawBoard() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#14243a');
    gradient.addColorStop(1, '#0a1220');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = '#2c4665';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(28, 28, this.width - 56, this.height - 38, 24);
    this.ctx.stroke();

    this.ctx.strokeStyle = '#57e6db';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(28, 565);
    this.ctx.lineTo(92, 650);
    this.ctx.moveTo(this.width - 28, 565);
    this.ctx.lineTo(this.width - 92, 650);
    this.ctx.stroke();

    this.ctx.fillStyle = '#152a40';
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, 88, 28, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = '#405b7a';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (this.overdriveTimer > 0) {
      const hue = (performance.now() / 4) % 360;
      this.ctx.save();
      this.ctx.strokeStyle = `hsl(${hue} 100% 65%)`;
      this.ctx.shadowColor = `hsl(${(hue + 80) % 360} 100% 65%)`;
      this.ctx.shadowBlur = 22;
      this.ctx.lineWidth = 7;
      this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
      this.ctx.restore();
    }
  }
}

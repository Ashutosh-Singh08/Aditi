const canvas = document.getElementById("catCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

const cats = [];
const sparks = [];

const TOTAL_CATS = 45;
const TOTAL_SPARKS = 80;
const DURATION = 9000;

const catOpenImg = new Image();
const catCloseImg = new Image();
const catSound = document.getElementById("catSound");

window.addEventListener("DOMContentLoaded", () => {
  catSound.volume = 0.6;
  catSound.play().catch((err) => {
    console.log("Sound blocked:", err);
  });
});
catOpenImg.src = "./mopen.png";
catCloseImg.src = "./mclose.png";

let openReady = false;
let closeReady = false;

catOpenImg.onload = () => {
  openReady = true;
};

catCloseImg.onload = () => {
  closeReady = true;
};

let startTime = performance.now();

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

class Cat {
  constructor() {
    this.targetX = rand(40, W - 140);
    this.targetY = rand(40, H - 160);

    this.startX = W / 2 + rand(-100, 100);
    this.startY = H + rand(80, 300);

    this.x = this.startX;
    this.y = this.startY;

    this.size = rand(70, 180);

    this.delay = rand(0, 3200);
    this.bloomDuration = rand(900, 1600);

    this.progress = 0;
    this.alpha = 0;

    this.phase = rand(0, Math.PI * 2);
    this.rotation = rand(-0.25, 0.25);
    this.floatAmount = rand(8, 26);

    this.mouthSpeed = rand(180, 360);
  }

  update(t) {
    const local = clamp((t - this.delay) / this.bloomDuration, 0, 1);
    const p = easeOutBack(local);

    this.progress = local;
    this.alpha = easeOutCubic(local);

    this.x = this.startX + (this.targetX - this.startX) * p;
    this.y = this.startY + (this.targetY - this.startY) * p;

    this.floatY = Math.sin(t * 0.002 + this.phase) * this.floatAmount;
    this.floatX = Math.cos(t * 0.0015 + this.phase) * 4;
  }

  draw(t) {
    if (!openReady || !closeReady) return;
    if (this.progress <= 0.01) return;

    const img = Math.floor(t / this.mouthSpeed) % 2 === 0
      ? catCloseImg
      : catOpenImg;

    const scale = 0.2 + this.alpha * 0.8;
    const w = this.size * scale;
    const h = w * (img.height / img.width);

    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x + this.floatX, this.y + this.floatY);
    ctx.rotate(this.rotation * this.alpha);

    ctx.shadowColor = "rgba(255, 200, 120, 0.8)";
    ctx.shadowBlur = 18;

    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();
  }
}

class Spark {
  constructor() {
    this.reset(true);
  }

  reset(randomY = false) {
    this.x = rand(0, W);
    this.y = randomY ? rand(0, H) : rand(-80, -10);
    this.size = rand(1.5, 5);
    this.speedY = rand(0.15, 0.9);
    this.speedX = rand(-0.4, 0.4);
    this.phase = rand(0, Math.PI * 2);
    this.alpha = rand(0.2, 0.9);
  }

  update(t) {
    this.x += this.speedX + Math.sin(t * 0.001 + this.phase) * 0.3;
    this.y += this.speedY;

    this.alpha = 0.25 + Math.abs(Math.sin(t * 0.003 + this.phase)) * 0.75;

    if (this.y > H + 40) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = "rgba(255, 245, 180, 0.95)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(this.x - this.size, this.y);
    ctx.lineTo(this.x + this.size, this.y);
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x, this.y + this.size);
    ctx.stroke();

    ctx.restore();
  }
}

function initScene() {
  cats.length = 0;
  sparks.length = 0;

  startTime = performance.now();

  for (let i = 0; i < TOTAL_CATS; i++) {
    cats.push(new Cat());
  }

  for (let i = 0; i < TOTAL_SPARKS; i++) {
    sparks.push(new Spark());
  }
}

function drawGlow() {
  const glow = ctx.createRadialGradient(
    W / 2,
    H / 2,
    20,
    W / 2,
    H / 2,
    W * 0.75
  );

  glow.addColorStop(0, "rgba(255, 190, 120, 0.10)");
  glow.addColorStop(0.55, "rgba(255, 120, 200, 0.06)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function animate(now) {
  const t = now - startTime;

  ctx.clearRect(0, 0, W, H);

  drawGlow();

  for (const spark of sparks) {
    spark.update(t);
    spark.draw();
  }

  for (const cat of cats) {
    cat.update(t);
    cat.draw(t);
  }

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;

  initScene();
});

initScene();
requestAnimationFrame(animate);

setTimeout(() => {
  window.close();
}, DURATION);
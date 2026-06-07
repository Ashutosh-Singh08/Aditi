const canvas = document.getElementById("flowerCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

const flowers = [];
const petals = [];
const sparks = [];

const TOTAL_FLOWERS = 450;
const TOTAL_PETALS = 35;
const TOTAL_SPARKS = 15;
const DURATION = 20000;

const characterImg = new Image();
characterImg.src = "./character.png";

let hasCharacter = false;
characterImg.onload = () => {
  hasCharacter = true;
};

let startTime = performance.now();

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  initScene();
});

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function getSlopeY(x) {
  return H * 0.78 - (x / W) * H * 0.34;
}

function getGroundPoint(depth) {
  const maxSpread = W * (0.25 + depth * 1.45);

  const centerX = W * 0.55;
  let x = centerX + rand(-maxSpread / 2, maxSpread / 2);

  x = clamp(x, -80, W + 80);

  const slopeY = getSlopeY(x);

  const groundHeight = H - slopeY;
  const y = slopeY + Math.pow(depth, 1.35) * groundHeight;

  return { x, y };
}

class Flower {
  constructor() {
    this.depth = Math.pow(Math.random(), 0.42);

    const p = getGroundPoint(this.depth);

    this.targetX = p.x;
    this.targetY = p.y;

    this.startX = W * 0.34 + rand(-140, 140);
    this.startY = H + rand(50, 260);

    this.x = this.startX;
    this.y = this.startY;

    this.size = rand(5, 18) + this.depth * rand(18, 42);

    if (this.depth > 0.82) {
      this.size *= rand(1.25, 1.9);
    }

    this.delay = (1 - this.depth) * 700 + this.depth * 2800 + rand(0, 1200);

    this.progress = 0;
    this.alpha = 0;
    this.phase = rand(0, Math.PI * 2);
    this.rotation = rand(-0.35, 0.35);
    this.blur = 0;
    this.glow = rand(0.2, 1);
  }

  update(t) {
    const local = clamp((t - this.delay) / 1700, 0, 1);
    const p = easeOutCubic(local);

    this.progress = p;
    this.alpha = p;

    this.x = this.startX + (this.targetX - this.startX) * p;
    this.y = this.startY + (this.targetY - this.startY) * p;

    this.sway = Math.sin(t * 0.0016 + this.phase) * (0.8 + this.depth * 3);
  }

  drawStem(s) {
    if (this.depth < 0.22) return;

    ctx.strokeStyle = `rgba(38, 115, 70, ${0.45 * this.alpha})`;
    ctx.lineWidth = Math.max(1, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(0, s * 0.15);
    ctx.quadraticCurveTo(
      Math.sin(this.phase) * s * 0.2,
      s * 0.6,
      0,
      s * 1.15
    );
    ctx.stroke();
  }

  drawFlowerHead(s) {
    for (let i = 0; i < 5; i++) {
      ctx.save();

      const angle = (Math.PI * 2 * i) / 5 + this.rotation;
      ctx.rotate(angle);

      const gradient = ctx.createRadialGradient(
        0,
        -s * 0.55,
        1,
        0,
        -s * 0.55,
        s * 1.2
      );

      gradient.addColorStop(0, "rgba(255,255,255,0.98)");
      gradient.addColorStop(0.38, "rgba(190,225,255,0.94)");
      gradient.addColorStop(0.72, "rgba(105,165,255,0.72)");
      gradient.addColorStop(1, "rgba(40,95,255,0.2)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(
        0,
        -s * 0.58,
        s * 0.34,
        s * 0.82,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    ctx.fillStyle = `rgba(245,252,255,${0.95 * this.alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.13, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(70,110,180,${0.35 * this.alpha})`;
    ctx.lineWidth = Math.max(0.5, s * 0.025);

    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 2 * i) / 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * s * 0.38, Math.sin(a) * s * 0.38);
      ctx.stroke();
    }
  }

  draw() {
    if (this.progress <= 0.01) return;

    const s = this.size * (0.22 + this.progress * 0.78);

    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x + this.sway, this.y);
    ctx.rotate(this.rotation);

    // if (this.blur > 0) {
    //   ctx.filter = `blur(${this.blur}px)`;
    // }

    this.drawStem(s);
    this.drawFlowerHead(s);

    ctx.restore();

    if (this.depth > 0.55 && this.glow > 0.75) {
      ctx.save();
      ctx.globalAlpha = 0.12 * this.alpha;
      ctx.fillStyle = "rgba(140,190,255,0.9)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, s * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(randomY = false) {
    this.x = rand(-120, W + 120);
    this.y = randomY ? rand(0, H * 0.7) : rand(-180, -40);
    this.size = rand(7, 24);
    this.speedX = rand(0.25, 1.6);
    this.speedY = rand(0.15, 0.85);
    this.alpha = rand(0.35, 0.88);
    this.rotation = rand(0, Math.PI * 2);
    this.rotationSpeed = rand(-0.025, 0.025);
    this.wave = rand(0, Math.PI * 2);
  }

  update(t) {
    this.x += this.speedX + Math.sin(t * 0.0012 + this.wave) * 0.65;
    this.y += this.speedY + Math.cos(t * 0.001 + this.wave) * 0.15;
    this.rotation += this.rotationSpeed;

    if (this.x > W + 150 || this.y > H + 100) {
      this.reset(false);
      this.x = rand(-160, -40);
    }
  }

  draw() {
    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, this.size);
    g.addColorStop(0, "rgba(250,252,255,0.95)");
    g.addColorStop(0.55, "rgba(145,190,255,0.75)");
    g.addColorStop(1, "rgba(70,110,255,0.25)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size * 0.42, this.size, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Spark {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = rand(W * 0.18, W * 0.75);
    this.y = rand(H * 0.08, H * 0.55);
    this.size = rand(1.2, 3.8);
    this.alpha = rand(0.25, 0.9);
    this.phase = rand(0, Math.PI * 2);
  }

  update(t) {
    this.alpha = 0.25 + Math.abs(Math.sin(t * 0.002 + this.phase)) * 0.65;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = "rgba(240,248,255,0.9)";
    ctx.lineWidth = 1;

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
  flowers.length = 0;
  petals.length = 0;
  sparks.length = 0;

  startTime = performance.now();

  for (let i = 0; i < TOTAL_FLOWERS; i++) {
    flowers.push(new Flower());
  }

  for (let i = 0; i < TOTAL_PETALS; i++) {
    petals.push(new Petal());
  }

  for (let i = 0; i < TOTAL_SPARKS; i++) {
    sparks.push(new Spark());
  }
  flowers.sort((a, b) => a.targetY - b.targetY);
}

function drawSkyTint() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "rgba(65,140,255,0.18)");
  sky.addColorStop(0.42, "rgba(120,185,255,0.08)");
  sky.addColorStop(1, "rgba(45,95,255,0)");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
}

function drawSlopeMist() {
  const horizonLeft = getSlopeY(0);
  const horizonRight = getSlopeY(W);

  ctx.save();

  const mist = ctx.createLinearGradient(0, horizonRight, 0, H);
  mist.addColorStop(0, "rgba(185,225,255,0.06)");
  mist.addColorStop(0.45, "rgba(95,160,255,0.14)");
  mist.addColorStop(1, "rgba(40,95,255,0.22)");

  ctx.fillStyle = mist;
  ctx.beginPath();
  ctx.moveTo(0, horizonLeft);
  ctx.lineTo(W, horizonRight);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawCharacter(t) {
  if (!hasCharacter) return;

  const floatY = Math.sin(t * 0.002) * 10;
  const breathe = 1 + Math.sin(t * 0.003) * 0.015;

  const charHeight = H * 0.34 * breathe;
  const charWidth = charHeight * 0.60;

  const x = W * 0.31 - charWidth / 2;
  const y = H * 0.3 + floatY;

  ctx.save();

  ctx.globalAlpha = 0.98;

  ctx.shadowColor = "rgba(150,200,255,0.45)";
  ctx.shadowBlur = 18;

  ctx.drawImage(characterImg, x, y, charWidth, charHeight);

  ctx.restore();

  // drawMagicCircle(W * 0.7, y + charHeight * 0.7, t);
}

// function drawMagicCircle(x, y, t) {
//   ctx.save();

//   const r = 35 + Math.sin(t * 0.003) * 3;

//   ctx.globalAlpha = 0.55;
//   ctx.strokeStyle = "rgba(180,220,255,0.8)";
//   ctx.lineWidth = 2;

//   ctx.beginPath();
//   ctx.arc(x, y, r, 0, Math.PI * 2);
//   ctx.stroke();

//   ctx.beginPath();
//   ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
//   ctx.stroke();

//   for (let i = 0; i < 8; i++) {
//     const a = (Math.PI * 2 * i) / 8 + t * 0.001;
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
//     ctx.stroke();
//   }

//   ctx.restore();
// }

function animate(now) {
  const t = now - startTime;

  ctx.clearRect(0, 0, W, H);

  drawSkyTint();
  // drawSlopeMist();


  for (const flower of flowers) {
    flower.update(t);
    flower.draw();
  }

  for (const spark of sparks) {
    spark.update(t);
    spark.draw();
  }

  drawCharacter(t);

  for (const petal of petals) {
    petal.update(t);
    petal.draw();
  }

  requestAnimationFrame(animate);
}

initScene();
requestAnimationFrame(animate);

setTimeout(() => {
  window.close();
}, DURATION);
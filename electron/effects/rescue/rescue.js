const canvas = document.getElementById("rescueCanvas");
const ctx = canvas.getContext("2d");
const music = document.getElementById("bgMusic");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;

const CONFIG = {
  duration: 10000,

  webX: 0.3,

  heroX: 0.265,
  heroY: 0.145,
  heroW: 0.5,
  heroH: 0.55,

  girlX: 0.26,
  girlY: 0.4,
  girlW: 0.5,
  girlH: 0.55,

  faceX: 0.48,
  faceY: -0.1,
  faceW: 0.72,
  faceH: 1.2,
};

const lyrics = [
  { time: 1.0, parts: [
    { text: "I can't,", color: "#f5f1f3" },
    { text: " move on", color: "#1ed828" }
  ] },
  {
  time: 3.0,
  parts: [
    { text: "Baby doll,", color: "#d01b76" },
    { text: " Waitin' on calls", color: "#FFFFFF" }
  ]
},
  { time: 6.0,parts: [
    { text: "flipping through ,", color: "#f4f4f4" },
    { text: " stations", color: "#2b22e2" }
  ] },
  { time: 7.0,parts: [
    { text: "I am ,", color: "#f9f6f8" },
    { text: " Outclassed", color: "#dcea1c" }
  ] },
  { time: 8.0, parts: [
    { text: "And its", color: "#f7f5f6" },
    { text: " Outrageous ", color: "#ed0e0e" }
  ] },
];

let startTime = performance.now();

const buildings = [];
const particles = [];

const faceImg = new Image();
faceImg.src = "./face.png";

const heroImg = new Image();
heroImg.src = "./hero.png";

const girlImg = new Image();
girlImg.src = "./girl.png";

let faceLoaded = false;
let heroLoaded = false;
let girlLoaded = false;

faceImg.onload = () => {
  faceLoaded = true;
  console.log("face loaded");
};

heroImg.onload = () => {
  heroLoaded = true;
  console.log("hero loaded");
};

girlImg.onload = () => {
  girlLoaded = true;
  console.log("girl loaded");
};

faceImg.onerror = () => console.log("face failed");
heroImg.onerror = () => console.log("hero failed");
girlImg.onerror = () => console.log("girl failed");

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function initBuildings() {
  buildings.length = 0;

  let x = -60;

  while (x < W + 80) {
    const w = rand(45, 95);
    const h = rand(H * 0.22, H * 0.58);

    buildings.push({
      x,
      y: H - h,
      w,
      h,
      alpha: rand(0.12, 0.28),
      windows: Math.floor(rand(6, 16)),
    });

    x += w + rand(4, 18);
  }
}

function initParticles() {
  particles.length = 0;

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: rand(0, W),
      y: rand(0, H),
      r: rand(1, 2.8),
      vx: rand(-0.2, 0.25),
      vy: rand(0.08, 0.35),
      alpha: rand(0.14, 0.45),
    });
  }
}

function drawDarkBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "rgba(5, 12, 28, 0.55)");
  bg.addColorStop(0.5, "rgba(18, 32, 58, 0.42)");
  bg.addColorStop(1, "rgba(2, 5, 12, 0.65)");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

function drawCity(t) {
  ctx.save();

  buildings.forEach((b, index) => {
    const depth = index % 3;

    const speed = depth === 0 ? 0.25 : depth === 1 ? 0.55 : 1.05;
    const offsetY = (t * speed * 0.08) % (H + b.h);

    const y = b.y + offsetY;
    const y2 = y - H - b.h;

    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = "#050b18";

    ctx.fillRect(b.x, y, b.w, b.h);
    ctx.fillRect(b.x, y2, b.w, b.h);

    ctx.globalAlpha = b.alpha * 1.8;
    ctx.fillStyle = "rgba(255, 210, 120, 0.6)";

    for (let i = 0; i < b.windows; i++) {
      const wx = b.x + 10 + (i % 4) * 14;
      const wy = 15 + Math.floor(i / 4) * 28;

      ctx.fillRect(wx, y + wy, 3, 12);
      ctx.fillRect(wx, y2 + wy, 3, 12);
    }
  });

  ctx.restore();
}

function drawBlueGlow() {
  ctx.save();

  const g = ctx.createRadialGradient(
    W * 0.62,
    H * 0.35,
    0,
    W * 0.62,
    H * 0.35,
    H * 0.65
  );

  g.addColorStop(0, "rgba(90, 160, 255, 0.22)");
  g.addColorStop(0.45, "rgba(70, 120, 255, 0.08)");
  g.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}

function drawSpeedLines(t) {
  ctx.save();

  ctx.strokeStyle = "rgba(170, 210, 255, 0.18)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 45; i++) {
    const x = (i * 97 + t * 0.08) % W;
    const y = (i * 53 + t * 0.7) % H;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 45);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles() {
  ctx.save();

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.y > H + 10) {
      p.y = -10;
      p.x = rand(0, W);
    }

    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "rgba(190, 220, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawFace(t) {
  if (!faceLoaded) return;

  const p = clamp((t - 200) / 1800, 0, 1);
  const alpha = easeOut(p);

  const x = W * CONFIG.faceX;
  const y = H * CONFIG.faceY;
  const w = W * CONFIG.faceW;
  const h = H * CONFIG.faceH;

  const pulseGlow = 45 + Math.sin(t * 0.003) * 18;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(100, 170, 255, 0.95)";
  ctx.shadowBlur = pulseGlow;

  ctx.drawImage(faceImg, x, y, w, h);

  ctx.restore();
}

function drawWebLine(t) {
  const p = clamp(t / 1200, 0, 1);
  const alpha = easeOut(p);
  const sway = Math.sin(t * 0.002) * 25;

  const webX = W * CONFIG.webX + sway;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "rgba(220, 235, 255, 0.92)";
  ctx.shadowColor = "rgba(120, 180, 255, 0.55)";
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(webX, -20);
  ctx.quadraticCurveTo(webX - 8, H * 0.28, webX - 1, H * 0.55);
  ctx.quadraticCurveTo(webX + 8, H * 0.72, webX, H * 0.8);
  ctx.stroke();

  ctx.restore();
}

function drawHero(t) {
  if (!heroLoaded) return;

  const p = clamp((t - 500) / 1400, 0, 1);
  const alpha = easeOut(p);
  const sway = Math.sin(t * 0.002) * 25;

  const x = W * CONFIG.heroX + sway;
  const y = H * CONFIG.heroY;
  const w = H * CONFIG.heroW;
  const h = H * CONFIG.heroH;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(110, 170, 255, 0.65)";
  ctx.shadowBlur = 20;

  ctx.drawImage(heroImg, x, y, w, h);

  ctx.restore();
}

function drawGirl(t) {
  if (!girlLoaded) return;

  const p = clamp((t - 900) / 1600, 0, 1);
  const alpha = easeOut(p);
  const sway = Math.sin(t * 0.002) * 25;

  const x = W * CONFIG.girlX + sway;
  const y = H * CONFIG.girlY;
  const w = H * CONFIG.girlW;
  const h = H * CONFIG.girlH;

  ctx.save();

  ctx.globalAlpha = alpha;
  ctx.shadowColor = "rgba(110, 170, 255, 0.65)";
  ctx.shadowBlur = 20;

  ctx.drawImage(girlImg, x, y, w, h);

  ctx.restore();
}

function drawLyrics(t) {
  const sec = t / 1000;
  let current = null;

  for (const line of lyrics) {
    if (sec >= line.time) current = line;
  }

  if (!current) return;

  ctx.save();

  ctx.font = "bold 24px Georgia";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const y = H * 0.88;

  if (current.parts) {
    let totalWidth = 0;

    current.parts.forEach((part) => {
      totalWidth += ctx.measureText(part.text).width;
    });

    let x = W / 2 - totalWidth / 2;

    current.parts.forEach((part) => {
      ctx.fillStyle = part.color || "white";
      ctx.shadowColor = part.color || "rgba(120,180,255,0.9)";
      ctx.shadowBlur = 18;

      ctx.fillText(part.text, x, y);
      x += ctx.measureText(part.text).width;
    });
  } else {
    ctx.textAlign = "center";
    ctx.fillStyle = current.color || "rgba(255,255,255,0.95)";
    ctx.shadowColor = current.color || "rgba(120,180,255,0.9)";
    ctx.shadowBlur = 18;

    ctx.fillText(current.text, W / 2, y);
  }

  ctx.restore();
}

function drawFadeOut(t) {
  if (t < CONFIG.duration - 1800) return;

  const p = clamp((t - (CONFIG.duration - 1800)) / 1800, 0, 1);

  ctx.save();

  ctx.globalAlpha = p;
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}

function animate(now) {
  const t = now - startTime;

  ctx.clearRect(0, 0, W, H);

  drawDarkBackground();
  drawCity(t);
  drawBlueGlow();
  drawSpeedLines(t);
  drawParticles();

  drawFace(t);
  drawWebLine(t);
  drawHero(t);
  drawGirl(t);

  drawLyrics(t);
  drawFadeOut(t);

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;

  canvas.width = W;
  canvas.height = H;

  initBuildings();
  initParticles();
});

window.addEventListener("load", () => {
  if (!music) return;

  music.volume = 0.45;

  music.play().catch((err) => {
    console.log("Music failed:", err);
  });
});

initBuildings();
initParticles();
requestAnimationFrame(animate);

setTimeout(() => {
  if (music) {
    music.pause();
    music.currentTime = 0;
  }

  window.close();
}, CONFIG.duration);
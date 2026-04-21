import {
  scheduleCallback,
  NormalPriority,
} from "../src/index";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Simulate one unit of heavy CPU work (~0.04 ms each) */
function heavyWorkItem(): number {
  let x = 0;
  for (let i = 0; i < 5_000; i++) {
    x = Math.sqrt(i * Math.PI) * Math.log(i + 1);
  }
  return x;
}

const WORK_ITEMS = 50_000; // total units of work per run
const CHUNK_BUDGET_MS = 5; // max ms per scheduler slice (smooth demo)

// ─────────────────────────────────────────────────────────────────────────────
// Ball animation (shared logic, one per canvas)
// ─────────────────────────────────────────────────────────────────────────────

interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trailColor: string;
  trail: { x: number; y: number }[];
}

function createBall(color: string, trailColor: string): BallState {
  return {
    x: 60,
    y: 60,
    vx: 3.5,
    vy: 2.2,
    radius: 18,
    color,
    trailColor,
    trail: [],
  };
}

function stepBall(ball: BallState, w: number, h: number) {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x + ball.radius >= w || ball.x - ball.radius <= 0) {
    ball.vx *= -1;
    ball.x = Math.max(ball.radius, Math.min(w - ball.radius, ball.x));
  }
  if (ball.y + ball.radius >= h || ball.y - ball.radius <= 0) {
    ball.vy *= -1;
    ball.y = Math.max(ball.radius, Math.min(h - ball.radius, ball.y));
  }

  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 28) ball.trail.shift();
}

function drawBall(ctx: CanvasRenderingContext2D, ball: BallState) {
  // trail
  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const alpha = (i / ball.trail.length) * 0.35;
    const r = ball.radius * (i / ball.trail.length) * 0.7;
    ctx.beginPath();
    ctx.arc(t.x, t.y, Math.max(r, 2), 0, Math.PI * 2);
    ctx.fillStyle = ball.trailColor.replace(")", `, ${alpha})`).replace("rgb", "rgba");
    ctx.fill();
  }

  // glow
  const grad = ctx.createRadialGradient(
    ball.x - 5,
    ball.y - 5,
    2,
    ball.x,
    ball.y,
    ball.radius * 1.6
  );
  grad.addColorStop(0, ball.color);
  grad.addColorStop(1, "transparent");
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // body
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.shadowBlur = 18;
  ctx.shadowColor = ball.color;
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas setup
// ─────────────────────────────────────────────────────────────────────────────

function setupCanvas(canvas: HTMLCanvasElement) {
  const wrap = canvas.parentElement!;
  canvas.width = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  return canvas.getContext("2d")!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Demo 1 — WITH scheduleCallback (smooth)
// ─────────────────────────────────────────────────────────────────────────────

const smoothCanvas = document.getElementById("smooth-canvas") as HTMLCanvasElement;
const smoothCtx = setupCanvas(smoothCanvas);
const smoothBall = createBall("#22d3a5", "rgb(34, 211, 165)");

let smoothDrops = 0;
let smoothItems = 0;
let smoothLastFrame = performance.now();
let smoothFrameTimes: number[] = [];

const smoothDropEl = document.getElementById("smooth-drops")!;
const smoothItemsEl = document.getElementById("smooth-items")!;
const smoothFpsEl = document.getElementById("smooth-fps")!;

function renderSmooth(now: number) {
  const dt = now - smoothLastFrame;

  // detect dropped frame: > 33ms gap (≈ 2 missed frames at 60 fps)
  if (dt > 33 && smoothLastFrame > 0) {
    smoothDrops++;
    smoothDropEl.textContent = String(smoothDrops);
  }

  smoothFrameTimes.push(dt);
  if (smoothFrameTimes.length > 60) smoothFrameTimes.shift();
  const avgDt = smoothFrameTimes.reduce((a, b) => a + b, 0) / smoothFrameTimes.length;
  smoothFpsEl.textContent = Math.round(1000 / avgDt).toString();

  smoothLastFrame = now;

  const w = smoothCanvas.width;
  const h = smoothCanvas.height;

  ctx_clearBg(smoothCtx, w, h, "rgba(19, 22, 31, 0.35)");
  stepBall(smoothBall, w, h);
  drawBall(smoothCtx, smoothBall);

  requestAnimationFrame(renderSmooth);
}

requestAnimationFrame(renderSmooth);

document.getElementById("smooth-btn")!.addEventListener("click", () => {
  smoothItems = 0;
  let remaining = WORK_ITEMS;

  function processChunk() {
    const deadline = performance.now() + CHUNK_BUDGET_MS;

    while (remaining > 0 && performance.now() < deadline) {
      heavyWorkItem();
      remaining--;
      smoothItems++;
    }

    smoothItemsEl.textContent = smoothItems.toLocaleString();

    if (remaining > 0) {
      scheduleCallback(NormalPriority, processChunk);
    }
  }

  scheduleCallback(NormalPriority, processChunk);
});

// ─────────────────────────────────────────────────────────────────────────────
// Demo 2 — WITHOUT scheduler (janky, synchronous)
// ─────────────────────────────────────────────────────────────────────────────

const jankyCanvas = document.getElementById("janky-canvas") as HTMLCanvasElement;
const jankyCtx = setupCanvas(jankyCanvas);
const jankyBall = createBall("#f4606c", "rgb(244, 96, 108)");

let jankyDrops = 0;
let jankyItems = 0;
let jankyLastFrame = performance.now();
let jankyFrameTimes: number[] = [];

const jankyDropEl = document.getElementById("janky-drops")!;
const jankyItemsEl = document.getElementById("janky-items")!;
const jankyFpsEl = document.getElementById("janky-fps")!;
const jankIndicator = document.getElementById("jank-indicator")!;

function renderJanky(now: number) {
  const dt = now - jankyLastFrame;

  if (dt > 33 && jankyLastFrame > 0) {
    jankyDrops++;
    jankyDropEl.textContent = String(jankyDrops);

    // Flash the jank indicator
    jankIndicator.classList.remove("visible");
    void jankIndicator.offsetWidth; // force reflow
    jankIndicator.classList.add("visible");
  }

  jankyFrameTimes.push(dt);
  if (jankyFrameTimes.length > 60) jankyFrameTimes.shift();
  const avgDt = jankyFrameTimes.reduce((a, b) => a + b, 0) / jankyFrameTimes.length;
  jankyFpsEl.textContent = Math.round(1000 / avgDt).toString();

  jankyLastFrame = now;

  const w = jankyCanvas.width;
  const h = jankyCanvas.height;

  ctx_clearBg(jankyCtx, w, h, "rgba(19, 22, 31, 0.35)");
  stepBall(jankyBall, w, h);
  drawBall(jankyCtx, jankyBall);

  requestAnimationFrame(renderJanky);
}

requestAnimationFrame(renderJanky);

document.getElementById("janky-btn")!.addEventListener("click", () => {
  jankyItems = 0;

  // ⚠ All work runs synchronously — blocks the main thread
  for (let i = 0; i < WORK_ITEMS; i++) {
    heavyWorkItem();
    jankyItems++;
  }

  jankyItemsEl.textContent = jankyItems.toLocaleString();
});

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function ctx_clearBg(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fillStyle: string
) {
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, w, h);
}
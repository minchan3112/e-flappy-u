import { BRAND, CHARACTERS } from "./brand.js";
import { sfx, toggleMute, isMuted, unlockAudio } from "./audio.js";
import { fetchRanking, submitScore, renderRanking } from "./ranking.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const lobby = document.getElementById("lobby");
const stageWrap = document.getElementById("stage-wrap");
const rankingList = document.getElementById("ranking-list");
const playerChip = document.getElementById("player-chip");
const muteBtn = document.getElementById("mute-btn");
const characterGrid = document.getElementById("character-grid");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_H = 96;
const BIRD_X = 110;
const BIRD_R = 16;
const PIPE_W = 68;
const GRAVITY = 0.42;
const FLAP = -7.4;
const PROFILE_KEY = "efu-e-flappy-u-profile";

const player = {
  name: "",
  department: "",
  characterId: "sky",
};

const state = {
  screen: "lobby",
  mode: "ready",
  birdY: HEIGHT / 2,
  birdV: 0,
  pipes: [],
  score: 0,
  bestScore: 0,
  frame: 0,
  spawnTick: 0,
  submitted: false,
  clouds: createClouds(),
};

function createClouds() {
  return Array.from({ length: 5 }, (_, i) => ({
    x: i * 120 + 20,
    y: 40 + (i % 3) * 36,
    w: 70 + (i % 2) * 24,
    speed: 0.25 + (i % 3) * 0.08,
  }));
}

function character() {
  return CHARACTERS.find((c) => c.id === player.characterId) || CHARACTERS[0];
}

export function getDifficulty(score) {
  return {
    speed: 2.35 + Math.min(score, 28) * 0.11,
    gap: Math.max(118, 168 - score * 1.5),
    spawnEvery: Math.max(60, 92 - score * 0.9),
  };
}

function resetRound(mode = "ready") {
  state.mode = mode;
  state.birdY = HEIGHT / 2;
  state.birdV = 0;
  state.pipes = [];
  state.score = 0;
  state.frame = 0;
  state.spawnTick = 0;
  state.submitted = false;
}

function spawnPipe(gap) {
  const minTop = 80;
  const maxTop = HEIGHT - GROUND_H - gap - 80;
  const gapY = minTop + Math.random() * Math.max(10, maxTop - minTop);
  state.pipes.push({ x: WIDTH + 20, gapY, gap, scored: false });
}

function hitPipe(pipe) {
  const birdTop = state.birdY - BIRD_R;
  const birdBottom = state.birdY + BIRD_R;
  const birdLeft = BIRD_X - BIRD_R * 0.7;
  const birdRight = BIRD_X + BIRD_R * 0.7;
  const inX = birdRight > pipe.x && birdLeft < pipe.x + PIPE_W;
  const inGap = birdTop > pipe.gapY && birdBottom < pipe.gapY + pipe.gap;
  return inX && !inGap;
}

function flap() {
  if (state.screen !== "game") return;
  if (state.mode === "ready") {
    state.mode = "play";
    spawnPipe(getDifficulty(0).gap);
    state.birdV = FLAP;
    sfx.flap();
    return;
  }
  if (state.mode === "play") {
    state.birdV = FLAP;
    sfx.flap();
    return;
  }
  if (state.mode === "over") {
    sfx.ui();
    resetRound("ready");
  }
}

async function onCrash() {
  if (state.submitted) return;
  state.submitted = true;
  sfx.crash();
  try {
    const list = await submitScore({
      name: player.name,
      department: player.department,
      character: character().name,
      score: state.score,
    });
    state.bestScore = Math.max(state.bestScore, state.score);
    syncPlayerCard();
    renderRanking(list, player.name, rankingList);
  } catch {
    rankingList.insertAdjacentHTML("afterbegin", `<p class="empty">スコアをサーバーに保存できませんでした。</p>`);
  }
}

function update() {
  state.frame += 1;
  const diff = getDifficulty(state.score);
  for (const cloud of state.clouds) {
    cloud.x -= cloud.speed + (diff.speed - 2.35) * 0.08;
    if (cloud.x < -cloud.w) cloud.x = WIDTH + 40;
  }

  if (state.screen !== "game") return;

  if (state.mode === "play") {
    state.birdV += GRAVITY;
    state.birdY += state.birdV;
    state.spawnTick += 1;
    if (state.spawnTick >= diff.spawnEvery) {
      state.spawnTick = 0;
      spawnPipe(diff.gap);
    }

    for (const pipe of state.pipes) {
      pipe.x -= diff.speed;
      if (!pipe.scored && pipe.x + PIPE_W < BIRD_X) {
        pipe.scored = true;
        state.score += 1;
        sfx.score();
      }
    }
    state.pipes = state.pipes.filter((p) => p.x > -PIPE_W - 10);

    const hitGround = state.birdY + BIRD_R >= HEIGHT - GROUND_H;
    const hitSky = state.birdY - BIRD_R <= 0;
    if (hitGround || hitSky || state.pipes.some(hitPipe)) {
      state.mode = "over";
      state.birdV = 0;
      onCrash();
    }
  } else if (state.mode === "ready") {
    state.birdY = HEIGHT / 2 + Math.sin(state.frame / 12) * 8;
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#8fd3ff");
  sky.addColorStop(1, "#e8f7c8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (const cloud of state.clouds) {
    roundRect(cloud.x, cloud.y, cloud.w, 28, 14);
    ctx.fill();
    roundRect(cloud.x + 18, cloud.y - 14, cloud.w * 0.55, 26, 13);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  roundRect(12, 12, 132, 36, 12);
  ctx.fill();
  ctx.fillStyle = "#0369a1";
  ctx.font = 'bold 14px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText(`${BRAND.company} · ${BRAND.initials}`, 24, 36);
}

function drawPipes() {
  for (const pipe of state.pipes) {
    ctx.fillStyle = "#34d399";
    ctx.fillRect(pipe.x, 0, PIPE_W, pipe.gapY);
    ctx.fillRect(pipe.x, pipe.gapY + pipe.gap, PIPE_W, HEIGHT - GROUND_H - (pipe.gapY + pipe.gap));
    ctx.fillStyle = "#059669";
    ctx.fillRect(pipe.x - 4, pipe.gapY - 22, PIPE_W + 8, 22);
    ctx.fillRect(pipe.x - 4, pipe.gapY + pipe.gap, PIPE_W + 8, 22);
  }
}

function drawGround(speed) {
  ctx.fillStyle = "#d9b36a";
  ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, GROUND_H);
  ctx.fillStyle = "#86efac";
  ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, 18);
  ctx.fillStyle = "#4d7c0f";
  const offset = (state.frame * speed) % 28;
  for (let x = -28; x < WIDTH + 28; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x - offset, HEIGHT - GROUND_H + 18);
    ctx.lineTo(x + 14 - offset, HEIGHT - GROUND_H);
    ctx.lineTo(x + 28 - offset, HEIGHT - GROUND_H + 18);
    ctx.fill();
  }
}

function drawBird() {
  const look = character();
  const tilt = Math.max(-0.6, Math.min(0.8, state.birdV / 10));
  ctx.save();
  ctx.translate(BIRD_X, state.birdY);
  ctx.rotate(tilt);
  ctx.fillStyle = look.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(8, -4, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(10, -4, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = look.beak;
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(32, 4);
  ctx.lineTo(18, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = look.wing;
  ctx.beginPath();
  ctx.ellipse(-6, 4, 10, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHud() {
  ctx.fillStyle = "#1e293b";
  ctx.font = 'bold 42px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
  ctx.textAlign = "center";
  if (state.mode === "play") {
    ctx.fillText(String(state.score), WIDTH / 2, 72);
    ctx.font = 'bold 14px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    ctx.fillStyle = "#0369a1";
    ctx.fillText(`Lv ${Math.floor(state.score / 5) + 1} · ${player.name}`, WIDTH / 2, 96);
  }

  if (state.mode === "ready" || state.mode === "over") {
    roundRect(40, 200, WIDTH - 80, 290, 24);
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.font = 'bold 28px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    ctx.fillText(state.mode === "ready" ? BRAND.product : "ゲームオーバー", WIDTH / 2, 252);
    ctx.font = '16px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    if (state.mode === "ready") {
      ctx.fillText(player.name, WIDTH / 2, 292);
      ctx.fillText("タップ / スペースでジャンプ", WIDTH / 2, 328);
      ctx.fillText("得点が上がるとスピードが上がります", WIDTH / 2, 358);
    } else {
      ctx.fillText(`今回の得点：${state.score}`, WIDTH / 2, 300);
      ctx.fillText(`自己ベスト：${Math.max(state.bestScore, state.score)}`, WIDTH / 2, 334);
      ctx.fillText("タップしてもう一度", WIDTH / 2, 376);
    }
  }
}

function loop() {
  const speed = getDifficulty(state.score).speed;
  update();
  drawBackground();
  drawPipes();
  drawGround(speed);
  drawBird();
  if (state.screen === "game") drawHud();
  requestAnimationFrame(loop);
}

function paintCharacters() {
  characterGrid.innerHTML = CHARACTERS.map(
    (c) => `<button type="button" class="char-btn${c.id === player.characterId ? " selected" : ""}" data-id="${c.id}">
      <div class="char-swatch" style="background:${c.body}"></div>
      <strong>${c.name}</strong>
      <small>${c.team}</small>
    </button>`
  ).join("");
}

function syncPlayerCard() {
  const empty = document.getElementById("player-card-empty");
  const stats = document.getElementById("player-card-stats");
  if (!player.name) {
    empty.classList.remove("hidden");
    stats.classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  stats.classList.remove("hidden");
  document.getElementById("stat-name").textContent = player.name;
  document.getElementById("stat-dept").textContent = player.department || "社内";
  document.getElementById("stat-char").textContent = character().name;
  document.getElementById("stat-best").textContent = `${Math.max(state.bestScore, state.score)} 点`;
}

function enterGame() {
  state.screen = "game";
  lobby.classList.add("hidden");
  stageWrap.classList.remove("hidden");
  playerChip.classList.remove("hidden");
  playerChip.textContent = `${player.name} · ${character().name}`;
  syncPlayerCard();
  resetRound("ready");
}

function enterLobby() {
  state.screen = "lobby";
  lobby.classList.remove("hidden");
  stageWrap.classList.add("hidden");
  resetRound("ready");
  syncPlayerCard();
}

async function refreshRanking() {
  try {
    renderRanking(await fetchRanking(), player.name, rankingList);
  } catch {
    rankingList.innerHTML = `<p class="empty">社内ランキングに接続できません。</p>`;
  }
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
    if (!saved) return;
    player.name = saved.name || "";
    player.department = saved.department || "";
    player.characterId = saved.characterId || "sky";
    document.getElementById("player-name").value = player.name;
    document.getElementById("player-dept").value = player.department;
  } catch {
    /* ignore */
  }
}

paintCharacters();
loadProfile();
syncPlayerCard();
refreshRanking();
loop();

characterGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".char-btn");
  if (!btn) return;
  player.characterId = btn.dataset.id;
  sfx.ui();
  paintCharacters();
});

document.getElementById("join-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("player-name").value.trim();
  if (name.length < 1) return;
  player.name = name;
  player.department = document.getElementById("player-dept").value.trim();
  localStorage.setItem(PROFILE_KEY, JSON.stringify(player));
  unlockAudio();
  sfx.ui();
  enterGame();
  refreshRanking();
});

document.getElementById("leave-btn").addEventListener("click", () => {
  sfx.ui();
  enterLobby();
});

muteBtn.addEventListener("click", () => {
  muteBtn.textContent = toggleMute() ? "音量オフ" : "音量オン";
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    if (state.screen !== "game") return;
    e.preventDefault();
    flap();
  }
});

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  unlockAudio();
  flap();
});

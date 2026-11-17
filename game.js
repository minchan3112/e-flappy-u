import { BRAND, CHARACTERS } from "./brand.js";
import { sfx, toggleMute, unlockAudio } from "./audio.js";
import { fetchRanking, submitScore, renderRanking } from "./ranking.js";
import { drawCreature, paintCreature } from "./creatures.js";
import { appearanceLabel, paintAvatarCanvas, resolveCharacterId } from "./avatar.js";
import { drawThemeBadge, drawThemeGround, drawThemePipes, drawThemeScenery, drawThemeSky, themeOf } from "./themes.js";

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
  if (mode === "ready") {
    state.pipes.push({ x: 268, gapY: 168, gap: 168, scored: true });
  }
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
    await submitScore(
      {
        name: player.name,
        department: player.department,
        character: appearanceLabel(player),
        characterId: player.characterId,
        score: state.score,
      },
      rankScope,
    );
    state.bestScore = Math.max(state.bestScore, state.score);
    syncPlayerCard();
    await refreshRanking();
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

function currentTheme() {
  return themeOf(character());
}

function drawBackground() {
  const theme = currentTheme();
  drawThemeSky(ctx, theme, WIDTH, HEIGHT);
  drawThemeScenery(ctx, theme, state.clouds, state.frame, WIDTH, HEIGHT, GROUND_H);
  drawThemeBadge(ctx, theme, BRAND);
}

function drawPipes() {
  drawThemePipes(ctx, currentTheme(), state.pipes, PIPE_W, HEIGHT, GROUND_H);
}

function drawGround(speed) {
  drawThemeGround(ctx, currentTheme(), state.frame, speed, WIDTH, HEIGHT, GROUND_H);
}

function drawBird() {
  const tilt = Math.max(-0.6, Math.min(0.8, state.birdV / 10));
  ctx.save();
  ctx.translate(BIRD_X, state.birdY);
  ctx.rotate(tilt);
  const flap = state.mode === "play" ? Math.sin(state.frame * 0.42) * 0.45 : 0.2;
  drawCreature(ctx, character().species, flap);
  ctx.restore();
}

function drawHud() {
  const look = character();
  const theme = currentTheme();
  ctx.fillStyle = theme.hud;
  ctx.font = 'bold 42px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
  ctx.textAlign = "center";
  if (state.mode === "play") {
    ctx.fillText(String(state.score), WIDTH / 2, 72);
    ctx.font = 'bold 14px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    ctx.fillText(`Lv ${Math.floor(state.score / 5) + 1} · ${player.name}`, WIDTH / 2, 96);
  }

  if (state.mode === "ready" || state.mode === "over") {
    roundRect(40, 200, WIDTH - 80, 290, 24);
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.font = 'bold 28px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    ctx.fillText(state.mode === "ready" ? BRAND.product : "ゲームオーバー", WIDTH / 2, 252);
    ctx.font = '16px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
    if (state.mode === "ready") {
      ctx.fillText(`${player.name} · ${look.name}`, WIDTH / 2, 292);
      ctx.fillText(`${look.team}ステージ`, WIDTH / 2, 322);
      ctx.fillText("タップ / スペースでジャンプ", WIDTH / 2, 356);
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
      <canvas class="char-preview" width="72" height="56" data-species="${c.species}" aria-hidden="true"></canvas>
      <strong>${c.name}</strong>
      <small>${c.team}</small>
    </button>`
  ).join("");
  characterGrid.querySelectorAll(".char-preview").forEach((preview) => {
    const cctx = preview.getContext("2d");
    cctx.imageSmoothingEnabled = true;
    paintCreature(cctx, preview.dataset.species, preview.width, preview.height, 0.28);
  });
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
  document.getElementById("stat-char").textContent = appearanceLabel(player);
  document.getElementById("stat-best").textContent = `${Math.max(state.bestScore, state.score)} 点`;
  paintAvatarCanvas(document.getElementById("stat-avatar"), player);
}

function enterGame() {
  state.screen = "game";
  lobby.classList.add("hidden");
  stageWrap.classList.remove("hidden");
  playerChip.classList.remove("hidden");
  playerChip.textContent = `${player.name} · ${appearanceLabel(player)}`;
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

let rankScope = "week";

function syncRankTabs() {
  document.getElementById("rank-week-btn").classList.toggle("selected", rankScope === "week");
  document.getElementById("rank-all-btn").classList.toggle("selected", rankScope === "all");
}

async function refreshRanking() {
  try {
    renderRanking(await fetchRanking(rankScope), player.name, rankingList);
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
    player.characterId = resolveCharacterId(saved.characterId || "sky");
    document.getElementById("player-name").value = player.name;
    document.getElementById("player-dept").value = player.department;
  } catch {
    /* ignore */
  }
}

loadProfile();
paintCharacters();
syncPlayerCard();
syncRankTabs();
refreshRanking();
loop();

document.querySelector(".rank-tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-scope]");
  if (!btn) return;
  rankScope = btn.dataset.scope === "all" ? "all" : "week";
  sfx.ui();
  syncRankTabs();
  refreshRanking();
});

characterGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".char-btn");
  if (!btn) return;
  player.characterId = resolveCharacterId(btn.dataset.id);
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

export const THEMES = {
  sky: {
    sky: ["#8fd3ff", "#d7f0a8"],
    cloud: "rgba(255,255,255,0.88)",
    pipe: "#34d399",
    pipeDark: "#059669",
    pipeLite: "#6ee7b7",
    ground: "#d9b36a",
    groundTop: "#86efac",
    mark: "#4d7c0f",
    hud: "#0369a1",
    logo: "#0369a1",
    kind: "meadow",
  },
  eagle: {
    sky: ["#7eb6e0", "#eef3f8"],
    cloud: "rgba(255,255,255,0.72)",
    pipe: "#8b7355",
    pipeDark: "#5c4a38",
    pipeLite: "#d6d3d1",
    ground: "#94a3b8",
    groundTop: "#e2e8f0",
    mark: "#64748b",
    hud: "#1e3a5f",
    logo: "#1e3a5f",
    kind: "mountain",
  },
  kong: {
    sky: ["#31205a", "#ea580c"],
    cloud: "rgba(251,191,36,0.22)",
    pipe: "#334155",
    pipeDark: "#0f172a",
    pipeLite: "#facc15",
    ground: "#111827",
    groundTop: "#1f2937",
    mark: "#facc15",
    hud: "#fff7ed",
    logo: "#9a3412",
    kind: "city",
  },
  phoenix: {
    sky: ["#7c2d12", "#fb923c"],
    cloud: "rgba(254,215,170,0.35)",
    pipe: "#44403c",
    pipeDark: "#1c1917",
    pipeLite: "#fb923c",
    ground: "#1c1917",
    groundTop: "#7c2d12",
    mark: "#f97316",
    hud: "#fff7ed",
    logo: "#9a3412",
    kind: "volcano",
  },
  owl: {
    sky: ["#06101f", "#1e3a5f"],
    cloud: "rgba(148,163,184,0.28)",
    pipe: "#3f2e1c",
    pipeDark: "#1c1917",
    pipeLite: "#166534",
    ground: "#14532d",
    groundTop: "#052e16",
    mark: "#4d7c0f",
    hud: "#e0f2fe",
    logo: "#e0f2fe",
    kind: "night",
  },
  penguin: {
    sky: ["#0c4a6e", "#7dd3fc"],
    cloud: "rgba(255,255,255,0.55)",
    pipe: "#7dd3fc",
    pipeDark: "#0369a1",
    pipeLite: "#e0f2fe",
    ground: "#cbd5e1",
    groundTop: "#f8fafc",
    mark: "#38bdf8",
    hud: "#0c4a6e",
    logo: "#0c4a6e",
    kind: "arctic",
  },
};

export function themeOf(character) {
  return THEMES[character?.species] || THEMES.sky;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawThemeSky(ctx, theme, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, theme.sky[0]);
  sky.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
}

export function drawThemeScenery(ctx, theme, clouds, frame, width, height, groundH) {
  const horizon = height - groundH;
  if (theme.kind === "mountain") drawMountains(ctx, frame, width, horizon);
  else if (theme.kind === "city") drawCity(ctx, frame, width, horizon);
  else if (theme.kind === "volcano") drawVolcano(ctx, frame, width, horizon);
  else if (theme.kind === "night") drawNight(ctx, frame, width, horizon);
  else if (theme.kind === "arctic") drawArctic(ctx, frame, width, horizon);
  else drawHills(ctx, frame, width, horizon);

  ctx.fillStyle = theme.cloud;
  for (const cloud of clouds) {
    roundRect(ctx, cloud.x, cloud.y, cloud.w, 28, 14);
    ctx.fill();
    roundRect(ctx, cloud.x + 18, cloud.y - 14, cloud.w * 0.55, 26, 13);
    ctx.fill();
  }
}

function drawHills(ctx, frame, width, horizon) {
  const shift = (frame * 0.35) % 220;
  ctx.fillStyle = "#86c46a";
  ctx.beginPath();
  ctx.moveTo(-40, horizon);
  for (let x = -40; x <= width + 40; x += 40) {
    ctx.quadraticCurveTo(x + 20 - shift, horizon - 28 - ((x / 40) % 3) * 10, x + 40 - shift, horizon);
  }
  ctx.lineTo(width + 40, horizon);
  ctx.closePath();
  ctx.fill();
}

function drawMountains(ctx, frame, width, horizon) {
  const shift = (frame * 0.22) % 360;
  const peaks = [
    { x: 40, h: 210, w: 180, fill: "#94a3b8" },
    { x: 180, h: 280, w: 220, fill: "#64748b" },
    { x: 340, h: 190, w: 170, fill: "#7b8fa6" },
    { x: 500, h: 250, w: 200, fill: "#8aa0b5" },
  ];
  for (const p of peaks) {
    const x = ((p.x - shift) % (width + 240)) - 80;
    ctx.fillStyle = p.fill;
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(x + p.w / 2, horizon - p.h);
    ctx.lineTo(x + p.w, horizon);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(x + p.w / 2, horizon - p.h);
    ctx.lineTo(x + p.w / 2 - 22, horizon - p.h + 36);
    ctx.lineTo(x + p.w / 2 + 22, horizon - p.h + 36);
    ctx.closePath();
    ctx.fill();
  }
}

function drawCity(ctx, frame, width, horizon) {
  const shift = (frame * 0.4) % 280;
  const blocks = [
    { x: 0, w: 58, h: 160 },
    { x: 70, w: 42, h: 220 },
    { x: 122, w: 70, h: 140 },
    { x: 200, w: 50, h: 250 },
    { x: 262, w: 80, h: 180 },
    { x: 350, w: 46, h: 210 },
    { x: 410, w: 90, h: 150 },
    { x: 510, w: 55, h: 240 },
  ];
  for (const b of blocks) {
    const x = ((b.x - shift) % (width + 200)) - 40;
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(x, horizon - b.h, b.w, b.h);
    ctx.fillStyle = "#fbbf24";
    for (let wy = horizon - b.h + 12; wy < horizon - 16; wy += 18) {
      for (let wx = x + 8; wx < x + b.w - 10; wx += 14) {
        if ((wx + wy) % 28 < 16) ctx.fillRect(wx, wy, 7, 10);
      }
    }
  }
}

function drawVolcano(ctx, frame, width, horizon) {
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  ctx.arc(width - 70, 110, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(width - 70, 110, 22, 0, Math.PI * 2);
  ctx.fill();
  const shift = (frame * 0.18) % 200;
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(-20 - shift, horizon);
  ctx.lineTo(90 - shift, horizon - 160);
  ctx.lineTo(200 - shift, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(220 - shift, horizon);
  ctx.lineTo(360 - shift, horizon - 220);
  ctx.lineTo(520 - shift, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ea580c";
  ctx.beginPath();
  ctx.moveTo(330 - shift, horizon - 190);
  ctx.lineTo(360 - shift, horizon - 230);
  ctx.lineTo(390 - shift, horizon - 190);
  ctx.closePath();
  ctx.fill();
}

function drawNight(ctx, frame, width, horizon) {
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(70, 70, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#06101f";
  ctx.beginPath();
  ctx.arc(82, 62, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e2e8f0";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 53 + frame * 0.08) % width;
    const y = 20 + (i * 37) % 160;
    ctx.fillRect(x, y, 2, 2);
  }
  const shift = (frame * 0.28) % 160;
  ctx.fillStyle = "#052e16";
  for (let x = -40; x < width + 40; x += 70) {
    const tx = x - shift;
    ctx.beginPath();
    ctx.moveTo(tx + 18, horizon);
    ctx.lineTo(tx + 28, horizon - 90 - (x % 40));
    ctx.lineTo(tx + 38, horizon);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tx + 28, horizon - 78, 22, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawArctic(ctx, frame, width, horizon) {
  ctx.strokeStyle = "rgba(167,243,208,0.55)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-10, 90);
  for (let x = 0; x <= width; x += 40) {
    ctx.quadraticCurveTo(x + 20, 70 + Math.sin((x + frame) / 40) * 18, x + 40, 90);
  }
  ctx.stroke();
  ctx.strokeStyle = "rgba(125,211,252,0.45)";
  ctx.beginPath();
  ctx.moveTo(-10, 130);
  for (let x = 0; x <= width; x += 50) {
    ctx.quadraticCurveTo(x + 25, 110 + Math.cos((x + frame) / 35) * 16, x + 50, 130);
  }
  ctx.stroke();
  const shift = (frame * 0.2) % 180;
  ctx.fillStyle = "#e0f2fe";
  ctx.beginPath();
  ctx.moveTo(-30 - shift, horizon);
  ctx.lineTo(80 - shift, horizon - 70);
  ctx.lineTo(180 - shift, horizon);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(240 - shift, horizon);
  ctx.lineTo(360 - shift, horizon - 110);
  ctx.lineTo(500 - shift, horizon);
  ctx.fill();
}

export function drawThemePipes(ctx, theme, pipes, pipeW, height, groundH) {
  for (const pipe of pipes) {
    const topH = pipe.gapY;
    const botY = pipe.gapY + pipe.gap;
    const botH = height - groundH - botY;
    ctx.fillStyle = theme.pipe;
    ctx.fillRect(pipe.x, 0, pipeW, topH);
    ctx.fillRect(pipe.x, botY, pipeW, botH);
    decoratePipe(ctx, theme, pipe.x, 0, pipeW, topH, true);
    decoratePipe(ctx, theme, pipe.x, botY, pipeW, botH, false);
    ctx.fillStyle = theme.pipeDark;
    ctx.fillRect(pipe.x - 4, pipe.gapY - 22, pipeW + 8, 22);
    ctx.fillRect(pipe.x - 4, botY, pipeW + 8, 22);
    if (theme.kind === "mountain") {
      ctx.fillStyle = theme.pipeLite;
      ctx.fillRect(pipe.x - 4, pipe.gapY - 22, pipeW + 8, 8);
    } else if (theme.kind === "city") {
      ctx.fillStyle = theme.pipeLite;
      ctx.fillRect(pipe.x + pipeW / 2 - 2, pipe.gapY - 38, 4, 16);
    } else if (theme.kind === "night") {
      ctx.fillStyle = theme.pipeLite;
      ctx.fillRect(pipe.x - 6, pipe.gapY - 26, pipeW + 12, 12);
    } else if (theme.kind === "volcano") {
      ctx.fillStyle = theme.pipeLite;
      ctx.fillRect(pipe.x - 4, pipe.gapY - 10, pipeW + 8, 6);
      ctx.fillRect(pipe.x - 4, botY, pipeW + 8, 6);
    } else if (theme.kind === "arctic") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(pipe.x - 4, pipe.gapY - 22, pipeW + 8, 8);
    }
  }
}

function decoratePipe(ctx, theme, x, y, w, h, isTop) {
  if (h < 8) return;
  if (theme.kind === "city") {
    ctx.fillStyle = theme.pipeLite;
    for (let wy = y + 10; wy < y + h - 12; wy += 16) {
      ctx.fillRect(x + 10, wy, 10, 8);
      ctx.fillRect(x + w - 20, wy, 10, 8);
    }
  } else if (theme.kind === "mountain") {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 4; i += 1) ctx.fillRect(x + 8, y + 12 + i * 28, w - 16, 6);
  } else if (theme.kind === "volcano") {
    ctx.strokeStyle = theme.pipeLite;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 8);
    ctx.lineTo(x + 20, y + h * 0.4);
    ctx.lineTo(x + 14, y + h - 10);
    ctx.stroke();
  } else if (theme.kind === "night") {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(x + 8, y + 6, 6, h - 12);
    ctx.fillRect(x + w - 16, y + 6, 6, h - 12);
  } else if (theme.kind === "arctic") {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(x + 8, y + 6, 10, h - 12);
  } else if (!isTop) {
    ctx.fillStyle = theme.pipeLite;
    ctx.fillRect(x + 8, y + 8, 8, Math.max(0, h - 16));
  }
}

export function drawThemeGround(ctx, theme, frame, speed, width, height, groundH) {
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, height - groundH, width, groundH);
  ctx.fillStyle = theme.groundTop;
  ctx.fillRect(0, height - groundH, width, 18);
  ctx.fillStyle = theme.mark;
  const offset = (frame * speed) % 28;
  if (theme.kind === "city") {
    for (let x = -28; x < width + 28; x += 36) {
      ctx.fillRect(x - offset, height - groundH + 40, 22, 5);
    }
    return;
  }
  for (let x = -28; x < width + 28; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x - offset, height - groundH + 18);
    ctx.lineTo(x + 14 - offset, height - groundH);
    ctx.lineTo(x + 28 - offset, height - groundH + 18);
    ctx.fill();
  }
}

export function drawThemeBadge(ctx, theme, brand) {
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  roundRect(ctx, 12, 12, 70, 34, 12);
  ctx.fill();
  ctx.fillStyle = theme.logo;
  ctx.font = 'bold 16px "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(brand.company, 47, 35);
}

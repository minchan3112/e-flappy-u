/** Smooth in-game sprites. Hitbox stays the same; these only change appearance. */

function fillEllipse(ctx, x, y, rx, ry, color, rot = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

function fillCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function eye(ctx, x, y, r = 5, pupil = 2.2) {
  fillCircle(ctx, x, y, r, "#fff");
  fillCircle(ctx, x + r * 0.28, y, pupil, "#1e293b");
}

function wingPair(ctx, flap, color, shade, span = 18, thick = 8, y = 2) {
  const ang = -0.35 - flap;
  fillEllipse(ctx, -10, y, span, thick, shade, ang);
  fillEllipse(ctx, -8, y - 1, span * 0.82, thick * 0.78, color, ang + 0.08);
}

export function drawCreature(ctx, species, flap = 0) {
  switch (species) {
    case "eagle":
      drawEagle(ctx, flap);
      break;
    case "kong":
      drawKong(ctx, flap);
      break;
    case "phoenix":
      drawPhoenix(ctx, flap);
      break;
    case "owl":
      drawOwl(ctx, flap);
      break;
    case "penguin":
      drawPenguin(ctx, flap);
      break;
    default:
      drawChick(ctx, flap);
  }
}

function drawChick(ctx, flap) {
  wingPair(ctx, flap, "#f4a261", "#e76f51", 14, 7, 4);
  fillEllipse(ctx, 0, 0, 18, 14, "#ffd166");
  fillEllipse(ctx, 2, 3, 10, 7, "#ffe8a3");
  eye(ctx, 8, -4);
  ctx.fillStyle = "#ff8c42";
  ctx.beginPath();
  ctx.moveTo(16, -1);
  ctx.lineTo(30, 3);
  ctx.lineTo(16, 7);
  ctx.closePath();
  ctx.fill();
  fillEllipse(ctx, -2, 12, 4, 3, "#e76f51", 0.2);
}

function drawEagle(ctx, flap) {
  const ang = -0.5 - flap * 1.1;
  fillEllipse(ctx, -6, 2, 22, 9, "#6d4c41", ang);
  fillEllipse(ctx, -8, 4, 16, 5, "#4e342e", ang + 0.1);
  fillEllipse(ctx, 0, 2, 16, 13, "#8d6e63");
  fillEllipse(ctx, 10, -4, 10, 9, "#f5f0e6");
  fillEllipse(ctx, 2, 6, 8, 6, "#a1887f");
  eye(ctx, 12, -5, 4.2, 1.8);
  ctx.fillStyle = "#f9a825";
  ctx.beginPath();
  ctx.moveTo(18, -2);
  ctx.lineTo(32, 2);
  ctx.lineTo(20, 6);
  ctx.lineTo(18, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e65100";
  ctx.beginPath();
  ctx.moveTo(26, 2);
  ctx.quadraticCurveTo(30, 8, 22, 7);
  ctx.lineTo(20, 5);
  ctx.closePath();
  ctx.fill();
  fillEllipse(ctx, 4, 14, 4, 3, "#f9a825");
}

function drawKong(ctx, flap) {
  const swing = flap * 0.9;
  ctx.fillStyle = "#4e342e";
  ctx.beginPath();
  ctx.ellipse(-16, 8, 10, 7, 0.4 + swing, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 10, 10, 7, -0.5 - swing, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, -22, 12 + swing * 6, 5, "#3e2723");
  fillCircle(ctx, 22, 14 - swing * 6, 5, "#3e2723");
  fillEllipse(ctx, 0, 6, 16, 15, "#5d4037");
  fillEllipse(ctx, 1, 10, 10, 8, "#a1887f");
  fillEllipse(ctx, 0, -8, 13, 11, "#6d4c41");
  fillEllipse(ctx, 1, -6, 9, 8, "#d7ccc8");
  fillEllipse(ctx, -9, -12, 4, 5, "#5d4037", -0.4);
  fillEllipse(ctx, 9, -12, 4, 5, "#5d4037", 0.4);
  fillCircle(ctx, -4, -8, 2.4, "#1e293b");
  fillCircle(ctx, 4, -8, 2.4, "#1e293b");
  fillCircle(ctx, -1, -3, 1.4, "#4e342e");
  fillCircle(ctx, 2, -3, 1.4, "#4e342e");
  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.ellipse(0, 1, 4, 2.2, 0, 0, Math.PI);
  ctx.fill();
  fillEllipse(ctx, -6, 18, 5, 3, "#3e2723");
  fillEllipse(ctx, 6, 18, 5, 3, "#3e2723");
}

function drawPhoenix(ctx, flap) {
  ctx.fillStyle = "#fb8c00";
  ctx.beginPath();
  ctx.moveTo(-8, 6);
  ctx.quadraticCurveTo(-28, 18 + flap * 8, -10, 20);
  ctx.quadraticCurveTo(-4, 14, 2, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.moveTo(-4, 6);
  ctx.quadraticCurveTo(-18, 16 + flap * 6, -6, 16);
  ctx.closePath();
  ctx.fill();
  const ang = -0.55 - flap;
  fillEllipse(ctx, -4, 0, 20, 8, "#e53935", ang);
  fillEllipse(ctx, -6, 2, 14, 5, "#ff8a65", ang + 0.12);
  fillEllipse(ctx, 2, 0, 15, 12, "#ff7043");
  fillEllipse(ctx, 8, -6, 9, 8, "#ffcc80");
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.moveTo(6, -14);
  ctx.lineTo(10, -22);
  ctx.lineTo(12, -13);
  ctx.lineTo(16, -20);
  ctx.lineTo(15, -11);
  ctx.closePath();
  ctx.fill();
  eye(ctx, 10, -6, 4, 1.7);
  ctx.fillStyle = "#ffeb3b";
  ctx.beginPath();
  ctx.moveTo(16, -3);
  ctx.lineTo(28, 1);
  ctx.lineTo(16, 5);
  ctx.closePath();
  ctx.fill();
}

function drawOwl(ctx, flap) {
  wingPair(ctx, flap, "#8d6e63", "#5d4037", 13, 8, 4);
  fillEllipse(ctx, 0, 2, 16, 16, "#a1887f");
  fillEllipse(ctx, 0, 8, 10, 8, "#efebe9");
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.moveTo(-10, -12);
  ctx.lineTo(-4, -18);
  ctx.lineTo(-2, -10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, -12);
  ctx.lineTo(4, -18);
  ctx.lineTo(2, -10);
  ctx.closePath();
  ctx.fill();
  fillCircle(ctx, -6, -2, 7, "#fff8e1");
  fillCircle(ctx, 6, -2, 7, "#fff8e1");
  fillCircle(ctx, -6, -2, 5.2, "#ffcc80");
  fillCircle(ctx, 6, -2, 5.2, "#ffcc80");
  fillCircle(ctx, -5, -2, 2.4, "#1e293b");
  fillCircle(ctx, 7, -2, 2.4, "#1e293b");
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.moveTo(-2, 4);
  ctx.lineTo(0, 10);
  ctx.lineTo(2, 4);
  ctx.closePath();
  ctx.fill();
}

function drawPenguin(ctx, flap) {
  fillEllipse(ctx, 0, 1, 14, 17, "#263238");
  fillEllipse(ctx, 1, 5, 9, 12, "#eceff1");
  const flip = -0.2 - flap * 0.7;
  fillEllipse(ctx, -12, 4, 8, 5, "#37474f", flip);
  fillEllipse(ctx, 12, 4, 8, 5, "#37474f", -flip);
  fillEllipse(ctx, 0, -12, 10, 9, "#263238");
  fillEllipse(ctx, 3, -11, 5, 4, "#eceff1");
  eye(ctx, 4, -13, 3.2, 1.5);
  ctx.fillStyle = "#ff8f00";
  ctx.beginPath();
  ctx.moveTo(6, -10);
  ctx.lineTo(18, -8);
  ctx.lineTo(6, -6);
  ctx.closePath();
  ctx.fill();
  fillEllipse(ctx, -5, 16, 5, 3, "#ff8f00", 0.2);
  fillEllipse(ctx, 5, 16, 5, 3, "#ff8f00", -0.2);
}

export function paintCreature(ctx, species, width, height, flap = 0.25) {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2 + 2);
  const scale = Math.min(width, height) / 52;
  ctx.scale(scale, scale);
  drawCreature(ctx, species, flap);
  ctx.restore();
}

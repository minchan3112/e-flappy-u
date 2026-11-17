import { CHARACTERS, LEGACY_CHARACTER_IDS } from "./brand.js";
import { paintCreature } from "./creatures.js";

export const AVATAR_SIZE = 32;
export const CHARACTER_IDS = [...CHARACTERS.map((c) => c.id), ...Object.keys(LEGACY_CHARACTER_IDS)];

export function resolveCharacterId(id) {
  if (LEGACY_CHARACTER_IDS[id]) return LEGACY_CHARACTER_IDS[id];
  if (CHARACTERS.some((c) => c.id === id)) return id;
  return "sky";
}

export function characterIdFromRow(row) {
  if (row?.characterId) return resolveCharacterId(row.characterId);
  const byName = CHARACTERS.find((c) => c.name === row?.character);
  if (byName) return byName.id;
  const lower = String(row?.character || "").toLowerCase();
  const byId = CHARACTERS.find((c) => c.id === lower);
  return resolveCharacterId(byId?.id || "sky");
}

export function appearanceLabel(row) {
  const preset = CHARACTERS.find((c) => c.id === characterIdFromRow(row));
  return preset?.name || row?.character || CHARACTERS[0].name;
}

export function drawPresetIcon(ctx, characterId, destX = 0, destY = 0, pixelSize = 1) {
  const size = 32 * pixelSize;
  const look = CHARACTERS.find((c) => c.id === resolveCharacterId(characterId)) || CHARACTERS[0];
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.translate(destX, destY);
  paintCreature(ctx, look.species, size, size, 0.2);
  ctx.restore();
}

export function paintAvatarCanvas(canvas, row) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.width / AVATAR_SIZE;
  drawPresetIcon(ctx, characterIdFromRow(row), 0, 0, scale);
}

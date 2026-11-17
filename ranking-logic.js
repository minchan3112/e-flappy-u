import { appearanceLabel, CHARACTER_IDS, resolveCharacterId } from "./avatar.js";

const TZ = "Asia/Tokyo";
const MS_DAY = 86400000;

function jstParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const num = (type) => Number(parts.find((p) => p.type === type)?.value);
  return { year: num("year"), month: num("month"), day: num("day") };
}

function jstUtcNoon(date = new Date()) {
  const { year, month, day } = jstParts(date);
  return Date.UTC(year, month - 1, day, 12);
}

/** ISO週（月曜始まり・日本時間）例: 2026-W47 */
export function weekId(date = new Date()) {
  const utc = jstUtcNoon(date);
  const isoDay = new Date(utc).getUTCDay() || 7;
  const thursday = utc + (4 - isoDay) * MS_DAY;
  const year = new Date(thursday).getUTCFullYear();
  const jan4 = Date.UTC(year, 0, 4, 12);
  const jan4Iso = new Date(jan4).getUTCDay() || 7;
  const week1Thursday = jan4 + (4 - jan4Iso) * MS_DAY;
  const week = Math.round((thursday - week1Thursday) / (7 * MS_DAY)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function weekRangeLabel(date = new Date()) {
  const utc = jstUtcNoon(date);
  const isoDay = new Date(utc).getUTCDay() || 7;
  const monday = utc - (isoDay - 1) * MS_DAY;
  const sunday = monday + 6 * MS_DAY;
  const fmt = (stamp) => {
    const d = new Date(stamp);
    return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  };
  return `${fmt(monday)}〜${fmt(sunday)}`;
}

export function parseScope(value) {
  return value === "all" ? "all" : "week";
}

export function ranked(scores, scope = "week", date = new Date()) {
  const week = weekId(date);
  const rows =
    scope === "all"
      ? [...scores]
      : scores.filter((row) => row.weekId === week && Number(row.weeklyScore) > 0);
  const key = scope === "all" ? "bestScore" : "weeklyScore";
  return rows.sort((a, b) => (b[key] || 0) - (a[key] || 0) || a.name.localeCompare(b.name)).slice(0, 20);
}

export function rankingPayload(scores, scope = "week", date = new Date()) {
  const parsedScope = parseScope(scope);
  return {
    weekId: weekId(date),
    weekLabel: weekRangeLabel(date),
    scope: parsedScope,
    list: ranked(scores, parsedScope, date),
  };
}

export function parseScorePayload(body) {
  const name = String(body.name || "").trim().slice(0, 20);
  const department = String(body.department || "").trim().slice(0, 24);
  const score = Number(body.score);
  if (name.length < 1 || !Number.isInteger(score) || score < 0 || score > 9999) {
    return { error: "名前またはスコアが不正です" };
  }

  const characterId = CHARACTER_IDS.includes(body.characterId) ? resolveCharacterId(body.characterId) : "sky";
  const character = appearanceLabel({ characterId, character: body.character });
  return { name, department, character, characterId, look: "preset", avatar: null, score };
}

export function upsertScore(scores, payload, date = new Date()) {
  const { name, department, character, characterId, score } = payload;
  const existing = scores.find((row) => row.name.toLowerCase() === name.toLowerCase());
  const now = date.toISOString();
  const week = weekId(date);
  const appearance = {
    department: department || existing?.department || "",
    character,
    characterId,
    look: "preset",
    avatar: null,
    lastScore: score,
    updatedAt: now,
  };

  if (existing) {
    if (existing.weekId && existing.weekId !== week && Number(existing.weeklyScore) > 0) {
      existing.history = [...(existing.history || []), { weekId: existing.weekId, score: existing.weeklyScore }].slice(-12);
    }
    const weeklyScore = existing.weekId === week ? Math.max(existing.weeklyScore || 0, score) : score;
    Object.assign(existing, appearance, {
      weekId: week,
      weeklyScore,
      bestScore: Math.max(existing.bestScore || 0, score),
    });
    return scores;
  }

  scores.push({
    name,
    bestScore: score,
    weeklyScore: score,
    weekId: week,
    history: [],
    ...appearance,
  });
  return scores;
}

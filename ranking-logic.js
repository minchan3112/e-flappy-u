export function ranked(scores) {
  return [...scores].sort((a, b) => b.bestScore - a.bestScore || a.name.localeCompare(b.name)).slice(0, 20);
}

export function upsertScore(scores, { name, department, character, score }) {
  const existing = scores.find((row) => row.name.toLowerCase() === name.toLowerCase());
  const now = new Date().toISOString();
  if (existing) {
    existing.department = department || existing.department;
    existing.character = character || existing.character;
    existing.lastScore = score;
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.updatedAt = now;
    return scores;
  }
  scores.push({
    name,
    department,
    character,
    lastScore: score,
    bestScore: score,
    updatedAt: now,
  });
  return scores;
}

export function parseScorePayload(body) {
  const name = String(body.name || "").trim().slice(0, 20);
  const department = String(body.department || "").trim().slice(0, 24);
  const character = String(body.character || "スカイ").trim().slice(0, 16);
  const score = Number(body.score);
  if (name.length < 1 || !Number.isInteger(score) || score < 0 || score > 9999) {
    return { error: "名前またはスコアが不正です" };
  }
  return { name, department, character, score };
}

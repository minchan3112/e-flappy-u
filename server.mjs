import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(ROOT, "data", "scores.json");
const PORT = Number(process.env.PORT || 5173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function readScores() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeScores(scores) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(scores, null, 2));
}

function ranked(scores) {
  return [...scores].sort((a, b) => b.bestScore - a.bestScore || a.name.localeCompare(b.name)).slice(0, 20);
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function handleRanking(req, res) {
  if (req.method === "GET") {
    json(res, 200, ranked(await readScores()));
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    json(res, 400, { error: "JSONが不正です" });
    return;
  }

  const name = String(body.name || "").trim().slice(0, 20);
  const department = String(body.department || "").trim().slice(0, 24);
  const character = String(body.character || "スカイ").trim().slice(0, 16);
  const score = Number(body.score);

  if (name.length < 1 || !Number.isInteger(score) || score < 0 || score > 9999) {
    json(res, 400, { error: "名前またはスコアが不正です" });
    return;
  }

  const scores = await readScores();
  const existing = scores.find((row) => row.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.department = department || existing.department;
    existing.character = character || existing.character;
    existing.lastScore = score;
    existing.bestScore = Math.max(existing.bestScore, score);
    existing.updatedAt = new Date().toISOString();
  } else {
    scores.push({
      name,
      department,
      character,
      lastScore: score,
      bestScore: score,
      updatedAt: new Date().toISOString(),
    });
  }
  await writeScores(scores);
  json(res, 200, ranked(scores));
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (url.pathname === "/") filePath = path.join(ROOT, "index.html");
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === "/api/ranking") {
      await handleRanking(req, res);
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    json(res, 500, { error: String(error.message || error) });
  }
});

server.listen(PORT, () => {
  console.log(`E Flappy U http://localhost:${PORT}`);
});

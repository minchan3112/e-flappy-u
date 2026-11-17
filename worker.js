import { parseScorePayload, parseScope, rankingPayload, upsertScore } from "./ranking-logic.js";

const KEY = "scores";

async function readScores(kv) {
  if (!kv) return [];
  const raw = await kv.get(KEY, { type: "json" });
  return Array.isArray(raw) ? raw : [];
}

function json(data, status = 200) {
  return Response.json(data, { status });
}

async function handleRanking(request, env) {
  const url = new URL(request.url);
  const scope = parseScope(url.searchParams.get("scope"));

  if (request.method === "GET") {
    return json(rankingPayload(await readScores(env.SCORES), scope));
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!env.SCORES) {
    return json({ error: "ランキングストレージが未設定です" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSONが不正です" }, 400);
  }

  const parsed = parseScorePayload(body);
  if (parsed.error) return json({ error: parsed.error }, 400);

  const scores = upsertScore(await readScores(env.SCORES), parsed);
  await env.SCORES.put(KEY, JSON.stringify(scores));
  return json(rankingPayload(scores, scope));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/ranking") {
      return handleRanking(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

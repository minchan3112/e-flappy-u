import { parseScorePayload, ranked, upsertScore } from "../../ranking-logic.js";

const KEY = "scores";

async function readScores(kv) {
  if (!kv) return [];
  const raw = await kv.get(KEY, { type: "json" });
  return Array.isArray(raw) ? raw : [];
}

function json(data, status = 200) {
  return Response.json(data, { status });
}

export async function onRequest({ request, env }) {
  if (request.method === "GET") {
    return json(ranked(await readScores(env.SCORES)));
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
  return json(ranked(scores));
}

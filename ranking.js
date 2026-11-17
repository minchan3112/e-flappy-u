import { appearanceLabel, paintAvatarCanvas } from "./avatar.js";

export function unwrapRanking(data, fallbackScope = "week") {
  if (Array.isArray(data)) {
    return { list: data, scope: "all", weekId: "", weekLabel: "" };
  }
  return {
    list: Array.isArray(data?.list) ? data.list : [],
    scope: data?.scope === "all" ? "all" : fallbackScope,
    weekId: data?.weekId || "",
    weekLabel: data?.weekLabel || "",
  };
}

export async function fetchRanking(scope = "week") {
  const res = await fetch(`/api/ranking?scope=${scope === "all" ? "all" : "week"}`);
  if (!res.ok) throw new Error("ランキングを読み込めませんでした");
  return unwrapRanking(await res.json(), scope);
}

export async function submitScore(payload, scope = "week") {
  const res = await fetch(`/api/ranking?scope=${scope === "all" ? "all" : "week"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("スコアを保存できませんでした");
  return unwrapRanking(await res.json(), scope);
}

export function renderRanking(payload, currentName, mount) {
  const { list, scope } = unwrapRanking(payload);
  syncRankingHint(payload);
  if (!list.length) {
    mount.innerHTML =
      scope === "week"
        ? `<p class="empty">今週はまだスコアがありません。最初の1人になりましょう！</p>`
        : `<p class="empty">まだスコアがありません。最初の1人になりましょう！</p>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  mount.innerHTML = list
    .map((row, i) => {
      const me = row.name === currentName ? " me" : "";
      const medal = medals[i] || `<span class="rank-num">${i + 1}</span>`;
      const label = appearanceLabel(row);
      const points = scope === "week" ? row.weeklyScore ?? 0 : row.bestScore;
      return `<article class="rank-row${me}">
        <div class="rank-pos">${medal}</div>
        <canvas class="rank-avatar" width="32" height="32" data-character-id="${escapeAttr(row.characterId || "")}" data-character="${escapeAttr(row.character || "")}" aria-hidden="true"></canvas>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <p>${escapeHtml(row.department || "社内")} · ${escapeHtml(label)}</p>
        </div>
        <span class="point-badge">⭐ ${points} 点</span>
      </article>`;
    })
    .join("");

  mount.querySelectorAll(".rank-avatar").forEach((canvas) => {
    paintAvatarCanvas(canvas, {
      characterId: canvas.dataset.characterId,
      character: canvas.dataset.character,
    });
  });
}

function syncRankingHint(payload) {
  const hint = document.getElementById("rank-week-hint");
  if (!hint) return;
  const { scope, weekLabel } = unwrapRanking(payload);
  hint.textContent =
    scope === "week"
      ? `${weekLabel ? `${weekLabel} · ` : ""}月曜 0:00（日本時間）にリセット。通算ベストは残します。`
      : "通算の自己ベストです。テスト分も履歴として残っています。";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

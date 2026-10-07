export async function fetchRanking() {
  const res = await fetch("/api/ranking");
  if (!res.ok) throw new Error("ランキングを読み込めませんでした");
  return res.json();
}

export async function submitScore(payload) {
  const res = await fetch("/api/ranking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("スコアを保存できませんでした");
  return res.json();
}

export function renderRanking(list, currentName, mount) {
  if (!list.length) {
    mount.innerHTML = `<p class="empty">まだスコアがありません。最初の1人になりましょう！</p>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  mount.innerHTML = list
    .map((row, i) => {
      const me = row.name === currentName ? " me" : "";
      const medal = medals[i] || `<span class="rank-num">${i + 1}</span>`;
      return `<article class="rank-row${me}">
        <div class="rank-pos">${medal}</div>
        <div>
          <strong>${escapeHtml(row.name)}</strong>
          <p>${escapeHtml(row.department || "社内")} · ${escapeHtml(row.character)}</p>
        </div>
        <span class="point-badge">⭐ ${row.bestScore} 点</span>
      </article>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

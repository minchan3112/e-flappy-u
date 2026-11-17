/** 会社名・ゲーム名・ロゴ・キャッチコピーをここで変更します。 */
export const BRAND = {
  company: "EFU",
  product: "E Flappy U",
  initials: "EF",
  tagline: "社内チャレンジ · チームで空を飛ぼう",
  footer: "社内利用専用 · 金銭・景品との交換はありません",
};

export const CHARACTERS = [
  { id: "sky", name: "スカイ", species: "sky", team: "草原", body: "#ffd166" },
  { id: "eagle", name: "イーグル", species: "eagle", team: "山岳", body: "#8d6e63" },
  { id: "kong", name: "キングコング", species: "kong", team: "都市", body: "#5d4037" },
  { id: "phoenix", name: "フェニックス", species: "phoenix", team: "火山", body: "#ff7043" },
  { id: "owl", name: "オウル", species: "owl", team: "夜の森", body: "#a1887f" },
  { id: "penguin", name: "ペンギン", species: "penguin", team: "北極", body: "#263238" },
];

/** 以前のチーム色キャラを新しい種族へ割り当てます。 */
export const LEGACY_CHARACTER_IDS = {
  leaf: "eagle",
  ember: "phoenix",
  nova: "owl",
  cloud: "penguin",
};

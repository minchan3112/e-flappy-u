# E Flappy U

EFU 社内向けの Flappy Bird 風ゲームです。名前登録、キャラクター選択、サウンド、得点に応じた難易度上昇、社内サーバー上の共通ランキングに対応しています。

## ローカル / 社内 LAN で起動

```bash
npm run dev
```

[http://localhost:5173](http://localhost:5173) を開きます。社内ネットワーク上の他の端末は、このサーバーの IP を指定すれば同じランキングでプレイできます。

## GitHub と Cloudflare Pages にデプロイ

コードは GitHub の [`minchan3112/e-flappy-u`](https://github.com/minchan3112/e-flappy-u) にあります。本番では Cloudflare Pages が静的ファイルを配信し、ランキング API は KV に保存します。

### 1. GitHub に最新コードを載せる

```bash
git add .
git commit -m "Add Cloudflare Pages ranking API"
git push origin main
```

### 2. Cloudflare にログイン

1. [Cloudflare Dashboard](https://dash.cloudflare.com) でアカウントを作成 / ログイン
2. ターミナルで `npx wrangler login`

### 3. KV（ランキング保存）を作る

```bash
npx wrangler kv namespace create SCORES
```

表示された `id` を `wrangler.toml` のコメントを外して貼ります。

```toml
[[kv_namespaces]]
binding = "SCORES"
id = "ここにKVのID"
```

### 4. Pages に接続（ダッシュボード）

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub リポジトリ `e-flappy-u` を選ぶ
3. 設定:
   - Framework preset: `None`
   - Build command: （空）
   - Build output directory: `/`
4. **Save and Deploy**
5. プロジェクトの **Settings → Bindings → KV Namespace** で `SCORES` を同じ KV に接続し、再デプロイ

完了後、`https://<project>.pages.dev` でプレイできます。

CLI から出す場合:

```bash
npm run deploy
```

## 会社ブランディング

`brand.js` で会社名、ゲーム名、ロゴのイニシャル、キャッチコピーを変更できます。

## 遊び方

1. 社員名を入力します（部署は任意）
2. キャラクターを選びます：スカイ、リーフ、エンバー、ノヴァ、クラウド
3. タップまたはスペースでジャンプします
4. 得点が上がるとパイプが速くなり、すき間が狭くなります
5. 各プレイヤーの自己ベストは EFU ランキングに表示されます

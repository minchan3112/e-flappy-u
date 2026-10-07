# E Flappy U — Presentation Report

> **Mục đích:** Tài liệu hỗ trợ thuyết trình khoảng **8 phút** về dự án E Flappy U.  
> **Repository:** https://github.com/minchan3112/e-flappy-u

---

## 1. Dự án này là gì?

**E Flappy U** là một game web nội bộ lấy cảm hứng từ Flappy Bird.

Mục tiêu không chỉ là tạo một game đơn giản, mà còn thêm một số yếu tố phù hợp với môi trường nội bộ:

- Nhập tên người chơi và bộ phận.
- Chọn 1 trong 5 nhân vật.
- Chơi trực tiếp trên trình duyệt.
- Hỗ trợ **tap / Space / Arrow Up** để bay.
- Độ khó tăng dần theo điểm.
- Có âm thanh và nút mute.
- Lưu profile người chơi trên trình duyệt.
- Lưu **best score** trên server.
- Có **ranking dùng chung** cho những người chơi cùng server/LAN.
- Có thể thay đổi tên game, logo và branding thông qua `brand.js`.

### Một câu giới thiệu ngắn

> **「E Flappy Uは、社内で気軽に遊べるFlappy Bird風のWebゲームで、個人のハイスコアをサーバー側で共有できるようにしたプロジェクトです。」**

---

## 2. Người dùng sử dụng như thế nào?

### User Flow

```text
              ┌─────────────────┐
              │  Play Registration │
              │ 名前 / 部署 / キャラ │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │    Game Start   │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │   Flappy Game   │
              │  Tap / Space / ↑│
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Score increases │
              │ Difficulty ↑    │
              └────────┬────────┘
                       ↓
                 ┌─────┴─────┐
                 │ Game Over │
                 └─────┬─────┘
                       ↓
              ┌─────────────────┐
              │ POST /api/ranking│
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Server saves    │
              │ bestScore       │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ EFU Ranking     │
              └─────────────────┘
```

---

# 3. システム構成

## Frontend

ブラウザ側では主に以下を担当します。

| File | Role |
|---|---|
| `index.html` | 画面のHTML構造 |
| `styles.css` | UI / レスポンシブデザイン |
| `game.js` | ゲーム本体・ゲームループ・入力・衝突判定 |
| `ranking.js` | Ranking APIとの通信・ランキング表示 |
| `audio.js` | Web Audio APIによる効果音 |
| `brand.js` | 会社名・ゲーム名・キャラクター設定 |

## Backend

| File | Role |
|---|---|
| `server.mjs` | HTTP server + Static file server + Ranking API |
| `data/scores.json` | Ranking data |

### 構成イメージ

```text
Browser
  │
  │ HTML / CSS / JavaScript
  │
  ▼
┌──────────────────────────┐
│       E Flappy U         │
│                          │
│  index.html              │
│  styles.css              │
│  game.js                 │
│  ranking.js              │
│  audio.js                │
└────────────┬─────────────┘
             │
             │ GET /api/ranking
             │ POST /api/ranking
             ▼
┌──────────────────────────┐
│       server.mjs         │
│                          │
│  Ranking API             │
│  Static File Server      │
└────────────┬─────────────┘
             │
             ▼
       data/scores.json
```

---

# 4. ゲームロジック

## 基本パラメータ

`game.js` では、ゲームの基本的なパラメータを定義しています。

- Canvas: **480 × 700**
- Gravity: **0.42**
- Flap velocity: **-7.4**
- Bird position: X = **110**
- Pipe width: **68**
- Ground height: **96**

### 基本的な動き

ゲーム中は `requestAnimationFrame()` を利用してゲームループを回しています。

大まかには、

```text
update()
   ↓
bird velocity に gravity を加える
   ↓
bird position を更新
   ↓
pipe を左に移動
   ↓
score / collision をチェック
   ↓
draw()
   ↓
requestAnimationFrame()
   ↓
update() ...
```

という流れです。

---

# 5. 難易度調整

このゲームの特徴の一つが、**scoreに応じて自動的に難しくなること**です。

`getDifficulty(score)` では、

- pipe speed
- pipe gap
- pipe spawn interval

を score から計算しています。

### イメージ

```text
Score 0
  ↓
Speed: 約 2.35
Gap: 168
Spawn interval: 92

        ↓ Score increases

Score 10
  ↓
Speed ↑
Gap ↓
Spawn interval ↓

        ↓

Score 20+
  ↓
さらに速くなる
さらに隙間が狭くなる
さらに短い間隔でPipeが出る
```

つまり、

> **「長くプレイするほど難しくなる」**

という、シンプルですがゲームとして重要な仕組みを入れています。

---

# 6. Collision Detection

ゲームオーバーになる条件は主に3つです。

1. 地面に当たる
2. 画面上端に当たる
3. Pipeに当たる

Pipeの場合は、Birdの矩形範囲とPipeのX方向の範囲を確認し、

```text
BirdがPipeのX範囲に入っている
            +
BirdがGapの中にいない
            ↓
          Collision
            ↓
        Game Over
```

という判定をしています。

---

# 7. Ranking機能

RankingはFrontendとBackendを分けています。

## GET

ランキング画面を表示すると、

```http
GET /api/ranking
```

を呼び出してserverからrankingを取得します。

## POST

ゲームオーバーになると、

```http
POST /api/ranking
```

で、

```json
{
  "name": "Player Name",
  "department": "Department",
  "character": "Sky",
  "score": 10
}
```

のような情報を送信します。

Server側では、

- 名前
- 部署
- キャラクター
- lastScore
- bestScore
- updatedAt

を管理します。

同じ名前のプレイヤーが存在する場合は、新しいスコアがbest scoreを超えたときだけbest scoreを更新します。

---

# 8. なぜServerを用意したのか？

単純なブラウザゲームだけなら、scoreをlocalStorageに保存することもできます。

しかし、それでは**自分のブラウザの中だけのRanking**になります。

今回のプロジェクトでは、

> **「社内の複数人が同じRankingを見る」**

ことを目的としているため、server側にRanking dataを保存しています。

READMEにもある通り、同じ社内LAN上の端末からserverのIPを指定すれば、共通Rankingを利用できます。

---

# 9. LocalStorageの利用

一方、ユーザー情報については `localStorage` を使用しています。

保存する情報は、

- name
- department
- characterId

です。

そのため、同じブラウザで再度アクセスした場合でも、前回のプレイヤー情報を復元できます。

### 使い分け

```text
localStorage
    ↓
「この端末のユーザー情報」

server / scores.json
    ↓
「社内で共有するRanking情報」
```

という役割分担になっています。

---

# 10. Character / Branding

`brand.js` にゲーム固有の設定をまとめています。

### Branding

- company
- product
- initials
- tagline
- footer

### Characters

現在は5種類あります。

| Character | Team |
|---|---|
| スカイ | CS |
| リーフ | 開発 |
| エンバー | 営業 |
| ノヴァ | デザイン |
| クラウド | 運用 |

そのため、ゲーム本体のロジックを大きく変更せずに、会社やゲームの見た目・キャラクターを変更できます。

---

# 11. Audio

`audio.js` では外部の音声ファイルを使わず、**Web Audio API** を利用して効果音を生成しています。

主な効果音：

- UI操作
- Flap
- Score
- Crash

また、mute機能も実装しています。

この方式にすることで、音声ファイルを大量にRepositoryへ置かなくても、簡単な効果音を実現できます。

---

# 12. セキュリティ / 入力値チェック

Server側では最低限の入力値チェックも行っています。

例えば、

- nameの最大長
- departmentの最大長
- characterの最大長
- scoreが整数か
- scoreが0以上9999以下か

などを確認しています。

また、Ranking表示時には `escapeHtml()` を使用して、ユーザー名などをそのままHTMLとして解釈しないようにしています。

---

# 13. 起動方法

Node.jsがインストールされている環境で、

```bash
npm run dev
```

を実行します。

Serverが起動すると、

```text
http://localhost:5173
```

からアクセスできます。

同じLAN上の他の端末から利用する場合は、serverを起動しているPCのIPアドレスを指定します。

---

# 14. 8分プレゼンテーション構成

## 0:00 – 0:40　① Introduction

### 話す内容

> 今回紹介するのは「E Flappy U」という社内向けのWebゲームです。
>
> Flappy Birdのようなシンプルなゲームですが、ただ一人で遊ぶだけではなく、社員名やキャラクターを登録して、社内で共通のランキングを見られるようにしています。
>
> 今回は、ゲームの概要と、どのような構成で動いているかを簡単に紹介します。

**画面:** GitHubのREADMEまたは実際のゲーム画面

---

## 0:40 – 1:30　② Why / Concept

### 話す内容

> このプロジェクトでは、「社内で気軽に遊べる」ということを重視しました。
>
> そのため、ブラウザだけで動いて、登録も簡単にしてあります。
>
> また、一人で遊ぶだけではなく、ランキングを共有することで、「他の人より高いスコアを出したい」というちょっとした競争要素も入れています。

**見せる:** Player Registration + Ranking

---

## 1:30 – 2:20　③ User Flow

### 話す内容

> 実際の利用方法はシンプルです。
>
> 最初に名前と部署を入力して、キャラクターを選びます。
>
> その後ゲームを開始して、タップ、Space、または上矢印でキャラクターを操作します。
>
> Pipeを通過すると1点入り、ゲームオーバーになるとスコアがサーバーに送信されます。
>
> その後、自己ベストがRankingに反映されます。

**見せる:** report.md のUser Flow

---

## 2:20 – 3:20　④ System Architecture

### 話す内容

> 構成としては、FrontendとBackendに分かれています。
>
> FrontendではHTML、CSS、JavaScriptを使用しています。
>
> ゲーム自体はCanvas APIを使って描画しています。
>
> BackendはNode.jsのserver.mjsで、Static file serverとRanking APIを提供しています。
>
> Ranking dataはscores.jsonに保存しています。
>
> なので、Reactや大きなFrameworkを使わず、比較的シンプルな構成になっています。

**見せる:** System Architecture

---

## 3:20 – 4:30　⑤ Game Logic

### 話す内容

> ゲームの中心となる処理はgame.jsです。
>
> requestAnimationFrameを使って、毎フレームごとにゲームの状態を更新して描画しています。
>
> 例えば、Birdにはgravityがかかっていて、Spaceを押すと上方向のvelocityを与えます。
>
> Pipeは左方向に移動して、BirdとのCollisionをチェックします。
>
> 地面、画面上端、Pipeに当たるとGame Overになります。

**見せる:** game.jsの該当箇所

---

## 4:30 – 5:20　⑥ Difficulty

### 話す内容

> もう一つ工夫したところが難易度調整です。
>
> scoreが増えるほどPipeの速度が上がり、Pipeの隙間が狭くなります。
>
> また、Pipeが生成される間隔も短くなります。
>
> そのため、最初は簡単ですが、スコアが高くなるほど難しくなる設計です。

**見せる:** getDifficulty()

---

## 5:20 – 6:30　⑦ Ranking / Backend

### 話す内容

> Game Overになると、FrontendからPOST /api/rankingを呼び出します。
>
> Server側ではプレイヤーを検索して、今回のスコアがBest Scoreより高ければ更新します。
>
> Ranking画面ではGET /api/rankingでデータを取得します。
>
> ここでlocalStorageではなくserver側に保存しているのがポイントです。
>
> localStorageだけだと自分のブラウザだけのRankingになりますが、server側に保存することで、同じLAN上のユーザーでRankingを共有できます。

**見せる:** Ranking APIの流れ

---

## 6:30 – 7:20　⑧ Other Features

### 話す内容

> その他にも、ユーザー情報はlocalStorageに保存して、次回アクセス時に復元できるようにしています。
>
> また、Web Audio APIによる効果音、Mute機能、5種類のキャラクター、会社名やゲーム名をまとめて変更できるBrand設定なども用意しています。
>
> UIについてはCSSでレスポンシブ対応しているため、PCだけでなくスマートフォンでも遊べるようにしています。

---

## 7:20 – 8:00　⑨ Conclusion

### 話す内容

> まとめると、E Flappy Uは単純なゲームですが、
>
> 「ゲーム部分」
> 「ユーザー情報」
> 「Server API」
> 「共通Ranking」
>
> という複数の要素を一つのWebアプリとしてまとめています。
>
> 特に、FrontendからBackend APIを呼び出してRankingを共有することで、単純なブラウザゲームから、社内で複数人が遊べるアプリケーションにしています。
>
> 今後さらに拡張するのであれば、RankingのDB化、認証、管理画面、より高度なランキング機能などを追加できると思います。
>
> 以上です。ありがとうございました。

---

# 15. 発表中に見せるおすすめ順番

8分の場合、Repositoryの全ファイルを順番に説明する必要はありません。

以下の順番がおすすめです。

### ① 実際のゲーム画面

最初に実際に動くところを見せる。

### ② Player Registration

名前・部署・Character選択。

### ③ Game

実際に1回プレイ。

可能なら、

> 「ここで1点入るとPipeの速度が少し上がります」

と実演する。

### ④ Ranking

Game Over後にRankingが更新されるところを見せる。

### ⑤ report.md

ここからreport.mdを使って、

- User Flow
- Architecture
- Game Logic
- Difficulty
- Ranking API

を説明する。

### ⑥ GitHub Code

コードを細かく全部説明するのではなく、

- `game.js`
- `server.mjs`
- `ranking.js`

の3ファイルだけを中心に見せる。

---

# 16. 質疑応答で聞かれそうな質問

## Q1. なぜReactを使わなかった？

> 今回はゲーム自体のロジックとWeb APIの仕組みをシンプルに見せることを優先して、Vanilla JavaScriptで実装しています。
>
> 規模が大きくなればReactなどのFrameworkを導入する選択肢もあると思います。

## Q2. なぜDBを使っていない？

> 今回は社内向けの小規模なPoCという位置付けなので、JSONファイルでシンプルに実装しています。
>
> 本番運用するのであれば、同時アクセスやデータ整合性を考えてDBを利用するべきだと思います。

## Q3. 複数人が同時にプレイできる？

> ゲーム自体は各ブラウザで独立して動きます。
>
> Rankingは同じserverのAPIを利用するため、同じserverに接続しているユーザー間で共有できます。

## Q4. データはどこに保存される？

> ユーザーのprofile情報は各ブラウザのlocalStorage、Ranking情報はserver側のscores.jsonに保存しています。

## Q5. どこを一番工夫した？

> 単純なゲームを作るだけではなく、社内利用を想定して「共通Ranking」を追加したところです。
>
> そのためFrontendとBackendを分けて、API経由でスコアを共有する構成にしました。

---

# 17. 今後の改善案

PoCから実用的な社内アプリにする場合、以下の拡張が考えられます。

1. **Database化**
   - SQLite / PostgreSQLなど
   - JSON fileからDBへ移行

2. **Authentication**
   - 社員アカウントとの連携
   - 他人の名前を使った投稿を防止

3. **Rankingの高度化**
   - Daily / Weekly / Monthly ranking
   - 部署別 ranking
   - 過去最高記録

4. **管理画面**
   - Ranking dataの確認
   - 不正データの削除

5. **Deploy**
   - 社内serverまたはCloudへDeploy

6. **Testing**
   - Game logic
   - Difficulty calculation
   - Ranking API
   - Input validation

---

# 18. 最後に覚えておくポイント

8分の発表では、細かいコードを全部説明する必要はありません。

以下の5点を説明できれば十分です。

> **① 何を作ったか**  
> → 社内向けFlappy Bird風Webゲーム

> **② どう使うか**  
> → 登録 → Character選択 → Play → Game Over → Ranking

> **③ どういう構成か**  
> → Browser + JavaScript + Node.js Server + JSON

> **④ 工夫したところ**  
> → Difficulty / Shared Ranking / LocalStorage / Audio

> **⑤ 今後どうできるか**  
> → DB / Authentication / Ranking強化 / Testing / Deploy

---

## One-line Summary

> **E Flappy Uは、シンプルなブラウザゲームをベースに、Frontend・Backend API・データ保存・共通Rankingまでを一つの小規模なWebアプリとして実装した社内向けPoCです。**

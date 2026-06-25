# MOTIO 📌

**締切の優先順位と今日の持ち物を自動で段取りする、若者特化カレンダー PWA。**

予定を登録するだけで、「何を今すぐやるべきか」「明日何を持っていくか」を自動で整理します。

🔗 **本番URL**: https://calender-app-neon.vercel.app/

---

## スクリーンショット

| ホーム | 締切リスト | 予定追加 |
|---|---|---|
| 最優先タスク1件 + 今日の予定 + 予定別持ち物 | 優先順位スコア順ソート | 予定 / 締切タスク を選んで入力 |

---

## 機能一覧

### 📅 予定管理
- 予定の登録・編集・削除（種別タグ付き）
- 種別：**授業 / 課題 / バイト / 就活 / 試験 / その他**
- FAB（＋）を押すと「予定」か「締切タスク」かを最初に選ぶ2ステップ入力

### 🗓️ カレンダー
- 月表示（日付ごとにカラードット）
- リスト表示（今日以降の予定を日付グループ表示）
- 日付タップ → その日の予定確認・追加

### 🔥 締切の優先順位ソート
締切がある予定を自動スコアリングして優先順位順に並べる。

```
スコア = 重要度×10 + max(0, 100 − 残り時間h) + 着手時間(分)÷30
```

- 完了済みは常に最下部
- `calcPriority(event)` として切り出し済み → Gemini 版に差し替え可能

### 📊 今週の負荷ビュー（締切ページ）
- 直近7日間の締切件数を棒グラフで可視化
- 同日3件以上の「ヤバい日」を赤バー＋アラートで警告し、早めの着手を促す

### 📚 時間割の一括登録
- FAB →「時間割をまとめて登録」で曜日×時限グリッドを入力
- 「○週間分まとめて登録」で学期分の授業予定を一気に生成（入力負荷を最小化）
- `seriesId` で生成シリーズを識別し、再登録時は既存の時間割を置き換え（重複防止）

### 🎒 持ち物の自動推論
種別ごとにテンプレートを自動提案。ホームに **予定ごとの持ち物** として表示。

| 種別 | 持ち物テンプレート |
|---|---|
| 授業 | 教科書・ノート・筆記用具・学生証 |
| 課題 | 提出物・USBメモリ・ノートPC |
| バイト | 制服・名札・印鑑 |
| 就活 | 履歴書・印鑑・スーツ・筆記用具・スマホ充電器 |
| 試験 | 受験票・筆記用具・時計・学生証 |

`inferItems(event)` として切り出し済み → Gemini API 版に差し替え可能（Phase 2）

### 🏠 ホーム画面
- **最優先1タスク**を大きく表示（情報過多を避けるため1件のみ）
- 今日の予定リスト（時刻順）
- **予定ごとの持ち物**（「授業：教科書・ノート」「バイト：制服・名札」と分けて表示）

### ⚙️ 設定
- Google ログイン（Firebase 有効時）
- 通知時刻設定 UI（FCM は Phase 2）

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロント | React 18 + Vite + TypeScript |
| スタイル | Tailwind CSS v4（`@tailwindcss/vite`） |
| 状態管理 | React hooks（useState / useReducer / Context）|
| 認証・DB | Firebase Auth + Firestore（任意） |
| AI | Gemini API（Phase 2 / 未設定はルールベースにフォールバック） |
| ホスティング | Vercel |

> **localStorage は一切使わない。** ログイン前はメモリ内 state、ログイン後は Firestore。

---

## ディレクトリ構成

```
src/
├── types/index.ts              # データモデル（EventItem / UserSettings）
├── lib/
│   ├── priority.ts             # calcPriority（ルールベース・AI差替可）
│   ├── items.ts                # inferItems（ルールベース・AI差替可）
│   ├── gemini.ts               # inferItems AI版スタブ（Phase 2）
│   ├── firebase.ts             # Firebase 初期化（未設定でもゲスト動作）
│   ├── eventTypes.ts           # 種別メタ・色・絵文字
│   ├── sampleData.ts           # ゲストモード用サンプル予定
│   └── utils.ts                # 日付・className ユーティリティ
├── hooks/
│   ├── useEvents.ts            # 予定 CRUD（メモリ ⇔ Firestore 自動切替）
│   └── useSettings.ts          # 設定（メモリ ⇔ Firestore 自動切替）
├── context/
│   └── AuthContext.tsx          # Google 認証コンテキスト
├── components/
│   ├── Calendar/               # 月表示 / リスト表示
│   ├── DeadlineList/           # 優先順位ソート済み締切一覧
│   ├── HomeBrief/              # 最優先タスク・今日の予定・予定別持ち物
│   ├── EventModal/             # 予定登録・編集フォーム + 種別セレクタ
│   ├── Settings/               # 設定画面
│   └── shared/                 # TypeBadge / EventRow / Modal / EmptyState
├── pages/                      # 薄いラッパー（Home / Calendar / Deadline / Settings）
├── App.tsx                     # タブルーティング・FAB・モーダル管理
└── main.tsx                    # エントリポイント（AuthProvider）
```

---

## セットアップ

```bash
git clone https://github.com/subaru323/calender-app.git
cd calender-app
npm install --registry=https://registry.npmmirror.com  # 低速環境の場合
npm run dev   # → http://localhost:5175
```

> `.env` が無くても **ゲストモード（メモリ内 state）** で全機能が動きます。サンプル予定が入った状態で起動します。

---

## 環境変数（任意）

`.env.example` を `.env` にコピーして値を入れることで機能が拡張されます。

```bash
cp .env.example .env
```

### Firebase（Google ログイン + Firestore 同期）

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase Console でプロジェクトを作成し、Authentication（Google）と Firestore を有効にしてください。
セキュリティルールは [`firestore.rules`](./firestore.rules) を適用してください（各ユーザーは自分の `users/{uid}` 配下のみ読み書き可）。

### Gemini API（AI 版持ち物推論 / Phase 2）

```env
VITE_GEMINI_API_KEY=
```

設定するだけで `inferItems()` がルールベースから Gemini 2.0 Flash による文脈推論に切り替わります。未設定時はルールベースにフォールバックするので、キーなしでも動作します。

---

## Vercel へのデプロイ

GitHub と Vercel を連携済みのため、**`git push` するだけで自動デプロイ**されます。

```bash
git add -A
git commit -m "変更内容"
git push   # → Vercel が自動でビルド → https://calender-app-neon.vercel.app/ に反映
```

Vercel の環境変数は Dashboard → Project → Settings → Environment Variables で設定してください。

---

## ロードマップ

- [x] 予定の登録・編集・削除（種別タグ付き）
- [x] カレンダー表示（月 / リスト切替）
- [x] 締切の優先順位ソート（ルールベース）
- [x] 持ち物の自動推論（種別テンプレート）
- [x] ホーム：最優先1タスク + 予定別持ち物表示
- [x] FAB → 予定 / 締切タスク / 時間割 選択セレクタ → モード別フォーム
- [x] 時間割の一括登録（曜日×時限グリッド → 学期分を自動生成）
- [x] 今週の負荷ビュー（締切の集中する「ヤバい日」を警告）
- [x] Vercel デプロイ・GitHub 連携
- [ ] Firebase 本番連携（Google ログイン + Firestore）
- [ ] Gemini API 持ち物推論（Phase 2）
- [ ] FCM プッシュ通知（前日夜サマリー・朝ブリーフ）

---

## スクリプト

```bash
npm run dev      # 開発サーバー（http://localhost:5175）
npm run build    # 型チェック + 本番ビルド
npm run preview  # ビルド結果のローカルプレビュー
npm run lint     # ESLint
```

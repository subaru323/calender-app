# MOTIO

> 締切の優先順位と「明日の持ち物」を自動で段取りする、若者特化カレンダー PWA。

予定を登録するだけで、AI（MVP はルールベース）が **締切の優先順位** と **持ち物** を組み立てます。

## 技術スタック

- **React 18 + Vite + TypeScript**（PWA 構成）
- **Tailwind CSS v4**（`@tailwindcss/vite`）
- 状態管理：React hooks（useState / Context）— 外部状態ライブラリなし
- **Firebase**（Auth + Firestore）— 任意。未設定ならゲストモードで動作
- AI：**Gemini API**（Phase 2。未設定はルールベースにフォールバック）

## セットアップ

```bash
npm install
npm run dev      # http://localhost:5173
```

`.env` が無くても **ゲストモード（メモリ内 state）** で全機能が動きます。
サンプル予定が入った状態で起動します。

### Firebase を有効にする（任意）

`.env.example` を `.env` にコピーして値を入れると、Google ログインと Firestore 同期が有効になります。

```bash
cp .env.example .env
```

Firestore のセキュリティルールは [`firestore.rules`](./firestore.rules) を参照（各ユーザーは自分の `users/{uid}` 配下のみ読み書き可）。

### Gemini を有効にする（任意 / Phase 2）

`.env` に `VITE_GEMINI_API_KEY` を設定すると、持ち物推論が `lib/gemini.ts`（AI 版）に切り替わります。
未設定なら `lib/items.ts`（ルールベース）が使われます。両者は同一 I/F `(event) => Promise<string[]>`。

## 設計のポイント（仕様書準拠）

| 仕様 | 実装 |
|---|---|
| データモデル | [`src/types/index.ts`](./src/types/index.ts) |
| 締切ソート（ルール → AI 差替可） | [`src/lib/priority.ts`](./src/lib/priority.ts) `calcPriority` |
| 持ち物推論（ルール → AI 差替可） | [`src/lib/items.ts`](./src/lib/items.ts) / [`src/lib/gemini.ts`](./src/lib/gemini.ts) |
| ログイン前=メモリ / 後=Firestore | [`src/hooks/useEvents.ts`](./src/hooks/useEvents.ts) |
| 画面（ホーム/カレンダー/締切/設定） | [`src/pages/`](./src/pages/) |

- **若者特化**：種別タグ（授業・課題・バイト・就活・試験・その他）に最適化。
- **朝は1タスクだけ**：ホームは最優先タスク1件を大きく表示（情報過多を回避）。
- **localStorage 不使用**：state または Firestore のみ。

## 未実装（今後）

- 通知（FCM + Service Worker）：前日夜サマリー・朝ブリーフ。`settings` に時刻設定 UI は用意済み。
- Gemini 連携の本番運用（スタブは実装済み）。

## スクリプト

```bash
npm run dev       # 開発サーバ
npm run build     # 型チェック + 本番ビルド
npm run preview   # ビルド結果のプレビュー
```

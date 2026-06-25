// ---- MOTIO データモデル（仕様書 Section 3）----

export type EventType =
  | "class" // 授業
  | "assignment" // 課題・提出物
  | "shift" // バイト
  | "jobhunt" // 就活（面接・説明会・ES）
  | "exam" // 試験
  | "personal"; // その他

export type Importance = 1 | 2 | 3; // 1=低 3=高

export interface EventItem {
  id: string; // 自動生成
  title: string; // 例: "情報処理 レポート提出"
  type: EventType; // 種別タグ
  date: string; // ISO8601 "2026-06-10"
  time?: string; // "13:00" 任意
  deadline?: string; // 締切日時 ISO8601（提出物系のみ）
  estimatedMinutes?: number; // 着手にかかる想定時間（締切ソート用）
  importance: Importance; // ユーザー設定の重要度
  done: boolean; // 完了フラグ
  items?: string[]; // 持ち物リスト（AI/ルールが生成）
  memo?: string;
  seriesId?: string; // 時間割などの一括生成シリーズ識別（"tt-..."）
  createdAt: number; // epoch ms
}

export interface UserSettings {
  nightSummaryTime: string; // "21:00" 前日夜通知の時刻
  morningBriefTime: string; // "07:30" 朝ブリーフの時刻
  notificationsEnabled: boolean;
}

/** 新規作成時の入力（id / createdAt はストア側で付与） */
export type EventDraft = Omit<EventItem, "id" | "createdAt">;

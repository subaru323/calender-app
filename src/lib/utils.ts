// ---- 汎用ユーティリティ（日付・クラス名・Firestore 整形）----

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** className を結合（falsy は除外） */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** ローカルタイムの YYYY-MM-DD（toISOString は UTC でズレるので使わない） */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

/** "YYYY-MM-DD" → ローカル Date（00:00） */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function weekdayJa(d: Date): string {
  return WEEKDAYS_JA[d.getDay()];
}

/** "2026-06-03" → "6/3(火)" */
export function formatDateJa(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}(${weekdayJa(d)})`;
}

/** 今日との相対表記（今日 / 明日 / 6/5(木)） */
export function relativeDateJa(key: string): string {
  const diff = Math.round(
    (parseDateKey(key).getTime() - parseDateKey(todayKey()).getTime()) / 86_400_000,
  );
  if (diff === 0) return "今日";
  if (diff === 1) return "明日";
  if (diff === 2) return "明後日";
  if (diff === -1) return "昨日";
  return formatDateJa(key);
}

export interface Countdown {
  label: string;
  urgent: boolean; // 24h 以内
  overdue: boolean;
}

/** 締切までの残り（ISO datetime） */
export function deadlineCountdown(deadlineISO: string, now: Date = new Date()): Countdown {
  const ms = new Date(deadlineISO).getTime() - now.getTime();
  if (ms <= 0) return { label: "期限切れ", urgent: true, overdue: true };
  const hours = ms / 3_600_000;
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return { label: h >= 1 ? `あと${h}時間` : `あと${m}分`, urgent: true, overdue: false };
  }
  const days = Math.floor(hours / 24);
  return { label: `あと${days}日`, urgent: days <= 2, overdue: false };
}

/** Firestore は undefined を弾くので除去する */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

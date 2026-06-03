import type { EventItem } from "../types";

/** 締切までの残り時間（h）。過去ならマイナス */
export function hoursUntil(deadlineISO: string, now: Date = new Date()): number {
  return (new Date(deadlineISO).getTime() - now.getTime()) / 3_600_000;
}

/**
 * 締切の優先順位スコア（仕様書 Section 4）。値が大きいほど優先。
 *
 *   score = importance*10
 *         + max(0, 100 - 残り時間h)        // 緊急度
 *         + estimatedMinutes / 30          // 着手コスト
 *
 * 将来 Gemini 版に差し替えられるよう、スコア算出はこの関数に集約する（絶対ルール3）。
 */
export function calcPriority(event: EventItem, now: Date = new Date()): number {
  const importanceScore = event.importance * 10;
  const remainingH = event.deadline ? hoursUntil(event.deadline, now) : Infinity;
  const urgencyScore = Number.isFinite(remainingH) ? Math.max(0, 100 - remainingH) : 0;
  const effortScore = (event.estimatedMinutes ?? 0) / 30;
  return importanceScore + urgencyScore + effortScore;
}

/** done を最下部に固定しつつ、スコア降順で並べる */
export function sortByPriority(events: EventItem[], now: Date = new Date()): EventItem[] {
  return [...events].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return calcPriority(b, now) - calcPriority(a, now);
  });
}

/** 締切を持つ予定だけを抽出（締切リスト対象） */
export function deadlineTasks(events: EventItem[]): EventItem[] {
  return events.filter((e) => !!e.deadline);
}

/** 締切を持たない予定（授業など、日付順で別枠表示する用） */
export function scheduleEvents(events: EventItem[]): EventItem[] {
  return events.filter((e) => !e.deadline);
}

/** 最優先の未完了締切タスク1件（朝ブリーフ用）。なければ null */
export function topPriorityTask(events: EventItem[], now: Date = new Date()): EventItem | null {
  const candidates = events.filter((e) => !e.done && e.deadline);
  if (candidates.length === 0) return null;
  return sortByPriority(candidates, now)[0] ?? null;
}

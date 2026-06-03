import type { EventItem, EventType } from "../types";

// 種別 → 持ち物テンプレ（仕様書 Section 5）
export const ITEM_TEMPLATES: Record<EventType, string[]> = {
  class: ["教科書", "ノート", "筆記用具", "学生証"],
  assignment: ["提出物", "USBメモリ", "ノートPC"],
  shift: ["制服", "名札", "印鑑"],
  jobhunt: ["履歴書", "印鑑", "スーツ", "筆記用具", "スマホ充電器"],
  exam: ["受験票", "筆記用具", "時計", "学生証"],
  personal: [],
};

/** 種別テンプレから即時に持ち物を返す（同期・入力補助用） */
export function inferItemsSync(type: EventType): string[] {
  return ITEM_TEMPLATES[type] ?? [];
}

/**
 * 持ち物推論（ルールベース）。
 * Phase 2 の AI 版（gemini.ts の inferItemsAI）と同一 I/F:
 *   (event: EventItem) => Promise<string[]>
 * にして差し替え可能にする（絶対ルール3）。
 */
export async function inferItems(event: EventItem): Promise<string[]> {
  return inferItemsSync(event.type);
}

import type { EventDraft, Importance } from "../types";
import { inferItemsSync } from "./items";
import { addDays, dateKey, parseDateKey } from "./utils";

export interface Period {
  label: string;
  time: string; // "09:00"
}

// 大学の一般的な時限（編集可能）
export const DEFAULT_PERIODS: Period[] = [
  { label: "1限", time: "09:00" },
  { label: "2限", time: "10:40" },
  { label: "3限", time: "13:00" },
  { label: "4限", time: "14:40" },
  { label: "5限", time: "16:20" },
];

export interface DayCol {
  weekday: number; // 0=日..6=土
  label: string;
}

export const WEEKDAY_COLS: DayCol[] = [
  { weekday: 1, label: "月" },
  { weekday: 2, label: "火" },
  { weekday: 3, label: "水" },
  { weekday: 4, label: "木" },
  { weekday: 5, label: "金" },
  { weekday: 6, label: "土" },
];

export interface TimetableCell {
  subject: string;
  room?: string;
}

/** key = `${weekday}-${periodIdx}` → セル */
export type TimetableGrid = Record<string, TimetableCell>;

export function cellKey(weekday: number, periodIdx: number): string {
  return `${weekday}-${periodIdx}`;
}

/** 時間割で一括生成したイベントの seriesId 接頭辞 */
export const TIMETABLE_SERIES_PREFIX = "tt-";

function nextWeekdayOnOrAfter(start: Date, weekday: number): Date {
  const diff = (weekday - start.getDay() + 7) % 7;
  return addDays(start, diff);
}

export interface GenerateOptions {
  grid: TimetableGrid;
  periods: Period[];
  startDate: string; // "YYYY-MM-DD"
  weeks: number;
  importance?: Importance;
}

/** 埋まっているセル数を数える */
export function countFilledCells(grid: TimetableGrid): number {
  return Object.values(grid).filter((c) => c.subject.trim()).length;
}

/**
 * 時間割グリッドを、指定週数ぶんの授業イベント（EventDraft[]）に展開する。
 * 各イベントは type="class"、その時限の開始時刻、授業の持ち物テンプレ付き。
 */
export function generateTimetableEvents(opts: GenerateOptions): EventDraft[] {
  const { grid, periods, startDate, weeks } = opts;
  const seriesId = `${TIMETABLE_SERIES_PREFIX}${Date.now()}`;
  const classItems = inferItemsSync("class");
  const start = parseDateKey(startDate);
  const drafts: EventDraft[] = [];

  for (const key of Object.keys(grid)) {
    const cell = grid[key];
    const subject = cell?.subject?.trim();
    if (!subject) continue;

    const [wdStr, pStr] = key.split("-");
    const weekday = Number(wdStr);
    const periodIdx = Number(pStr);
    const time = periods[periodIdx]?.time ?? "09:00";
    const base = nextWeekdayOnOrAfter(start, weekday);

    for (let w = 0; w < weeks; w++) {
      const d = addDays(base, w * 7);
      drafts.push({
        title: subject,
        type: "class",
        date: dateKey(d),
        time,
        importance: opts.importance ?? 1,
        done: false,
        items: classItems,
        seriesId,
        ...(cell.room?.trim() ? { memo: `教室: ${cell.room.trim()}` } : {}),
      });
    }
  }

  return drafts;
}

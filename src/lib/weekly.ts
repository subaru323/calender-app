import type { EventItem } from "../types";
import { addDays, dateKey, parseDateKey, todayKey } from "./utils";

const WD = ["日", "月", "火", "水", "木", "金", "土"];

export interface DayLoad {
  key: string; // "YYYY-MM-DD"
  weekdayLabel: string;
  dayNum: number;
  weekday: number; // 0=日..6=土
  count: number; // その日が締切の未完了タスク数
  isToday: boolean;
}

/** 締切日（ISO datetime の日付部分） */
function deadlineDateKey(e: EventItem): string | null {
  return e.deadline ? e.deadline.slice(0, 10) : null;
}

/** 今日から days 日分の「締切の負荷」を集計 */
export function weeklyLoad(events: EventItem[], days = 7): DayLoad[] {
  const today = parseDateKey(todayKey());
  const result: DayLoad[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(today, i);
    const key = dateKey(d);
    const count = events.filter(
      (e) => !e.done && e.deadline && deadlineDateKey(e) === key,
    ).length;
    result.push({
      key,
      weekdayLabel: WD[d.getDay()],
      dayNum: d.getDate(),
      weekday: d.getDay(),
      count,
      isToday: i === 0,
    });
  }
  return result;
}

/** 締切が集中する「ヤバい日」（threshold 件以上） */
export function busiestDays(load: DayLoad[], threshold = 3): DayLoad[] {
  return load.filter((d) => d.count >= threshold);
}

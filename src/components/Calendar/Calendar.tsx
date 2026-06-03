import { useMemo, useState } from "react";
import type { EventItem } from "../../types";
import { EVENT_TYPE_META } from "../../lib/eventTypes";
import {
  addDays,
  cn,
  dateKey,
  parseDateKey,
  relativeDateJa,
  startOfMonth,
  todayKey,
} from "../../lib/utils";
import { EventRow } from "../shared/EventRow";
import { EmptyState } from "../shared/EmptyState";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

type ViewMode = "month" | "list";

function buildMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const gridStart = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function Calendar({
  events,
  onSelectEvent,
  onAddOnDate,
}: {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onAddOnDate: (dateKey: string) => void;
}) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string>(todayKey());

  const byDate = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const selectedEvents = (byDate.get(selected) ?? []).sort((a, b) =>
    (a.time ?? "99:99").localeCompare(b.time ?? "99:99"),
  );

  const upcoming = useMemo(() => {
    const t = todayKey();
    return [...events]
      .filter((e) => e.date >= t)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.time ?? "99:99").localeCompare(b.time ?? "99:99"),
      );
  }, [events]);

  const groupedUpcoming = useMemo(() => {
    const groups: { date: string; items: EventItem[] }[] = [];
    for (const e of upcoming) {
      const last = groups[groups.length - 1];
      if (last && last.date === e.date) last.items.push(e);
      else groups.push({ date: e.date, items: [e] });
    }
    return groups;
  }, [upcoming]);

  return (
    <div className="space-y-4">
      {/* ヘッダー：月ナビ ＋ 表示切替 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="前の月"
            onClick={() => setCursor((c) => addDays(startOfMonth(c), -1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            ‹
          </button>
          <h2 className="min-w-[7.5rem] text-center text-lg font-bold text-slate-800">
            {cursor.getFullYear()}年{cursor.getMonth() + 1}月
          </h2>
          <button
            type="button"
            aria-label="次の月"
            onClick={() => setCursor((c) => startOfMonth(addDays(startOfMonth(c), 32)))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            ›
          </button>
        </div>
        <div className="flex rounded-full bg-slate-100 p-0.5 text-sm">
          {(["month", "list"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setView(m)}
              className={cn(
                "rounded-full px-3 py-1 font-medium transition",
                view === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500",
              )}
            >
              {m === "month" ? "月" : "リスト"}
            </button>
          ))}
        </div>
      </div>

      {view === "month" ? (
        <>
          <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
            {/* 曜日 */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
              {WEEKDAYS.map((w, i) => (
                <div
                  key={w}
                  className={cn(
                    "py-1.5",
                    i === 0 && "text-rose-400",
                    i === 6 && "text-sky-400",
                  )}
                >
                  {w}
                </div>
              ))}
            </div>
            {/* 日付グリッド */}
            <div className="grid grid-cols-7 gap-0.5">
              {grid.map((day) => {
                const key = dateKey(day);
                const inMonth = day.getMonth() === cursor.getMonth();
                const isToday = key === todayKey();
                const isSelected = key === selected;
                const dayEvents = byDate.get(key) ?? [];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelected(key)}
                    className={cn(
                      "flex aspect-square flex-col items-center justify-start gap-0.5 rounded-xl py-1 transition",
                      isSelected
                        ? "bg-brand-600 text-white"
                        : "hover:bg-slate-50",
                      !inMonth && !isSelected && "text-slate-300",
                      inMonth && !isSelected && "text-slate-700",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        isToday && !isSelected && "bg-brand-100 font-bold text-brand-700",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex h-1.5 items-center gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-white/80" : EVENT_TYPE_META[e.type].dot,
                          )}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 選択日の予定 */}
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-600">
                {relativeDateJa(selected)} の予定
              </h3>
              <button
                type="button"
                onClick={() => onAddOnDate(selected)}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                ＋ この日に追加
              </button>
            </div>
            {selectedEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedEvents.map((e) => (
                  <EventRow key={e.id} event={e} onSelect={onSelectEvent} />
                ))}
              </div>
            ) : (
              <EmptyState emoji="🗓️" title="この日の予定はありません" />
            )}
          </div>
        </>
      ) : (
        /* リスト表示：今日以降をまとめて */
        <div className="space-y-5">
          {groupedUpcoming.length > 0 ? (
            groupedUpcoming.map((g) => (
              <div key={g.date}>
                <h3 className="mb-2 px-1 text-sm font-bold text-slate-500">
                  {relativeDateJa(g.date)}
                  <span className="ml-2 font-normal text-slate-400">
                    {parseDateKey(g.date).getMonth() + 1}/{parseDateKey(g.date).getDate()}
                  </span>
                </h3>
                <div className="space-y-2">
                  {g.items.map((e) => (
                    <EventRow key={e.id} event={e} onSelect={onSelectEvent} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState emoji="🗓️" title="今後の予定はありません" />
          )}
        </div>
      )}
    </div>
  );
}

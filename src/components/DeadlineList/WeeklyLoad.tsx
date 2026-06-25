import type { EventItem } from "../../types";
import { busiestDays, weeklyLoad } from "../../lib/weekly";
import { cn } from "../../lib/utils";

export function WeeklyLoad({ events }: { events: EventItem[] }) {
  const load = weeklyLoad(events, 7);
  const total = load.reduce((s, d) => s + d.count, 0);
  const busy = busiestDays(load, 3);
  const max = Math.max(1, ...load.map((d) => d.count));

  if (total === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-600">今週の締切</h2>
        <span className="text-xs text-slate-400">
          直近7日で <span className="font-bold text-brand-600">{total}</span> 件
        </span>
      </div>

      {/* 7日間の負荷バー */}
      <div className="flex items-end justify-between gap-1.5">
        {load.map((d) => {
          const heavy = d.count >= 3;
          const has = d.count > 0;
          const barH = has ? 6 + (d.count / max) * 38 : 4;
          return (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              {/* 件数 */}
              <span
                className={cn(
                  "text-[11px] font-bold",
                  heavy ? "text-rose-600" : has ? "text-brand-600" : "text-slate-300",
                )}
              >
                {d.count > 0 ? d.count : ""}
              </span>
              {/* バー */}
              <div className="flex h-12 w-full items-end justify-center">
                <div
                  className={cn(
                    "w-full max-w-[18px] rounded-md transition-all",
                    heavy
                      ? "bg-rose-500"
                      : has
                        ? "bg-brand-400"
                        : "bg-slate-100",
                  )}
                  style={{ height: `${barH}px` }}
                />
              </div>
              {/* 曜日 */}
              <span
                className={cn(
                  "text-[10px] font-medium",
                  d.isToday
                    ? "text-brand-600"
                    : d.weekday === 0
                      ? "text-rose-400"
                      : d.weekday === 6
                        ? "text-sky-400"
                        : "text-slate-400",
                )}
              >
                {d.isToday ? "今日" : d.weekdayLabel}
              </span>
              <span className="text-[10px] text-slate-400">{d.dayNum}</span>
            </div>
          );
        })}
      </div>

      {/* ヤバい日アラート */}
      {busy.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2">
          <span aria-hidden>⚠️</span>
          <p className="text-xs text-rose-700">
            <span className="font-bold">
              {busy.map((d) => `${d.dayNum}日(${d.weekdayLabel})`).join("・")}
            </span>{" "}
            は締切が集中。早めに着手しよう。
          </p>
        </div>
      )}
    </section>
  );
}

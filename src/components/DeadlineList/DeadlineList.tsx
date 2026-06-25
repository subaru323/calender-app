import type { EventItem } from "../../types";
import { deadlineTasks, sortByPriority } from "../../lib/priority";
import { EventRow } from "../shared/EventRow";
import { EmptyState } from "../shared/EmptyState";
import { WeeklyLoad } from "./WeeklyLoad";

export function DeadlineList({
  events,
  onToggleDone,
  onSelectEvent,
}: {
  events: EventItem[];
  onToggleDone: (id: string) => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  const all = deadlineTasks(events);
  const open = sortByPriority(all.filter((e) => !e.done));
  const done = all.filter((e) => e.done);

  return (
    <div className="space-y-6">
      {/* 今週の負荷ビュー */}
      <WeeklyLoad events={events} />

      <section>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold tracking-wide text-slate-500">
            優先順位順（未完了）
          </h2>
          <span className="text-xs text-slate-400">{open.length}件</span>
        </div>

        {open.length > 0 ? (
          <div className="space-y-2">
            {open.map((e, i) => (
              <div key={e.id} className="flex items-center gap-2">
                <span
                  className={
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                    (i === 0
                      ? "bg-brand-600 text-white"
                      : "bg-brand-100 text-brand-700")
                  }
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <EventRow
                    event={e}
                    onToggle={onToggleDone}
                    onSelect={onSelectEvent}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="✅"
            title="未完了の締切はありません"
            hint="締切付きの予定を追加すると、ここに優先順位順で並びます。"
          />
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-sm font-bold tracking-wide text-slate-400">
            完了済み（{done.length}）
          </h2>
          <div className="space-y-2">
            {done.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                onToggle={onToggleDone}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

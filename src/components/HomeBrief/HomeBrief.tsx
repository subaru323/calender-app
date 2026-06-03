import type { EventItem } from "../../types";
import { EVENT_TYPE_META } from "../../lib/eventTypes";
import { topPriorityTask } from "../../lib/priority";
import { deadlineCountdown, todayKey } from "../../lib/utils";
import { EventRow } from "../shared/EventRow";
import { EmptyState } from "../shared/EmptyState";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "こんばんは";
  if (h < 11) return "おはよう";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 px-1 text-sm font-bold tracking-wide text-slate-500">
      {children}
    </h2>
  );
}

/** 1つの予定の持ち物カード */
function ItemsCard({
  event,
  onSelect,
}: {
  event: EventItem;
  onSelect: (e: EventItem) => void;
}) {
  const meta = EVENT_TYPE_META[event.type];
  const items = event.items ?? [];

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[0.99] hover:border-slate-200"
    >
      {/* 予定タイトル行 */}
      <div className="mb-2.5 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badge}`}
        >
          {meta.emoji} {meta.label}
        </span>
        <p className="truncate text-sm font-bold text-slate-700">{event.title}</p>
      </div>

      {/* 矢印 + 持ち物チップ */}
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-base text-slate-300">➡</span>
        <div className="flex flex-wrap gap-1.5">
          {items.length > 0 ? (
            items.map((it) => (
              <span
                key={it}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-medium text-brand-700"
              >
                {it}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">なし</span>
          )}
        </div>
      </div>
    </button>
  );
}

export function HomeBrief({
  events,
  onToggleDone,
  onSelectEvent,
}: {
  events: EventItem[];
  onToggleDone: (id: string) => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  const today = todayKey();
  const todays = [...events]
    .filter((e) => e.date === today)
    .sort((a, b) => (a.time ?? "99:99").localeCompare(b.time ?? "99:99"));

  const top = topPriorityTask(events);
  const countdown = top?.deadline ? deadlineCountdown(top.deadline) : null;

  // 今日の予定のうち、持ち物がある（または items 配列が存在する）もの
  const eventsWithItems = todays.filter((e) => (e.items?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      <p className="px-1 text-sm text-slate-400">
        {greeting()}、今日もいい一日に 👋
      </p>

      {/* 朝の最優先1タスク（情報を絞る＝絶対ルール2） */}
      <section>
        <SectionTitle>今やるべき最優先タスク</SectionTitle>
        {top ? (
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 p-5 text-white shadow-lg shadow-brand-600/20">
            <button
              type="button"
              onClick={() => onSelectEvent(top)}
              className="block w-full text-left"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
                  {EVENT_TYPE_META[top.type].emoji} {EVENT_TYPE_META[top.type].label}
                </span>
                {countdown && (
                  <span className="text-sm font-bold">⏰ {countdown.label}</span>
                )}
              </div>
              <p className="mt-3 text-xl font-bold leading-snug">{top.title}</p>
              {top.estimatedMinutes ? (
                <p className="mt-1 text-sm text-white/80">
                  着手の目安 {top.estimatedMinutes}分
                </p>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onToggleDone(top.id)}
              className="mt-4 w-full rounded-xl bg-white/15 py-2.5 text-center text-sm font-bold backdrop-blur transition hover:bg-white/25"
            >
              ✓ 完了にする
            </button>
          </div>
        ) : (
          <EmptyState
            emoji="🎉"
            title="締切タスクはありません"
            hint="今のところ追われている締切はなし。いいペース！"
          />
        )}
      </section>

      {/* 今日の予定 */}
      <section>
        <SectionTitle>今日の予定</SectionTitle>
        {todays.length > 0 ? (
          <div className="space-y-2">
            {todays.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                onToggle={onToggleDone}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        ) : (
          <EmptyState emoji="☀️" title="今日の予定はありません" />
        )}
      </section>

      {/* 持ち物（予定ごとに表示） */}
      <section>
        <SectionTitle>今日の持ち物</SectionTitle>
        {eventsWithItems.length > 0 ? (
          <div className="space-y-2">
            {eventsWithItems.map((e) => (
              <ItemsCard key={e.id} event={e} onSelect={onSelectEvent} />
            ))}
          </div>
        ) : (
          <EmptyState emoji="🎒" title="持ち物のある予定はありません" />
        )}
      </section>
    </div>
  );
}

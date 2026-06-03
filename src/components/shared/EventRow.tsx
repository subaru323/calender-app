import type { EventItem } from "../../types";
import { EVENT_TYPE_META } from "../../lib/eventTypes";
import { cn, deadlineCountdown } from "../../lib/utils";
import { TypeBadge } from "./TypeBadge";

function Checkbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={checked ? "未完了に戻す" : "完了にする"}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
        checked
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-300 bg-white text-transparent hover:border-brand-400",
      )}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
        <path
          d="M4 10l4 4 8-8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function EventRow({
  event,
  onToggle,
  onSelect,
}: {
  event: EventItem;
  onToggle?: (id: string) => void;
  onSelect?: (event: EventItem) => void;
}) {
  const meta = EVENT_TYPE_META[event.type];
  const countdown = event.deadline ? deadlineCountdown(event.deadline) : null;

  return (
    <div
      role={onSelect ? "button" : undefined}
      onClick={() => onSelect?.(event)}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm transition",
        onSelect && "cursor-pointer active:scale-[0.99] hover:border-slate-200",
        event.done && "opacity-60",
      )}
    >
      {onToggle ? (
        <Checkbox checked={event.done} onToggle={() => onToggle(event.id)} />
      ) : (
        <span className="text-lg" aria-hidden>
          {meta.emoji}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium text-slate-800",
            event.done && "line-through text-slate-400",
          )}
        >
          {event.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
          {event.time && <span>🕒 {event.time}</span>}
          {countdown && (
            <span
              className={cn(
                "font-medium",
                countdown.overdue
                  ? "text-rose-600"
                  : countdown.urgent
                    ? "text-amber-600"
                    : "text-slate-400",
              )}
            >
              ⏰ {countdown.label}
            </span>
          )}
          {event.estimatedMinutes ? <span>所要 {event.estimatedMinutes}分</span> : null}
        </div>
      </div>

      <TypeBadge type={event.type} />
    </div>
  );
}

import type { EventType } from "../../types";
import { EVENT_TYPE_META } from "../../lib/eventTypes";
import { cn } from "../../lib/utils";

export function TypeBadge({
  type,
  className,
}: {
  type: EventType;
  className?: string;
}) {
  const meta = EVENT_TYPE_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.badge,
        className,
      )}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

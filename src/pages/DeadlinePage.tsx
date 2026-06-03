import type { EventItem } from "../types";
import { DeadlineList } from "../components/DeadlineList/DeadlineList";

export function DeadlinePage({
  events,
  onToggleDone,
  onSelectEvent,
}: {
  events: EventItem[];
  onToggleDone: (id: string) => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  return (
    <DeadlineList
      events={events}
      onToggleDone={onToggleDone}
      onSelectEvent={onSelectEvent}
    />
  );
}

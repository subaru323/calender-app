import type { EventItem } from "../types";
import { HomeBrief } from "../components/HomeBrief/HomeBrief";

export function Home({
  events,
  onToggleDone,
  onSelectEvent,
}: {
  events: EventItem[];
  onToggleDone: (id: string) => void;
  onSelectEvent: (event: EventItem) => void;
}) {
  return (
    <HomeBrief
      events={events}
      onToggleDone={onToggleDone}
      onSelectEvent={onSelectEvent}
    />
  );
}

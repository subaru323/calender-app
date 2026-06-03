import type { EventItem } from "../types";
import { Calendar } from "../components/Calendar/Calendar";

export function CalendarPage({
  events,
  onSelectEvent,
  onAddOnDate,
}: {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onAddOnDate: (dateKey: string) => void;
}) {
  return (
    <Calendar
      events={events}
      onSelectEvent={onSelectEvent}
      onAddOnDate={onAddOnDate}
    />
  );
}

import { EventType } from "../hooks/useEvents";
import EventItem from "./EventItem";

interface EventListProps {
  events: EventType[];
  onView: (event: EventType) => void;
  onEdit: (event: EventType) => void;
  onDeleted: () => void;
}

export default function EventList({ events, onView, onEdit, onDeleted }: EventListProps) {
  if (events.length === 0) return <p>No events yet.</p>;

  return (
    <ul className="space-y-4">
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          onView={onView}
          onEdit={onEdit}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}

import DeleteEventModal from "../../components/DeleteEventModal";
import { Calendar } from "lucide-react";
import { EventType } from "../hooks/useEvents";

interface EventItemProps {
  event: EventType;
  onView: (event: EventType) => void;
  onEdit: (event: EventType) => void;
  onDeleted: () => void;
}

export default function EventItem({ event, onView, onEdit, onDeleted }: EventItemProps) {
  return (
    <li className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start sm:items-center">
        <div className="mt-1 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 p-3 flex-shrink-0">
          <Calendar className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-sm sm:text-base">{event.title}</p>
          <p className="text-xs sm:text-sm text-gray-600">{new Date(event.startDate).toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 opacity-0 transition-opacity group-hover:opacity-100 w-full sm:w-auto">
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none text-center"
          onClick={() => onView(event)}
        >
          View
        </button>
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 flex-1 sm:flex-none text-center"
          onClick={() => onEdit(event)}
        >
          Edit
        </button>
        <DeleteEventModal eventId={event.id} onDeleted={onDeleted} />
      </div>
    </li>
  );
}

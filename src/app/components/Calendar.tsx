"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { updateEventDates } from "../../../lib/actions/update-event-dates"; // ⭐ NEW ACTION

type CalendarProps = {
  refreshTrigger?: number;
};

export default function Calendar({ refreshTrigger = 0 }: CalendarProps) {
    const [events, setEvents] = useState([]);
  
    // Fetch events from backend (expanded for calendar)
    async function loadEvents() {
        const res = await fetch("/api/events?expand=true");
        const data = await res.json();
        setEvents(data);
    }
    
    // Load initial events
    useEffect(() => {
      loadEvents();
    }, [refreshTrigger]);
    
    return (
    <div className="p-1 fc-dark">
        <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}           // ⭐ data from DB
        height="auto"
        // when event is dragged
        eventDrop={async (info) => {
          const rawId = info.event.id;
          const id = Number(rawId);
          const start = info.event.start; // Date | null
          const end = info.event.end;     // Date | null

          const safeStart = start ?? new Date();
          const safeEnd = end ?? safeStart;

          await updateEventDates({
            id,
            start: safeStart,
            end: safeEnd,
          });

          await loadEvents(); // refresh UI
        }}
  
        eventResize={async (info) => {
          const rawId = info.event.id;
          const id = Number(rawId);
          const start = info.event.start; // Date | null
          const end = info.event.end;     // Date | null
        
          const safeStart = start ?? new Date();
          const safeEnd = end ?? safeStart;
        
          await updateEventDates({
            id,
            start: safeStart,
            end: safeEnd,
          });
        
          await loadEvents(); // refresh UI
        }}
        weekends={true}
        />
    </div>
  );
}

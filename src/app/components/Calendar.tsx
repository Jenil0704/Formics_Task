"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

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

    useEffect(() => {
        loadEvents();
      }, [refreshTrigger]);
    
      return (
    <div className="p-4">
        <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}           // ⭐ data from DB
        height="auto"
        />
    </div>
  );
}

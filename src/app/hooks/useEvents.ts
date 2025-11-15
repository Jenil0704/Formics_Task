import { useState, useEffect, useCallback } from "react";

export type EventType = {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  frequency: string | null;
  daysOfWeek: string | string[] | null;
  recurrenceEndDate: string | null;
};

export default function useEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events?expand=false`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, error, loading, fetchEvents };
}

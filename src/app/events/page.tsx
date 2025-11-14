"use client"
import Link from "next/link";
import {FormEvent, useEffect, useState } from "react";

type Event = {
    id: number;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    frequency: string | null;
    daysOfWeek: string | string[] | null;
  };
  
  type EventForm = {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    frequency: string;
    daysOfWeek: string;
  };
  
  const emptyForm: EventForm = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isRecurring: false,
    frequency: "daily",
    daysOfWeek: "",
  };

export default function Events () {

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  
    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/events?expand=false`, { cache: "no-store" });
            const data = await res.json();
            setEvents(data);
            setError(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (err) {
            setError("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    fetchEvents();
    }, []);

    const openView = (event: Event) => {
    setSelectedEvent(event);
    setEditingEvent(null);
    };

    const openEdit = (event: Event) => {
    setEditingEvent(event);
    setSelectedEvent(null);

    // Handle daysOfWeek - it might be JSON array or string
    let daysOfWeekStr = "";
    if (event.daysOfWeek) {
        if (typeof event.daysOfWeek === "string") {
        try {
            const parsed = JSON.parse(event.daysOfWeek);
            daysOfWeekStr = Array.isArray(parsed) ? (parsed as string[]).join(", ") : event.daysOfWeek;
        } catch {
            daysOfWeekStr = event.daysOfWeek;
        }
        } else if (Array.isArray(event.daysOfWeek)) {
        daysOfWeekStr = (event.daysOfWeek as string[]).join(", ");
        }
    }

    setForm({
        title: event.title,
        description: event.description ?? "",
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        isRecurring: event.isRecurring,
        frequency: event.frequency ?? "daily",
        daysOfWeek: daysOfWeekStr,
    });
    };

    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
        await fetch(`/api/events/${editingEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...form,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
        }),
        });

        setEditingEvent(null);
        setForm(emptyForm);
        fetchEvents();
    } catch (err) {
        setError("Failed to update event");
    }
    };

    const handleDelete = async (id: number) => {
    if (!confirm("Delete this event?")) return;

    try {
        await fetch(`/api/events/${id}`, { method: "DELETE" });
        if (selectedEvent?.id === id) setSelectedEvent(null);
        if (editingEvent?.id === id) {
        setEditingEvent(null);
        setForm(emptyForm);
        }
        fetchEvents();
    } catch (err) {
        setError("Failed to delete event");
    }
    };

    return(
        <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/new"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Event
        </Link>
      </header>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => (
            <li
              key={event.id}
              className="border rounded p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.startDate).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-600 underline"
                  onClick={() => openView(event)}
                >
                  View
                </button>
                <button
                  className="text-yellow-600 underline"
                  onClick={() => openEdit(event)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 underline"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedEvent && (
        <section className="border rounded p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <button onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
          <p className="mt-2 text-lg">{selectedEvent.title}</p>
          {selectedEvent.description && (
            <p className="text-gray-700">{selectedEvent.description}</p>
          )}
          <p className="text-sm text-gray-600">
            Starts: {new Date(selectedEvent.startDate).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Ends: {new Date(selectedEvent.endDate).toLocaleString()}
          </p>
          {selectedEvent.isRecurring && (
            <p className="text-sm text-gray-600">
              Recurring: {selectedEvent.frequency}
              {selectedEvent.daysOfWeek && 
                ` (${Array.isArray(selectedEvent.daysOfWeek) 
                  ? selectedEvent.daysOfWeek.join(", ") 
                  : selectedEvent.daysOfWeek})`}
            </p>
          )}
        </section>
      )}

      {editingEvent && (
        <section className="border rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Event</h2>
            <button
              onClick={() => {
                setEditingEvent(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleUpdate}>
            <input
              className="border p-2 w-full"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <textarea
              className="border p-2 w-full"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Start Date
                <input
                  type="datetime-local"
                  className="border p-2 w-full mt-1"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                />
              </label>

              <label className="text-sm">
                End Date
                <input
                  type="datetime-local"
                  className="border p-2 w-full mt-1"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isRecurring}
                onChange={(e) =>
                  setForm({ ...form, isRecurring: e.target.checked })
                }
              />
              Recurring
            </label>

            {form.isRecurring && (
              <>
                <select
                  className="border p-2 w-full"
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  className="border p-2 w-full"
                  placeholder="Days of week (comma separated)"
                  value={form.daysOfWeek}
                  onChange={(e) =>
                    setForm({ ...form, daysOfWeek: e.target.value })
                  }
                />
              </>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save Changes
            </button>
          </form>
        </section>
      )}
    </main>
    )
}
"use client";

import { useState } from "react";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isRecurring: false,
    frequency: "",
    daysOfWeek: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Validation
  // ---------------------------
  function validateForm() {
    const errors: string[] = [];

    if (!form.title.trim()) errors.push("Title is required.");
    if (!form.startDate) errors.push("Start date is required.");
    if (!form.endDate) errors.push("End date is required.");

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      errors.push("End date must be after start date.");
    }

    if (form.isRecurring) {
      if (!form.frequency) errors.push("Frequency is required.");

      if (form.frequency === "weekly" && form.daysOfWeek.length === 0) {
        errors.push("Select at least one weekday for weekly recurrence.");
      }
    }

    if (errors.length > 0) {
      setError(errors.join("\n"));
      return false;
    }

    setError(null);
    return true;
  }

  // ---------------------------
  // Submit
  // ---------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...form,
      daysOfWeek:
        form.isRecurring && form.frequency === "weekly"
          ? form.daysOfWeek
          : null,
    };

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    window.location.href = "/";
  };

  // Toggle weekday selection
  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Event</h1>

      {error && (
        <p className="text-red-600 whitespace-pre-line">{error}</p>
      )}

      {/* Title */}
      <input
        placeholder="Title"
        className="border p-2 w-full"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      {/* Description */}
      <textarea
        placeholder="Description"
        className="border p-2 w-full"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      {/* Start Date */}
      <input
        type="datetime-local"
        className="border p-2 w-full"
        value={form.startDate}
        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
      />

      {/* End Date */}
      <input
        type="datetime-local"
        className="border p-2 w-full"
        value={form.endDate}
        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
      />

      {/* Recurring checkbox */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isRecurring}
          onChange={(e) =>
            setForm({
              ...form,
              isRecurring: e.target.checked,
              frequency: "",
              daysOfWeek: [],
            })
          }
        />
        Recurring Event
      </label>

      {/* Recurrence options */}
      {form.isRecurring && (
        <>
          {/* Frequency */}
          <select
            className="border p-2 w-full"
            value={form.frequency}
            onChange={(e) =>
              setForm({
                ...form,
                frequency: e.target.value,
                daysOfWeek: [], // reset if switching
              })
            }
          >
            <option className="text-black" value="">Select Frequency</option>
            <option className="text-black" value="daily">Daily</option>
            <option className="text-black" value="weekly">Weekly</option>
            <option className="text-black" value="monthly">Monthly</option>
          </select>

          {/* Weekly day selector */}
          {form.frequency === "weekly" && (
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 border rounded 
                    ${
                      form.daysOfWeek.includes(day)
                        ? "bg-blue-600 text-white"
                        : ""
                    }`}
                >
                  {day.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <button className="px-4 py-2 bg-green-600 text-white rounded">
          Create
        </button>
      </form>
    </div>
  );
}

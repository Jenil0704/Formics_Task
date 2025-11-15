"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import AuthHeader from "../../components/AuthHeader";
import { createEvent, type EventFormState } from "../../../lib/actions/events";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create"}
    </button>
  );
}

export default function CreateEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction] = useFormState<EventFormState, FormData>(
    createEvent,
    {}
  );
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isRecurring: false,
    frequency: "",
    daysOfWeek: [] as string[],
    recurrenceEndDate: "",
  });

  useEffect(() => {
    if (formState.success) {
      formRef.current?.reset();
      router.push("/");
    }
  }, [formState.success, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }


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
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />


      <div className="mt-4 px-12">
        <Link className="cursor-pointer" href="/">
            <button className="cursor-pointer mb-5 inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Events</span>
            </button>
        </Link>
      </div>
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Event</h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">Add a new event to your calendar</p>
        </div>

        <form ref={formRef} action={formAction} className="space-y-6">
          {formState.errors?._form && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {formState.errors._form.map((error, i) => (
                <p key={i}>{error}</p>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
              Event Title
            </label>
            <input
              name="title"
              placeholder="Title"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
              required
              defaultValue={form.title}
              aria-describedby={formState.errors?.title ? "title-error" : undefined}
            />
            {formState.errors?.title && (
              <p id="title-error" className="text-red-600 text-sm mt-1">
                {formState.errors.title[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Description"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
              required
              defaultValue={form.description}
            />
          </div>

          {/* Start & End Dates */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label htmlFor="startDate" className="sr-only">Start Date</label>
              <input
                name="startDate"
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                required
                defaultValue={form.startDate}
                aria-describedby={formState.errors?.startDate ? "startDate-error" : undefined}
              />
              {formState.errors?.startDate && (
                <p id="startDate-error" className="text-red-600 text-sm mt-1">{formState.errors.startDate[0]}</p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label htmlFor="endDate" className="sr-only">End Date</label>
              <input
                name="endDate"
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                required
                defaultValue={form.endDate}
                aria-describedby={formState.errors?.endDate ? "endDate-error" : undefined}
              />
              {formState.errors?.endDate && (
                <p id="endDate-error" className="text-red-600 text-sm mt-1">{formState.errors.endDate[0]}</p>
              )}
            </div>
          </div>

          {/* Recurring */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg bg-slate-50 p-4">
            <label htmlFor="isRecurring" className="cursor-pointer text-sm font-medium text-slate-900">
              Mark as recurring event
            </label>
            <input
              name="isRecurring"
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500"
              checked={form.isRecurring}
              value="true"
              onChange={(e) =>
                setForm({ ...form, isRecurring: e.target.checked, frequency: "", daysOfWeek: [], recurrenceEndDate: "" })
              }
            />
          </div>
          {!form.isRecurring && <input type="hidden" name="isRecurring" value="false" />}

          {/* Recurrence Options */}
          {form.isRecurring && (
            <div className="space-y-4">
              {/* Frequency */}
              <div className="space-y-2">
                <select
                  name="frequency"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value, daysOfWeek: [] })}
                >
                  <option value="">Select Frequency</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Weekly Days */}
              {form.frequency === "weekly" && (
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 border rounded text-sm ${form.daysOfWeek.includes(day) ? "bg-blue-600 text-white" : ""}`}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* Recurrence End */}
              <div className="space-y-2">
                <label className="text-sm">Recurrence End Date (optional)</label>
                <input
                  name="recurrenceEndDate"
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                  defaultValue={form.recurrenceEndDate}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty to recur indefinitely (defaults to 1 year)
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/">
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { updateEvent, type EventFormState } from "../../lib/actions/events";


interface EditableEventProps {
    event : any;
    onClose : () => void;
    onEventUpdated : () => void;
}
type Event = {
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
  
  type EventForm = {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    frequency: string;
    daysOfWeek: string;
    recurrenceEndDate: string;
  };
  
  const emptyForm: EventForm = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    isRecurring: false,
    frequency: "daily",
    daysOfWeek: "",
    recurrenceEndDate: "",
  };

  function UpdateSubmitButton() {
    const { pending } = useFormStatus();
    return (
      <button
        type="submit"
        disabled={pending}
        className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    );
  }

export default function EditableEventModal({ event, onClose, onEventUpdated }: EditableEventProps){
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (status === "unauthenticated") {
        router.push("/login");
        }
    }, [status, router]);

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
        recurrenceEndDate: event.recurrenceEndDate ? new Date(event.recurrenceEndDate).toISOString().slice(0, 16) : "",
    });
    };

    const updateFormRef = useRef<HTMLFormElement>(null);
    
    // Wrapper action that reads event ID from form data
    async function updateEventWrapper(prevState: EventFormState, formData: FormData) {
      if (!editingEvent) {
        return { errors: { _form: ["No event selected"] } };
      }
      return updateEvent(editingEvent.id, prevState, formData);
    }
    
    const [updateFormState, updateFormAction] = useActionState<EventFormState, FormData>(
      updateEventWrapper,
      {}
    );

    useEffect(() => {
        if (updateFormState.success && editingEvent) {
      
          // close modal
          onClose();
      
          // reset local state
          setEditingEvent(null);
          setForm(emptyForm);
      
          // refresh events list in parent component
          if (onEventUpdated) onEventUpdated();
      
          // also refresh this component's list if needed
          fetchEvents();
        }
      }, [updateFormState.success, editingEvent]);

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

    useEffect(() => {
        if (!event) return;
        openEdit(event);
    }, [event]);
    
return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
                Edit Event
            </h2>
            <button onClick={onClose} className="text-gray-500">
                ✖
            </button>
            </div>
            <section className="rounded p-4">
                {updateFormState.errors?._form && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {updateFormState.errors._form.map((error: string, i: number) => (
                        <p key={i}>{error}</p>
                    ))}
                    </div>
                )}

                <form ref={updateFormRef} action={updateFormAction} className="space-y-3">
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-900">
                            Event Title
                        </label>
                        <input
                            name="title"
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none"
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            aria-describedby={updateFormState.errors?.title ? "title-error" : undefined}
                            required
                        />
                        {updateFormState.errors?.title && (
                            <p id="title-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.title[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
                        Description
                        </label>
                        <textarea
                        name="description"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 placeholder-slate-500 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm">
                            Start Date
                        </label>
                        <input
                        name="startDate"
                        type="datetime-local"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        aria-describedby={updateFormState.errors?.startDate ? "startDate-error" : undefined}
                        required
                        />
                        {updateFormState.errors?.startDate && (
                            <p id="startDate-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.startDate[0]}
                        </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm">
                            End Date
                        </label>
                        <input
                        name="endDate"
                        type="datetime-local"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        aria-describedby={updateFormState.errors?.endDate ? "endDate-error" : undefined}
                        required
                        />
                        {updateFormState.errors?.endDate && (
                            <p id="endDate-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.endDate[0]}
                        </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
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
                            setForm({ ...form, isRecurring: e.target.checked })
                            }
                        />
                    </div>
                    {!form.isRecurring && (
                    <input type="hidden" name="isRecurring" value="false" />
                    )}

                    {form.isRecurring && (
                    <>
                        <div>
                        <select
                            name="frequency"
                            className="border p-2 w-full"
                            value={form.frequency}
                            onChange={(e) =>
                            setForm({ ...form, frequency: e.target.value })
                            }
                            aria-describedby={updateFormState.errors?.frequency ? "frequency-error" : undefined}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        {updateFormState.errors?.frequency && (
                            <p id="frequency-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.frequency[0]}
                            </p>
                        )}
                        </div>
                        <div>
                        <input
                            name="daysOfWeek"
                            className="border p-2 w-full"
                            placeholder="Days of week (comma separated)"
                            value={form.daysOfWeek}
                            onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })}
                            aria-describedby={updateFormState.errors?.daysOfWeek ? "daysOfWeek-error" : undefined}
                        />
                        {updateFormState.errors?.daysOfWeek && (
                            <p id="daysOfWeek-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.daysOfWeek[0]}
                            </p>
                        )}
                        </div>
                        <div>
                        <label className="text-sm">
                            Recurrence End Date (optional)
                            <input
                            name="recurrenceEndDate"
                            type="datetime-local"
                            className="border p-2 w-full mt-1"
                            value={form.recurrenceEndDate}
                            onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
                            aria-describedby={updateFormState.errors?.recurrenceEndDate ? "recurrenceEndDate-error" : undefined}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                            Leave empty to recur indefinitely (defaults to 1 year)
                            </p>
                        </label>
                        {updateFormState.errors?.recurrenceEndDate && (
                            <p id="recurrenceEndDate-error" className="text-red-600 text-sm mt-1">
                            {updateFormState.errors.recurrenceEndDate[0]}
                            </p>
                        )}
                        </div>
                    </>
                    )}

                    <UpdateSubmitButton />
                </form>
            </section>
        </div>
    </div>
)
}

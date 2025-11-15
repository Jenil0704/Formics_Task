"use client";

import { useState } from "react";
import { deleteEvent } from "../../lib/actions/events";

interface DeleteEventModalProps {
    eventId: number;
    onDeleted: () => void;
}

export default function DeleteEventModal({ eventId, onDeleted } : DeleteEventModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const result = await deleteEvent(eventId);

    setLoading(false);

    if (result?.success) {
      setOpen(false);
      if (onDeleted) onDeleted();     // refresh parent UI
    }
  }

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-2">Delete Event?</h2>
            <p className="text-sm mb-4">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

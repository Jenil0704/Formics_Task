"use client";

import { useState } from "react";
import AuthHeader from "../../components/AuthHeader";
import Toolbar from "../components/Toolbar";
import EventList from "../components/EventList";
import EventDetails from "@/components/EventDetails";
import EditableEventModal from "@/components/EditableEventModal";
import useAuthRedirect from "../hooks/useAuthRedirect";
import useEvents from "../hooks/useEvents";
import useExportEvents from "../hooks/useExportEvents";

export default function EventsPage() {
  const { session, status } = useAuthRedirect();
  const { events, error, loading, fetchEvents } = useEvents();
  const exportEvents = useExportEvents();

  const [viewEvent, setViewEvent] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [isEditViewOpen, setIsEditViewOpen] = useState(false);

  const openView = (event: any) => {
    setViewEvent(event);
    setIsViewOpen(true);
  };

  const closeView = () => {
    setViewEvent(null);
    setIsViewOpen(false);
  };

  const openEditView = (event: any) => {
    setEditEvent(event);
    setIsEditViewOpen(true);
  };

  const closeEditView = () => {
    setEditEvent(null);
    setIsEditViewOpen(false);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-black">
      <AuthHeader />
      <main className="p-4 sm:p-6 space-y-6">
        <Toolbar onExport={exportEvents} />
        {error && <p className="text-red-600">{error}</p>}
        {loading ? (
          <p>Loading events...</p>
        ) : (
          <EventList
            events={events}
            onView={openView}
            onEdit={openEditView}
            onDeleted={fetchEvents}
          />
        )}
      </main>

      {isViewOpen && <EventDetails event={viewEvent} onClose={closeView} />}
      {isEditViewOpen && (
        <EditableEventModal
          event={editEvent}
          onClose={closeEditView}
          onEventUpdated={fetchEvents}
        />
      )}
    </div>
  );
}

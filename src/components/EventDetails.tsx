interface EventDetailsProps {
    event: any;      // Replace `any` with your event type
    onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
    if (!event) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
  
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Title: </span>
              {event.title}
            </p>
  
            {event.description && (
              <p>
                <span className="font-semibold">Description: </span>
                {event.description}
              </p>
            )}
  
            <p>
              <span className="font-semibold">Start: </span>
              {new Date(event.startDate).toLocaleString()}
            </p>
  
            <p>
              <span className="font-semibold">End: </span>
              {new Date(event.endDate).toLocaleString()}
            </p>
  
            {event.isRecurring && (
              <>
                <p>
                  <span className="font-semibold">Recurring: </span>
                  {event.frequency}
                </p>
  
                {event.recurrenceEndDate && (
                  <p>
                    <span className="font-semibold">Ends on: </span>
                    {new Date(event.recurrenceEndDate).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
  
          <button
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
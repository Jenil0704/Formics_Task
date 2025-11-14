import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// Helper function to expand recurring events into individual occurrences
function expandRecurringEvents(events: any[]): any[] {
  const expandedEvents: any[] = [];
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // Generate events for 1 year ahead

  // Day name to day of week mapping (0 = Sunday, 1 = Monday, etc.)
  const dayNameToNumber: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  events.forEach((event) => {
    const baseStart = new Date(event.startDate);
    const baseEnd = new Date(event.endDate);
    const duration = baseEnd.getTime() - baseStart.getTime();

    if (!event.isRecurring) {
      // Non-recurring event - add as is
      expandedEvents.push({
        id: String(event.id),
        title: event.title,
        start: baseStart.toISOString(),
        end: baseEnd.toISOString(),
        description: event.description,
      });
      return;
    }

    // Handle recurring events
    if (event.frequency === "daily") {
      // Daily: repeat every day
      let currentDate = new Date(baseStart);
      while (currentDate <= endDate) {
        const occurrenceEnd = new Date(currentDate.getTime() + duration);
        expandedEvents.push({
          id: `${event.id}-${currentDate.toISOString()}`,
          title: event.title,
          start: currentDate.toISOString(),
          end: occurrenceEnd.toISOString(),
          description: event.description,
        });
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (event.frequency === "weekly") {
      // Weekly: repeat on specified days of week
      const daysOfWeek = event.daysOfWeek
        ? Array.isArray(event.daysOfWeek)
          ? event.daysOfWeek
          : JSON.parse(String(event.daysOfWeek))
        : [];

      if (daysOfWeek.length === 0) {
        // If no days specified, use the original day
        daysOfWeek.push(
          ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
            baseStart.getDay()
          ]
        );
      }

      const dayNumbers = daysOfWeek.map((day: string) => dayNameToNumber[day] ?? -1).filter((d: number) => d !== -1);

      let currentDate = new Date(baseStart);
      // Start from the beginning of the week containing the base start date
      currentDate.setDate(currentDate.getDate() - currentDate.getDay());

      while (currentDate <= endDate) {
        // Check each day of the week
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(currentDate);
          checkDate.setDate(checkDate.getDate() + i);

          if (dayNumbers.includes(checkDate.getDay()) && checkDate >= baseStart && checkDate <= endDate) {
            const occurrenceStart = new Date(checkDate);
            occurrenceStart.setHours(baseStart.getHours(), baseStart.getMinutes(), baseStart.getSeconds());
            const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);

            expandedEvents.push({
              id: `${event.id}-${occurrenceStart.toISOString()}`,
              title: event.title,
              start: occurrenceStart.toISOString(),
              end: occurrenceEnd.toISOString(),
              description: event.description,
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (event.frequency === "monthly") {
      // Monthly: repeat on the same day of the month
      let currentDate = new Date(baseStart);
      const originalDay = baseStart.getDate();
      
      while (currentDate <= endDate) {
        const occurrenceEnd = new Date(currentDate.getTime() + duration);
        expandedEvents.push({
          id: `${event.id}-${currentDate.toISOString()}`,
          title: event.title,
          start: currentDate.toISOString(),
          end: occurrenceEnd.toISOString(),
          description: event.description,
        });
        
        // Move to next month, handling edge cases where the day doesn't exist
        const nextMonth = currentDate.getMonth() + 1;
        const nextYear = currentDate.getFullYear();
        const lastDayOfNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const dayToUse = Math.min(originalDay, lastDayOfNextMonth);
        
        currentDate = new Date(nextYear, nextMonth, dayToUse);
        currentDate.setHours(baseStart.getHours(), baseStart.getMinutes(), baseStart.getSeconds());
      }
    }
  });

  return expandedEvents;
}

// GET → List all events
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expand = searchParams.get("expand") === "true";

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  if (expand) {
    // Expand recurring events into individual occurrences (for calendar view)
    const expandedEvents = expandRecurringEvents(events);
    return NextResponse.json(expandedEvents);
  } else {
    // Return original events in list format (for list view)
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      isRecurring: event.isRecurring,
      frequency: event.frequency,
      daysOfWeek: event.daysOfWeek,
    }));
    return NextResponse.json(formattedEvents);
  }
}

// POST → Create event
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isRecurring: body.isRecurring,
        frequency: body.frequency,
        daysOfWeek: body.daysOfWeek || null,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

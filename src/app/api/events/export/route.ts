import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/getSession";

// Helper function to format date for ICS (YYYYMMDDTHHmmssZ)
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function escapeICS(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function generateRRULE(event: any): string {
  if (!event.isRecurring || !event.frequency) {
    return "";
  }

  const startDate = new Date(event.startDate);
  let rrule = "";

  if (event.frequency === "daily") {
    rrule = "FREQ=DAILY";
  } else if (event.frequency === "weekly") {
    rrule = "FREQ=WEEKLY";
    
    if (event.daysOfWeek) {
      const daysOfWeek = Array.isArray(event.daysOfWeek)
        ? event.daysOfWeek
        : typeof event.daysOfWeek === "string"
        ? JSON.parse(event.daysOfWeek)
        : [];
      
      if (daysOfWeek.length > 0) {
        const dayMap: { [key: string]: string } = {
          Monday: "MO",
          Tuesday: "TU",
          Wednesday: "WE",
          Thursday: "TH",
          Friday: "FR",
          Saturday: "SA",
          Sunday: "SU",
        };
        
        const byDay = daysOfWeek
          .map((day: string) => dayMap[day] || "")
          .filter((d: string) => d !== "")
          .join(",");
        
        if (byDay) {
          rrule += `;BYDAY=${byDay}`;
        }
      }
    }
  } else if (event.frequency === "monthly") {
    rrule = "FREQ=MONTHLY";
  }

  if (event.recurrenceEndDate) {
    const until = formatICSDate(new Date(event.recurrenceEndDate));
    rrule += `;UNTIL=${until}`;
  }

  return rrule;
}

// Helper function to generate ICS content for a single event
function generateEventICS(event: any): string {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const now = new Date();
  
  let ics = "BEGIN:VEVENT\r\n";
  ics += `UID:event-${event.id}@calendar-app\r\n`;
  ics += `DTSTAMP:${formatICSDate(now)}\r\n`;
  ics += `DTSTART:${formatICSDate(startDate)}\r\n`;
  ics += `DTEND:${formatICSDate(endDate)}\r\n`;
  ics += `SUMMARY:${escapeICS(event.title)}\r\n`;
  
  if (event.description) {
    ics += `DESCRIPTION:${escapeICS(event.description)}\r\n`;
  }
  
  if (event.isRecurring) {
    const rrule = generateRRULE(event);
    if (rrule) {
      ics += `RRULE:${rrule}\r\n`;
    }
  }
  
  ics += `CREATED:${formatICSDate(new Date(event.createdAt))}\r\n`;
  ics += `LAST-MODIFIED:${formatICSDate(new Date(event.updatedAt))}\r\n`;
  ics += "END:VEVENT\r\n";
  
  return ics;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Generate ICS content
    let icsContent = "BEGIN:VCALENDAR\r\n";
    icsContent += "VERSION:2.0\r\n";
    icsContent += "PRODID:-//Calendar App//EN\r\n";
    icsContent += "CALSCALE:GREGORIAN\r\n";
    icsContent += "METHOD:PUBLISH\r\n";

    // Add each event
    events.forEach((event) => {
      icsContent += generateEventICS(event);
    });

    icsContent += "END:VCALENDAR\r\n";

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="calendar-export-${new Date().toISOString().split("T")[0]}.ics"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export events" },
      { status: 500 }
    );
  }
}


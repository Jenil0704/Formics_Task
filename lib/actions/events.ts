"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../prisma";
import { getSession } from "../getSession";

export type EventFormState = {
  errors?: {
    title?: string[];
    startDate?: string[];
    endDate?: string[];
    frequency?: string[];
    daysOfWeek?: string[];
    recurrenceEndDate?: string[];
    _form?: string[];
  };
  success?: boolean;
};

// Validation helper
function validateEventForm(formData: FormData): EventFormState["errors"] {
  const errors: EventFormState["errors"] = {};
  const title = formData.get("title") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const isRecurring = formData.get("isRecurring") === "true";
  const frequency = formData.get("frequency") as string;
  const daysOfWeek = formData.get("daysOfWeek") as string;

  if (!title || !title.trim()) {
    errors.title = ["Title is required"];
  }

  if (!startDate) {
    errors.startDate = ["Start date is required"];
  }

  if (!endDate) {
    errors.endDate = ["End date is required"];
  }

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    errors.endDate = ["End date must be after start date"];
  }

  if (isRecurring) {
    if (!frequency) {
      errors.frequency = ["Frequency is required for recurring events"];
    }

    if (frequency === "weekly" && (!daysOfWeek || daysOfWeek.trim() === "")) {
      errors.daysOfWeek = ["Select at least one weekday for weekly recurrence"];
    }

    const recurrenceEndDate = formData.get("recurrenceEndDate") as string;
    if (
      recurrenceEndDate &&
      startDate &&
      new Date(recurrenceEndDate) < new Date(startDate)
    ) {
      errors.recurrenceEndDate = [
        "Recurrence end date must be after start date",
      ];
    }
  }

  return Object.keys(errors).length > 0 ? errors : undefined;
}

// Create event server action
export async function createEvent(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      errors: {
        _form: ["You must be logged in to create events"],
      },
    };
  }

  // Validate form data
  const errors = validateEventForm(formData);
  if (errors) {
    return { errors };
  }

  try {
    const userId = parseInt(session.user.id);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const isRecurring = formData.get("isRecurring") === "true";
    const frequency = formData.get("frequency") as string;
    const daysOfWeekStr = formData.get("daysOfWeek") as string;
    const recurrenceEndDate = formData.get("recurrenceEndDate") as string;

    // Parse daysOfWeek if it's a comma-separated string
    let daysOfWeek = null;
    if (isRecurring && frequency === "weekly" && daysOfWeekStr) {
      daysOfWeek = daysOfWeekStr.split(",").map((d) => d.trim());
    }

    await prisma.event.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isRecurring,
        frequency: isRecurring ? frequency : null,
        daysOfWeek: daysOfWeek ? JSON.parse(JSON.stringify(daysOfWeek)) : null,
        recurrenceEndDate: isRecurring && recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : null,
        userId,
      },
    });

    
  } catch (error) {
    console.error("Create event error:", error);
    return {
      errors: {
        _form: ["Failed to create event. Please try again."],
      },
    };
  }
    revalidatePath("/");
    revalidatePath("/events");
    redirect("/");
}

// Update event server action
export async function updateEvent(
  eventId: number,
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      errors: {
        _form: ["You must be logged in to update events"],
      },
    };
  }

  // Validate form data
  const errors = validateEventForm(formData);
  if (errors) {
    return { errors };
  }

  try {
    const userId = parseInt(session.user.id);

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return {
        errors: {
          _form: ["Event not found"],
        },
      };
    }

    if (existingEvent.userId !== userId) {
      return {
        errors: {
          _form: ["You don't have permission to update this event"],
        },
      };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const isRecurring = formData.get("isRecurring") === "true";
    const frequency = formData.get("frequency") as string;
    const daysOfWeekStr = formData.get("daysOfWeek") as string;
    const recurrenceEndDate = formData.get("recurrenceEndDate") as string;

    // Parse daysOfWeek if it's a comma-separated string
    let daysOfWeek = null;
    if (isRecurring && frequency === "weekly" && daysOfWeekStr) {
      daysOfWeek = daysOfWeekStr.split(",").map((d) => d.trim());
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isRecurring,
        frequency: isRecurring ? frequency : null,
        daysOfWeek: daysOfWeek ? JSON.parse(JSON.stringify(daysOfWeek)) : null,
        recurrenceEndDate: isRecurring && recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : null,
      },
    });

    
  } catch (error) {
    console.error("Update event error:", error);
    return {
      errors: {
        _form: ["Failed to update event. Please try again."],
      },
    };
  }
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
}

// Delete event server action
export async function deleteEvent(eventId: number): Promise<{
  success?: boolean;
  error?: string;
}> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { error: "You must be logged in to delete events" };
  }

  try {
    const userId = parseInt(session.user.id);

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return { error: "Event not found" };
    }

    if (existingEvent.userId !== userId) {
      return { error: "You don't have permission to delete this event" };
    }

    await prisma.event.delete({
      where: { id: eventId },
    });


  } catch (error) {
    console.error("Delete event error:", error);
    return { error: "Failed to delete event. Please try again." };
  }
  revalidatePath("/");
  revalidatePath("/events");
  return { success: true };
}
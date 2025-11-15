import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/getSession";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const event = await prisma.event.findUnique({
    where: { id: Number(id) },
  });

  return Response.json(event);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(session.user.id);
    const body = await req.json();

    // Check if event exists and belongs to the user
    const existingEvent = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isRecurring: body.isRecurring,
        frequency: body.frequency,
        daysOfWeek: body.daysOfWeek,
        recurrenceEndDate: body.isRecurring && body.recurrenceEndDate
          ? new Date(body.recurrenceEndDate)
          : null,
      },
    });

    return Response.json(event);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const userId = parseInt(session.user.id);

    // Check if event exists and belongs to the user
    const existingEvent = await prisma.event.findUnique({
      where: { id: Number(id) },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: "Event deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

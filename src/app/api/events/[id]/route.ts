import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

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
    const { id } = await context.params;
    const body = await req.json();

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
    const { id } = await context.params;

    await prisma.event.delete({
      where: { id: Number(id) },
    });

    return Response.json({ message: "Event deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

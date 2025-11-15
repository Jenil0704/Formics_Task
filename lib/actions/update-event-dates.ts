"use server";

import prisma from "../prisma";
import { getSession } from "../getSession";
import { revalidatePath } from "next/cache";

export async function updateEventDates({
  id,
  start,
  end,
}: {
  id: number;
  start: Date;
  end: Date;
}) {
  const session = await getSession();

  if (!session?.user?.id) return;

  const userId = Number(session.user.id);

  // Verify ownership
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event || event.userId !== userId) return;

  await prisma.event.update({
    where: { id },
    data: {
      startDate: start,
      endDate: end,
    },
  });

  revalidatePath("/");
  revalidatePath("/events");
}

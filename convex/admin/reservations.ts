import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./authorization";

export const list = query({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);
    const reservations = await context.db.query("reservations").order("desc").collect();

    return await Promise.all(
      reservations.map(async (reservation) => {
        const gift = await context.db.get(reservation.giftId);
        return {
          ...reservation,
          giftName: gift?.name ?? "Deleted gift",
        };
      }),
    );
  },
});

export const cancel = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (context, { reservationId }) => {
    await requireAdmin(context);
    const reservation = await context.db.get(reservationId);
    if (!reservation) {
      throw new ConvexError({
        code: "RESERVATION_NOT_FOUND",
        message: "This reservation no longer exists.",
      });
    }

    if (reservation.status === "cancelled") {
      return { cancelled: false };
    }

    await context.db.patch(reservationId, { status: "cancelled" });
    return { cancelled: true };
  },
});

import { query } from "../_generated/server";
import { requireAdmin } from "./authorization";

export const getStats = query({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);

    const [rsvps, gifts, reservations] = await Promise.all([
      context.db.query("rsvps").collect(),
      context.db.query("gifts").collect(),
      context.db.query("reservations").collect(),
    ]);

    const activeReservations = reservations.filter(
      (reservation) => reservation.status === "active",
    );
    const attending = rsvps.filter(
      (rsvp) => rsvp.attendance === "attending",
    );

    return {
      rsvpResponses: rsvps.length,
      attendingGuests: attending.reduce(
        (total, rsvp) => total + rsvp.numberOfGuests,
        0,
      ),
      declinedResponses: rsvps.length - attending.length,
      visibleGifts: gifts.filter((gift) => gift.visible).length,
      reservedGifts: activeReservations.length,
    };
  },
});

import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { enforceRateLimit } from "./lib/rateLimit";

function createReservationCode() {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return `BABY-${Array.from(bytes, (byte) =>
    byte.toString(36).padStart(2, "0"),
  )
    .join("")
    .toUpperCase()}`;
}

export const reserve = mutation({
  args: {
    giftId: v.id("gifts"),
    guestName: v.string(),
    mobileNumber: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (context, input) => {
    if (input.website) {
      throw new ConvexError("Unable to reserve this gift.");
    }

    const gift = await context.db.get(input.giftId);
    if (!gift || !gift.visible) {
      throw new ConvexError({
        code: "GIFT_UNAVAILABLE",
        message: "This gift is no longer available.",
      });
    }

    const activeReservation = await context.db
      .query("reservations")
      .withIndex("by_gift_and_status", (queryBuilder) =>
        queryBuilder.eq("giftId", input.giftId).eq("status", "active"),
      )
      .first();

    if (activeReservation) {
      throw new ConvexError({
        code: "GIFT_ALREADY_RESERVED",
        message: "Sorry, someone has already reserved this gift.",
      });
    }

    const guestName = input.guestName.trim();
    const rateLimitIdentity = input.mobileNumber?.trim() || guestName.toLowerCase();
    await enforceRateLimit(
      context,
      `gift:${input.giftId}:${rateLimitIdentity}`,
      { attempts: 4, windowMs: 10 * 60 * 1000 },
    );
    if (guestName.length < 2 || guestName.length > 100) {
      throw new ConvexError({
        code: "INVALID_GUEST_NAME",
        message: "Please enter a valid guest name.",
      });
    }

    const mobileNumber = input.mobileNumber?.trim() || undefined;
    if (mobileNumber && (mobileNumber.length < 7 || mobileNumber.length > 20)) {
      throw new ConvexError({
        code: "INVALID_MOBILE",
        message: "Please enter a valid mobile number.",
      });
    }

    const reservationCode = createReservationCode();
    await context.db.insert("reservations", {
      giftId: input.giftId,
      guestName,
      mobileNumber,
      reservationCode,
      reservedAt: Date.now(),
      status: "active",
    });

    return { reservationCode };
  },
});

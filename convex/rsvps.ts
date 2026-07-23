import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { enforceRateLimit } from "./lib/rateLimit";

export const submit = mutation({
  args: {
    guestName: v.string(),
    mobile: v.string(),
    email: v.optional(v.string()),
    attendance: v.union(v.literal("attending"), v.literal("not_attending")),
    numberOfGuests: v.number(),
    dietaryRestrictions: v.optional(v.string()),
    message: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (context, input) => {
    if (input.website) {
      throw new Error("Unable to submit this RSVP.");
    }

    const guestName = input.guestName.trim();
    const mobile = input.mobile.trim();
    await enforceRateLimit(context, `rsvp:${mobile.toLowerCase()}`, {
      attempts: 4,
      windowMs: 10 * 60 * 1000,
    });

    if (guestName.length < 2 || guestName.length > 100) {
      throw new Error("Please enter a valid guest name.");
    }

    if (mobile.length < 7 || mobile.length > 20) {
      throw new Error("Please enter a valid mobile number.");
    }

    const numberOfGuests =
      input.attendance === "not_attending" ? 0 : input.numberOfGuests;

    if (
      !Number.isInteger(numberOfGuests) ||
      numberOfGuests < 0 ||
      numberOfGuests > 10
    ) {
      throw new Error("The guest count must be between 1 and 10.");
    }

    return await context.db.insert("rsvps", {
      guestName,
      mobile,
      email: input.email?.trim() || undefined,
      attendance: input.attendance,
      numberOfGuests,
      dietaryRestrictions: input.dietaryRestrictions?.trim() || undefined,
      message: input.message?.trim() || undefined,
      submittedAt: Date.now(),
    });
  },
});

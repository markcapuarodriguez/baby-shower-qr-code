import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./authorization";

const eventFields = {
  title: v.string(),
  parentNames: v.string(),
  eventDate: v.string(),
  eventTime: v.string(),
  eventEndTime: v.optional(v.string()),
  timeZone: v.string(),
  venue: v.string(),
  googleMaps: v.optional(v.string()),
  dressCode: v.optional(v.string()),
  parking: v.optional(v.string()),
  contactPerson: v.string(),
  contactNumber: v.string(),
  rsvpDeadline: v.string(),
  announcement: v.optional(v.string()),
};

export const get = query({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);
    return await context.db.query("eventSettings").first();
  },
});

export const save = mutation({
  args: eventFields,
  handler: async (context, input) => {
    await requireAdmin(context);
    const existing = await context.db.query("eventSettings").first();

    const event = {
      ...input,
      title: input.title.trim(),
      parentNames: input.parentNames.trim(),
      venue: input.venue.trim(),
      contactPerson: input.contactPerson.trim(),
      contactNumber: input.contactNumber.trim(),
    };

    if (existing) {
      await context.db.patch(existing._id, event);
      return existing._id;
    }

    return await context.db.insert("eventSettings", event);
  },
});

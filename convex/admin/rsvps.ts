import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./authorization";

export const list = query({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);
    return await context.db.query("rsvps").withIndex("by_submitted_at").order("desc").collect();
  },
});

export const remove = mutation({
  args: { rsvpId: v.id("rsvps") },
  handler: async (context, { rsvpId }) => {
    await requireAdmin(context);
    const rsvp = await context.db.get(rsvpId);
    if (!rsvp) return { removed: false };

    await context.db.delete(rsvpId);
    return { removed: true };
  },
});

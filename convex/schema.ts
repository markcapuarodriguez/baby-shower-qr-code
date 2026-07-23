import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  eventSettings: defineTable({
    title: v.string(),
    parentNames: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    timeZone: v.string(),
    venue: v.string(),
    googleMaps: v.optional(v.string()),
    dressCode: v.optional(v.string()),
    parking: v.optional(v.string()),
    contactPerson: v.string(),
    contactNumber: v.string(),
    rsvpDeadline: v.string(),
    announcement: v.optional(v.string()),
  }),
  gifts: defineTable({
    name: v.string(),
    category: v.string(),
    description: v.string(),
    minPrice: v.number(),
    maxPrice: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
    visible: v.boolean(),
  })
    .index("by_visible", ["visible"])
    .index("by_category", ["category"]),
  reservations: defineTable({
    giftId: v.id("gifts"),
    guestName: v.string(),
    mobileNumber: v.optional(v.string()),
    reservationCode: v.string(),
    reservedAt: v.number(),
    status: v.union(v.literal("active"), v.literal("cancelled")),
  })
    .index("by_gift_and_status", ["giftId", "status"])
    .index("by_code", ["reservationCode"])
    .index("by_status", ["status"]),
  rsvps: defineTable({
    guestName: v.string(),
    mobile: v.string(),
    email: v.optional(v.string()),
    attendance: v.union(v.literal("attending"), v.literal("not_attending")),
    numberOfGuests: v.number(),
    dietaryRestrictions: v.optional(v.string()),
    message: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_submitted_at", ["submittedAt"])
    .index("by_attendance", ["attendance"]),
  adminUsers: defineTable({
    authUserId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("organizer")),
  }).index("by_auth_user", ["authUserId"]),
  rateLimits: defineTable({
    key: v.string(),
    windowStartedAt: v.number(),
    attempts: v.number(),
  }).index("by_key", ["key"]),
});

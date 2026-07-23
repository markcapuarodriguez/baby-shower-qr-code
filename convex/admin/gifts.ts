import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./authorization";

const category = v.union(
  v.literal("Essentials"),
  v.literal("Feeding"),
  v.literal("Bath & Care"),
  v.literal("Clothing"),
  v.literal("Nursery"),
  v.literal("Travel"),
  v.literal("Health"),
);

function validatePrices(minPrice: number, maxPrice: number) {
  if (
    minPrice < 0 ||
    maxPrice < minPrice ||
    maxPrice > 300 ||
    !Number.isFinite(minPrice) ||
    !Number.isFinite(maxPrice)
  ) {
    throw new ConvexError({
      code: "INVALID_PRICE",
      message: "Gift prices must be between AED 0 and AED 300.",
    });
  }
}

export const list = query({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);
    const gifts = await context.db.query("gifts").collect();

    return await Promise.all(
      gifts.map(async (gift) => {
        const reservation = await context.db
          .query("reservations")
          .withIndex("by_gift_and_status", (queryBuilder) =>
            queryBuilder.eq("giftId", gift._id).eq("status", "active"),
          )
          .first();
        const imageUrl = gift.imageStorageId
          ? await context.storage.getUrl(gift.imageStorageId)
          : null;

        return { ...gift, imageUrl, reserved: reservation !== null };
      }),
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category,
    description: v.string(),
    minPrice: v.number(),
    maxPrice: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
    visible: v.boolean(),
  },
  handler: async (context, input) => {
    await requireAdmin(context);
    validatePrices(input.minPrice, input.maxPrice);

    return await context.db.insert("gifts", {
      ...input,
      name: input.name.trim(),
      description: input.description.trim(),
    });
  },
});

export const update = mutation({
  args: {
    giftId: v.id("gifts"),
    name: v.optional(v.string()),
    category: v.optional(category),
    description: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    visible: v.optional(v.boolean()),
  },
  handler: async (context, { giftId, ...updates }) => {
    await requireAdmin(context);
    const gift = await context.db.get(giftId);
    if (!gift) {
      throw new ConvexError({
        code: "GIFT_NOT_FOUND",
        message: "This gift no longer exists.",
      });
    }

    const minPrice = updates.minPrice ?? gift.minPrice;
    const maxPrice = updates.maxPrice ?? gift.maxPrice;
    validatePrices(minPrice, maxPrice);

    await context.db.patch(giftId, {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
    });

    if (
      updates.imageStorageId &&
      gift.imageStorageId &&
      updates.imageStorageId !== gift.imageStorageId
    ) {
      await context.storage.delete(gift.imageStorageId);
    }
  },
});

export const remove = mutation({
  args: { giftId: v.id("gifts") },
  handler: async (context, { giftId }) => {
    await requireAdmin(context);
    const activeReservation = await context.db
      .query("reservations")
      .withIndex("by_gift_and_status", (queryBuilder) =>
        queryBuilder.eq("giftId", giftId).eq("status", "active"),
      )
      .first();

    if (activeReservation) {
      throw new ConvexError({
        code: "GIFT_IS_RESERVED",
        message: "Cancel the active reservation before deleting this gift.",
      });
    }

    const gift = await context.db.get(giftId);
    if (!gift) return { removed: false };

    if (gift.imageStorageId) {
      await context.storage.delete(gift.imageStorageId);
    }
    await context.db.delete(giftId);
    return { removed: true };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (context) => {
    await requireAdmin(context);
    return await context.storage.generateUploadUrl();
  },
});

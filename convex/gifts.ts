import { query } from "./_generated/server";

export const listVisible = query({
  args: {},
  handler: async (context) => {
    const gifts = await context.db
      .query("gifts")
      .withIndex("by_visible", (queryBuilder) => queryBuilder.eq("visible", true))
      .collect();

    return await Promise.all(
      gifts.map(async (gift) => {
        const activeReservation = await context.db
          .query("reservations")
          .withIndex("by_gift_and_status", (queryBuilder) =>
            queryBuilder.eq("giftId", gift._id).eq("status", "active"),
          )
          .first();

        const imageUrl = gift.imageStorageId
          ? await context.storage.getUrl(gift.imageStorageId)
          : null;

        return {
          id: gift._id,
          name: gift.name,
          category: gift.category,
          description: gift.description,
          minPrice: gift.minPrice,
          maxPrice: gift.maxPrice,
          imageUrl,
          reserved: activeReservation !== null,
        };
      }),
    );
  },
});

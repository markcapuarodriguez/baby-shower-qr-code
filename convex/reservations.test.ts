import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("gift reservations", () => {
  test("only one concurrent reservation can claim a gift", async () => {
    const t = convexTest(schema, modules);
    const giftId = await t.run(async (context) => {
      return await context.db.insert("gifts", {
        name: "Muslin Swaddles",
        category: "Essentials",
        description: "Soft wraps",
        minPrice: 70,
        maxPrice: 150,
        visible: true,
      });
    });

    const attempts = await Promise.allSettled([
      t.mutation(api.reservations.reserve, {
        giftId,
        guestName: "Guest One",
        mobileNumber: "+971500000001",
      }),
      t.mutation(api.reservations.reserve, {
        giftId,
        guestName: "Guest Two",
        mobileNumber: "+971500000002",
      }),
    ]);

    expect(attempts.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter((result) => result.status === "rejected")).toHaveLength(1);

    const activeReservations = await t.run(async (context) => {
      return await context.db
        .query("reservations")
        .withIndex("by_gift_and_status", (queryBuilder) =>
          queryBuilder.eq("giftId", giftId).eq("status", "active"),
        )
        .collect();
    });
    expect(activeReservations).toHaveLength(1);

    const [gift] = await t.query(api.gifts.listVisible);
    expect(gift.reserved).toBe(true);
  });

  test("rejects bot-filled honeypot submissions", async () => {
    const t = convexTest(schema, modules);
    const giftId = await t.run(async (context) => {
      return await context.db.insert("gifts", {
        name: "Bottle Set",
        category: "Feeding",
        description: "Starter set",
        minPrice: 100,
        maxPrice: 250,
        visible: true,
      });
    });

    await expect(
      t.mutation(api.reservations.reserve, {
        giftId,
        guestName: "Automated Guest",
        website: "https://spam.example",
      }),
    ).rejects.toThrow();

    const reservations = await t.run((context) =>
      context.db.query("reservations").collect(),
    );
    expect(reservations).toHaveLength(0);
  });
});

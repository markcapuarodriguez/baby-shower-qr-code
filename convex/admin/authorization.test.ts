import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";

describe("admin authorization", () => {
  test("rejects unauthenticated dashboard reads", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.admin.dashboard.getStats)).rejects.toThrow();
  });

  test("allows an authenticated allowlisted admin", async () => {
    const t = convexTest(schema, modules);
    const userId = await t.run(async (context) => {
      const id = await context.db.insert("users", {
        email: "host@example.com",
      });
      await context.db.insert("adminUsers", {
        authUserId: id,
        role: "admin",
      });
      return id;
    });

    const asAdmin = t.withIdentity({
      subject: `${userId}|test-session`,
      issuer: "https://test.example",
      tokenIdentifier: `https://test.example|${userId}`,
    });
    const stats = await asAdmin.query(api.admin.dashboard.getStats);
    expect(stats).toEqual({
      rsvpResponses: 0,
      attendingGuests: 0,
      declinedResponses: 0,
      visibleGifts: 0,
      reservedGifts: 0,
    });
  });
});

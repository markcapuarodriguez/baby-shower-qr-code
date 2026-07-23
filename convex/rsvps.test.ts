import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

const validRsvp = {
  guestName: "Jamie Guest",
  mobile: "+971500000010",
  attendance: "attending" as const,
  numberOfGuests: 2,
};

describe("RSVP submissions", () => {
  test("normalizes non-attending guest counts to zero", async () => {
    const t = convexTest(schema, modules);
    const rsvpId = await t.mutation(api.rsvps.submit, {
      ...validRsvp,
      attendance: "not_attending",
      numberOfGuests: 7,
    });

    const rsvp = await t.run((context) => context.db.get(rsvpId));
    expect(rsvp?.numberOfGuests).toBe(0);
  });

  test("limits repeated attempts for the same mobile number", async () => {
    const t = convexTest(schema, modules);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await t.mutation(api.rsvps.submit, validRsvp);
    }

    await expect(t.mutation(api.rsvps.submit, validRsvp)).rejects.toThrow();
    const rsvps = await t.run((context) => context.db.query("rsvps").collect());
    expect(rsvps).toHaveLength(4);
  });

  test("rejects invalid contact information and honeypots", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.rsvps.submit, { ...validRsvp, mobile: "12" }),
    ).rejects.toThrow();
    await expect(
      t.mutation(api.rsvps.submit, {
        ...validRsvp,
        website: "https://spam.example",
      }),
    ).rejects.toThrow();
  });
});

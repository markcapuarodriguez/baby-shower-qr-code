import { describe, expect, test } from "vitest";
import { buildRsvpCsv } from "../app/lib/csv";

describe("RSVP CSV export", () => {
  test("includes a Unicode marker and safely quotes commas and quotes", () => {
    const csv = buildRsvpCsv([
      {
        guestName: 'Jamie "J" Guest',
        mobile: "+971500000000",
        email: "jamie@example.com",
        attendance: "attending",
        numberOfGuests: 2,
        dietaryRestrictions: "Nuts, shellfish",
        message: "Can’t wait!",
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Jamie ""J"" Guest"');
    expect(csv).toContain('"Nuts, shellfish"');
    expect(csv).toContain('"Can’t wait!"');
  });
});

import { describe, expect, test } from "vitest";
import { buildCalendarFile } from "../app/lib/calendar";

describe("calendar export", () => {
  test("creates a timezone-aware event and escapes ICS punctuation", () => {
    const calendar = buildCalendarFile(
      {
        title: "Baby Shower, in Bloom",
        parentNames: "Alex; Sam",
        eventDate: "2026-10-10",
        eventTime: "15:30",
        eventEndTime: "19:30",
        timeZone: "Asia/Dubai",
        venue: "Garden, Dubai",
        contactPerson: "Host",
        contactNumber: "+971500000000",
        rsvpDeadline: "2026-10-01",
      },
      new Date("2026-07-23T10:00:00.000Z"),
    );

    expect(calendar).toContain("DTSTART;TZID=Asia/Dubai:20261010T153000");
    expect(calendar).toContain("DTEND;TZID=Asia/Dubai:20261010T193000");
    expect(calendar).toContain("SUMMARY:Baby Shower\\, in Bloom");
    expect(calendar).toContain("LOCATION:Garden\\, Dubai");
    expect(calendar).toContain("DTSTAMP:20260723T100000Z");
    expect(calendar).toMatch(/^BEGIN:VCALENDAR/);
    expect(calendar).toMatch(/END:VCALENDAR$/);
  });

  test("requires both a date and a time", () => {
    expect(() =>
      buildCalendarFile({
        title: "Baby Shower",
        parentNames: "Parents",
        eventDate: "",
        eventTime: "",
        timeZone: "Asia/Dubai",
        venue: "Dubai",
        contactPerson: "Host",
        contactNumber: "",
        rsvpDeadline: "",
      }),
    ).toThrow();
  });
});

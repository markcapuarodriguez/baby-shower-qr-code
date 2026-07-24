import type { PublicEventSettings } from "../components/BabyShowerExperience";

function escapeIcs(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;")
    .replaceAll("\n", "\\n");
}

export function buildCalendarFile(
  event: PublicEventSettings,
  generatedAt = new Date(),
) {
  if (!event.eventDate || !event.eventTime) {
    throw new Error("An event date and time are required.");
  }

  const date = event.eventDate.replaceAll("-", "");
  const time = event.eventTime.replace(":", "");
  const endTime = event.eventEndTime?.replace(":", "");
  const timestamp = generatedAt
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Baby in Bloom//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${date}-${time}@baby-in-bloom`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;TZID=${event.timeZone}:${date}T${time}00`,
    endTime
      ? `DTEND;TZID=${event.timeZone}:${date}T${endTime}00`
      : "DURATION:PT3H",
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.venue)}`,
    `DESCRIPTION:${escapeIcs(`Baby shower celebration for ${event.parentNames}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

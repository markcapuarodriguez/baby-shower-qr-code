export type RsvpExportRow = {
  guestName: string;
  mobile: string;
  email?: string;
  attendance: "attending" | "not_attending";
  numberOfGuests: number;
  dietaryRestrictions?: string;
  message?: string;
};

function quote(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function buildRsvpCsv(rsvps: RsvpExportRow[]) {
  const rows = [
    [
      "Guest name",
      "Mobile",
      "Email",
      "Attendance",
      "Guests",
      "Dietary restrictions",
      "Message",
    ],
    ...rsvps.map((rsvp) => [
      rsvp.guestName,
      rsvp.mobile,
      rsvp.email ?? "",
      rsvp.attendance,
      String(rsvp.numberOfGuests),
      rsvp.dietaryRestrictions ?? "",
      rsvp.message ?? "",
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(quote).join(",")).join("\r\n")}`;
}

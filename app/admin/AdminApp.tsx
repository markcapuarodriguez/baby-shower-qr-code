"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import {
  CheckCircle2,
  Download,
  Gift,
  LayoutDashboard,
  LogOut,
  Mail,
  PackageCheck,
  Printer,
  Plus,
  QrCode,
  Search,
  Settings,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ConvexClientProvider } from "../components/ConvexClientProvider";
import { buildRsvpCsv } from "../lib/csv";

type AdminSection =
  | "overview"
  | "rsvps"
  | "gifts"
  | "reservations"
  | "event"
  | "qr";

const sections: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "rsvps", label: "RSVPs", icon: Users },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "reservations", label: "Reservations", icon: PackageCheck },
  { id: "event", label: "Event settings", icon: Settings },
  { id: "qr", label: "QR code", icon: QrCode },
];

function readableError(error: unknown) {
  return error instanceof Error
    ? error.message.replace(/^.*?Uncaught\s+/, "")
    : "Something went wrong. Please try again.";
}

export function AdminApp() {
  return (
    <ConvexClientProvider
      fallback={
        <AdminMessage
          title="Backend configuration required"
          message="Add NEXT_PUBLIC_CONVEX_URL before opening the organizer dashboard."
        />
      }
    >
      <AuthLoading>
        <AdminMessage title="Opening dashboard" message="Checking your organizer session…" />
      </AuthLoading>
      <Unauthenticated>
        <AdminSignIn />
      </Unauthenticated>
      <Authenticated>
        <AdminAccessGate />
      </Authenticated>
    </ConvexClientProvider>
  );
}

function AdminMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">♡</span>
        <p className="admin-overline">Baby in Bloom</p>
        <h1>{title}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

function AdminSignIn() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn("password", new FormData(event.currentTarget));
    } catch (submissionError) {
      setError(readableError(submissionError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">♡</span>
        <p className="admin-overline">Organizer access</p>
        <h1>{mode === "signIn" ? "Welcome back" : "Create organizer account"}</h1>
        <p>
          {mode === "signIn"
            ? "Sign in to manage the celebration."
            : "Create the first account, then activate it with the setup code."}
        </p>
        <form onSubmit={submit}>
          <input name="flow" type="hidden" value={mode} />
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={10}
              required
            />
          </label>
          {mode === "signUp" && (
            <small>
              Use at least 10 characters with uppercase, lowercase, and a number.
            </small>
          )}
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-primary-button" disabled={submitting} type="submit">
            {submitting
              ? "Please wait…"
              : mode === "signIn"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <button
          className="admin-link-button"
          onClick={() => {
            setError(null);
            setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
          }}
        >
          {mode === "signIn"
            ? "Setting up the first organizer?"
            : "Already have an organizer account?"}
        </button>
        <Link className="admin-back-link" href="/">
          Return to invitation
        </Link>
      </section>
    </main>
  );
}

function AdminAccessGate() {
  const access = useQuery(api.admin.access.get);

  if (access === undefined) {
    return <AdminMessage title="Opening dashboard" message="Checking admin access…" />;
  }

  if (!access.role) {
    return <AdminActivation />;
  }

  return <AdminDashboard />;
}

function AdminActivation() {
  const bootstrap = useMutation(api.admin.access.bootstrap);
  const { signOut } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      await bootstrap({ bootstrapCode: String(data.get("bootstrapCode") ?? "") });
    } catch (activationError) {
      setError(readableError(activationError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <span className="admin-auth-mark">
          <UserCheck />
        </span>
        <p className="admin-overline">One final step</p>
        <h1>Activate admin access</h1>
        <p>Enter the private activation code configured by the project owner.</p>
        <form onSubmit={activate}>
          <label>
            Activation code
            <input name="bootstrapCode" type="password" required />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-primary-button" disabled={submitting} type="submit">
            {submitting ? "Activating…" : "Activate dashboard"}
          </button>
        </form>
        <button className="admin-link-button" onClick={() => void signOut()}>
          Sign out
        </button>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const { signOut } = useAuthActions();
  const [section, setSection] = useState<AdminSection>("overview");

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">
          <span>♡</span>
          <div>
            <strong>Baby in Bloom</strong>
            <small>Organizer dashboard</small>
          </div>
        </Link>
        <nav aria-label="Dashboard sections">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={section === item.id ? "active" : ""}
                key={item.id}
                onClick={() => setSection(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button className="admin-sign-out" onClick={() => void signOut()}>
          <LogOut size={18} /> Sign out
        </button>
      </aside>
      <section className="admin-content">
        {section === "overview" && <Overview />}
        {section === "rsvps" && <RsvpManager />}
        {section === "gifts" && <GiftManager />}
        {section === "reservations" && <ReservationManager />}
        {section === "event" && <EventSettings />}
        {section === "qr" && <QrCodeCenter />}
      </section>
    </main>
  );
}

function AdminHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div>
        <p className="admin-overline">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function Overview() {
  const stats = useQuery(api.admin.dashboard.getStats);
  const statCards = [
    { label: "RSVP responses", value: stats?.rsvpResponses, icon: Mail },
    { label: "Attending guests", value: stats?.attendingGuests, icon: Users },
    { label: "Reserved gifts", value: stats?.reservedGifts, icon: PackageCheck },
    { label: "Visible gifts", value: stats?.visibleGifts, icon: Gift },
  ];

  return (
    <>
      <AdminHeader
        eyebrow="Celebration overview"
        title="Everything at a glance"
        description="Live responses and wishlist activity update automatically."
      />
      <div className="admin-stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label}>
              <span>
                <Icon />
              </span>
              <p>{stat.label}</p>
              <strong>{stat.value ?? "—"}</strong>
            </article>
          );
        })}
      </div>
      <div className="admin-welcome-panel">
        <div>
          <p className="admin-overline">Today’s focus</p>
          <h2>Your celebration is taking shape</h2>
          <p>
            Review new RSVPs, keep gift details current, and confirm the event
            information before sharing the QR code.
          </p>
        </div>
        <span>☾</span>
      </div>
    </>
  );
}

function RsvpManager() {
  const rsvps = useQuery(api.admin.rsvps.list);
  const removeRsvp = useMutation(api.admin.rsvps.remove);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      (rsvps ?? []).filter((rsvp) =>
        `${rsvp.guestName} ${rsvp.mobile} ${rsvp.email ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rsvps, search],
  );

  function exportCsv() {
    if (!rsvps) return;
    const csv = buildRsvpCsv(rsvps);
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "baby-shower-rsvps.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <AdminHeader
        eyebrow="Guest responses"
        title="RSVP management"
        description="Search responses, review attendance, and export the guest list."
        action={
          <button className="admin-secondary-button" onClick={exportCsv}>
            <Download size={17} /> Export CSV
          </button>
        }
      />
      <label className="admin-search">
        <Search size={18} />
        <input
          aria-label="Search RSVPs"
          placeholder="Search name, mobile, or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Attendance</th>
              <th>Party</th>
              <th>Contact</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((rsvp) => (
              <tr key={rsvp._id}>
                <td>
                  <strong>{rsvp.guestName}</strong>
                  <small>{rsvp.message || "No message"}</small>
                </td>
                <td>
                  <span className={`admin-status ${rsvp.attendance}`}>
                    {rsvp.attendance === "attending" ? "Attending" : "Unable to attend"}
                  </span>
                </td>
                <td>{rsvp.numberOfGuests}</td>
                <td>
                  <strong>{rsvp.mobile}</strong>
                  <small>{rsvp.email || "No email"}</small>
                </td>
                <td>
                  <button
                    className="admin-icon-button danger"
                    aria-label={`Delete RSVP from ${rsvp.guestName}`}
                    onClick={() => void removeRsvp({ rsvpId: rsvp._id })}
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="admin-empty">No matching RSVPs yet.</p>}
      </div>
    </>
  );
}

function GiftManager() {
  const gifts = useQuery(api.admin.gifts.list);
  const createGift = useMutation(api.admin.gifts.create);
  const updateGift = useMutation(api.admin.gifts.update);
  const removeGift = useMutation(api.admin.gifts.remove);
  const generateUploadUrl = useMutation(api.admin.gifts.generateUploadUrl);
  const [showForm, setShowForm] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<Id<"gifts"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editingGift = gifts?.find((gift) => gift._id === editingGiftId);

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Choose a PNG, JPEG, WebP, or other image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Gift images must be 5 MB or smaller.");
    }

    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("The gift image could not be uploaded.");
    const result = (await response.json()) as { storageId: Id<"_storage"> };
    return result.storageId;
  }

  async function submitGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    setSaving(true);
    try {
      const file = data.get("image");
      const imageStorageId =
        file instanceof File && file.size > 0 ? await uploadImage(file) : undefined;
      const fields = {
        name: String(data.get("name") ?? ""),
        category: String(data.get("category")) as
          | "Essentials"
          | "Feeding"
          | "Bath & Care"
          | "Clothing"
          | "Nursery"
          | "Travel"
          | "Health",
        description: String(data.get("description") ?? ""),
        minPrice: Number(data.get("minPrice")),
        maxPrice: Number(data.get("maxPrice")),
        ...(imageStorageId ? { imageStorageId } : {}),
      };

      if (editingGift) {
        await updateGift({ giftId: editingGift._id, ...fields });
      } else {
        await createGift({ ...fields, visible: true });
      }
      form.reset();
      setShowForm(false);
      setEditingGiftId(null);
    } catch (submissionError) {
      setError(readableError(submissionError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <AdminHeader
        eyebrow="Registry"
        title="Gift management"
        description="Keep the wishlist clear, useful, and up to date."
        action={
          <button
            className="admin-primary-button compact"
            onClick={() => {
              setEditingGiftId(null);
              setShowForm(true);
            }}
          >
            <Plus size={17} /> Add gift
          </button>
        }
      />
      {showForm && (
        <form
          className="admin-panel admin-gift-form"
          key={editingGift?._id ?? "new"}
          onSubmit={submitGift}
        >
          <div className="admin-form-grid">
            <label>
              Gift name
              <input name="name" defaultValue={editingGift?.name} required />
            </label>
            <label>
              Category
              <select
                name="category"
                required
                defaultValue={editingGift?.category ?? "Essentials"}
              >
                {["Essentials", "Feeding", "Bath & Care", "Clothing", "Nursery", "Travel", "Health"].map(
                  (category) => <option key={category}>{category}</option>,
                )}
              </select>
            </label>
            <label>
              Minimum price
              <input
                name="minPrice"
                type="number"
                min="0"
                max="300"
                defaultValue={editingGift?.minPrice}
                required
              />
            </label>
            <label>
              Maximum price
              <input
                name="maxPrice"
                type="number"
                min="0"
                max="300"
                defaultValue={editingGift?.maxPrice}
                required
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={3}
              defaultValue={editingGift?.description}
              required
            />
          </label>
          <label>
            Gift image <small>PNG, JPEG, or WebP · maximum 5 MB</small>
            <input name="image" type="file" accept="image/*" />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-form-actions">
            <button
              className="admin-primary-button compact"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : editingGift ? "Update gift" : "Save gift"}
            </button>
            <button
              className="admin-link-button"
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingGiftId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="admin-gift-list">
        {(gifts ?? []).map((gift) => (
          <article key={gift._id}>
            <span className="admin-gift-symbol">
              {gift.imageUrl ? (
                <Image
                  src={gift.imageUrl}
                  alt=""
                  width={120}
                  height={120}
                  unoptimized
                />
              ) : (
                "🎁"
              )}
            </span>
            <div>
              <p>{gift.category}</p>
              <h3>{gift.name}</h3>
              <small>AED {gift.minPrice}–{gift.maxPrice}</small>
            </div>
            <span className={`admin-status ${gift.reserved ? "reserved" : "available"}`}>
              {gift.reserved ? "Reserved" : gift.visible ? "Available" : "Hidden"}
            </span>
            <div className="admin-row-actions">
              <button
                className="admin-secondary-button compact"
                onClick={() => {
                  setError(null);
                  setEditingGiftId(gift._id);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button
                className="admin-secondary-button compact"
                onClick={() => void updateGift({ giftId: gift._id, visible: !gift.visible })}
              >
                {gift.visible ? "Hide" : "Show"}
              </button>
              <button
                className="admin-icon-button danger"
                aria-label={`Delete ${gift.name}`}
                disabled={gift.reserved}
                onClick={() => void removeGift({ giftId: gift._id })}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function ReservationManager() {
  const reservations = useQuery(api.admin.reservations.list);
  const cancelReservation = useMutation(api.admin.reservations.cancel);

  return (
    <>
      <AdminHeader
        eyebrow="Registry activity"
        title="Gift reservations"
        description="Review reservation codes and restore gifts when plans change."
      />
      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Gift</th>
              <th>Guest</th>
              <th>Code</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {(reservations ?? []).map((reservation) => (
              <tr key={reservation._id}>
                <td><strong>{reservation.giftName}</strong></td>
                <td>
                  <strong>{reservation.guestName}</strong>
                  <small>{reservation.mobileNumber || "No mobile"}</small>
                </td>
                <td><code>{reservation.reservationCode}</code></td>
                <td>
                  <span className={`admin-status ${reservation.status}`}>
                    {reservation.status}
                  </span>
                </td>
                <td>
                  {reservation.status === "active" && (
                    <button
                      className="admin-secondary-button compact"
                      onClick={() => void cancelReservation({ reservationId: reservation._id })}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations?.length === 0 && <p className="admin-empty">No reservations yet.</p>}
      </div>
    </>
  );
}

function EventSettings() {
  const event = useQuery(api.admin.eventSettings.get);
  const saveEvent = useMutation(api.admin.eventSettings.save);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();
    const data = new FormData(eventForm.currentTarget);
    setSaved(false);
    setError(null);
    try {
      await saveEvent({
        title: String(data.get("title") ?? ""),
        parentNames: String(data.get("parentNames") ?? ""),
        eventDate: String(data.get("eventDate") ?? ""),
        eventTime: String(data.get("eventTime") ?? ""),
        eventEndTime: String(data.get("eventEndTime") ?? "") || undefined,
        timeZone: String(data.get("timeZone") ?? ""),
        venue: String(data.get("venue") ?? ""),
        googleMaps: String(data.get("googleMaps") ?? "") || undefined,
        dressCode: String(data.get("dressCode") ?? "") || undefined,
        parking: String(data.get("parking") ?? "") || undefined,
        contactPerson: String(data.get("contactPerson") ?? ""),
        contactNumber: String(data.get("contactNumber") ?? ""),
        rsvpDeadline: String(data.get("rsvpDeadline") ?? ""),
        announcement: String(data.get("announcement") ?? "") || undefined,
      });
      setSaved(true);
    } catch (submissionError) {
      setError(readableError(submissionError));
    }
  }

  if (event === undefined) {
    return <AdminMessage title="Loading event" message="Getting the latest details…" />;
  }

  return (
    <>
      <AdminHeader
        eyebrow="Invitation content"
        title="Event settings"
        description="These details will become the source of truth for the public invitation."
      />
      <form className="admin-panel admin-event-form" onSubmit={submit}>
        <div className="admin-form-grid">
          <label>
            Event title
            <input name="title" defaultValue={event?.title} required />
          </label>
          <label>
            Parent names
            <input name="parentNames" defaultValue={event?.parentNames} required />
          </label>
          <label>
            Date
            <input name="eventDate" type="date" defaultValue={event?.eventDate} required />
          </label>
          <label>
            Start time
            <input name="eventTime" type="time" defaultValue={event?.eventTime} required />
          </label>
          <label>
            End time
            <input
              name="eventEndTime"
              type="time"
              defaultValue={event?.eventEndTime}
            />
          </label>
          <label>
            RSVP deadline
            <input name="rsvpDeadline" type="date" defaultValue={event?.rsvpDeadline} required />
          </label>
          <label>
            Time zone
            <input name="timeZone" defaultValue={event?.timeZone || "Asia/Dubai"} required />
          </label>
          <label>
            Venue
            <input name="venue" defaultValue={event?.venue} required />
          </label>
          <label>
            Google Maps URL
            <input name="googleMaps" type="url" defaultValue={event?.googleMaps} />
          </label>
          <label>
            Dress code
            <input name="dressCode" defaultValue={event?.dressCode} />
          </label>
          <label>
            Parking
            <input name="parking" defaultValue={event?.parking} />
          </label>
          <label>
            Contact person
            <input name="contactPerson" defaultValue={event?.contactPerson} required />
          </label>
          <label>
            Contact number
            <input name="contactNumber" defaultValue={event?.contactNumber} required />
          </label>
        </div>
        <label>
          Announcement
          <textarea name="announcement" rows={3} defaultValue={event?.announcement} />
        </label>
        {error && <p className="admin-error">{error}</p>}
        {saved && (
          <p className="admin-success">
            <CheckCircle2 size={18} /> Event settings saved.
          </p>
        )}
        <button className="admin-primary-button compact" type="submit">
          Save event details
        </button>
      </form>
    </>
  );
}

function QrCodeCenter() {
  const event = useQuery(api.admin.eventSettings.get);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const [siteUrl, setSiteUrl] = useState(
    configuredSiteUrl && !configuredSiteUrl.includes("yourdomain.com")
      ? configuredSiteUrl
      : "",
  );
  const browserOrigin = useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
  const currentSiteUrl = siteUrl || browserOrigin;
  const [pngData, setPngData] = useState("");
  const [svgData, setSvgData] = useState("");

  useEffect(() => {
    let active = true;
    const normalizedUrl = currentSiteUrl.trim();
    if (!normalizedUrl) return;

    void Promise.all([
      QRCode.toDataURL(normalizedUrl, {
        width: 900,
        margin: 3,
        color: { dark: "#26352f", light: "#fffdf8" },
        errorCorrectionLevel: "H",
      }),
      QRCode.toString(normalizedUrl, {
        type: "svg",
        margin: 3,
        color: { dark: "#26352f", light: "#fffdf8" },
        errorCorrectionLevel: "H",
      }),
    ]).then(([png, svg]) => {
      if (!active) return;
      setPngData(png);
      setSvgData(svg);
    });

    return () => {
      active = false;
    };
  }, [currentSiteUrl]);

  function downloadPng() {
    if (!pngData) return;
    const link = document.createElement("a");
    link.href = pngData;
    link.download = "baby-shower-qr.png";
    link.click();
  }

  function downloadSvg() {
    if (!svgData) return;
    const url = URL.createObjectURL(
      new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "baby-shower-qr.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-qr-page">
      <AdminHeader
        eyebrow="Printed invitation"
        title="Invitation QR code"
        description="Guests can scan this code to open the invitation, RSVP, and view the wishlist."
      />
      <div className="admin-qr-layout">
        <section className="admin-panel admin-qr-settings">
          <label>
            Public website URL
            <input
              type="url"
              value={currentSiteUrl}
              onChange={(inputEvent) => setSiteUrl(inputEvent.target.value)}
            />
          </label>
          <p>
            Set the final production domain before downloading or printing the
            invitations.
          </p>
          <div className="admin-qr-actions">
            <button className="admin-primary-button compact" onClick={downloadPng}>
              <Download size={17} /> Download PNG
            </button>
            <button className="admin-secondary-button compact" onClick={downloadSvg}>
              <Download size={17} /> Download SVG
            </button>
            <button
              className="admin-secondary-button compact"
              onClick={() => window.print()}
            >
              <Printer size={17} /> Print
            </button>
          </div>
        </section>
        <section className="admin-qr-card">
          <p className="admin-overline">You’re invited</p>
          <h2>{event?.title || "Baby in Bloom"}</h2>
          <p>
            Scan to view the invitation
            {event?.parentNames ? ` for ${event.parentNames}` : ""}.
          </p>
          {pngData && (
            <Image
              src={pngData}
              alt={`QR code for ${siteUrl}`}
              width={900}
              height={900}
              unoptimized
            />
          )}
          <strong>{siteUrl}</strong>
        </section>
      </div>
    </div>
  );
}

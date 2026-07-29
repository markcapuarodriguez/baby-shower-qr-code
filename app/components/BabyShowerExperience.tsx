"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Gift as GiftIcon,
  Heart,
  MapPin,
  Menu,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { gifts as previewGifts, type Gift } from "./gift-data";
import { buildCalendarFile } from "../lib/calendar";

type Reservation = {
  gift: Gift;
  code: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/^.*?Uncaught\s+/, "");
  }
  return "Something went wrong. Please try again.";
}

function EventCountdown({ date, time }: { date: string; time: string }) {
  const eventTime = useMemo(() => new Date(`${date}T${time}:00`).getTime(), [date, time]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, eventTime - Date.now()),
  );

  useEffect(() => {
    const interval = window.setInterval(
      () => setRemaining(Math.max(0, eventTime - Date.now())),
      60_000,
    );
    return () => window.clearInterval(interval);
  }, [eventTime]);

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);

  return (
    <div className="countdown" aria-label={`${days} days, ${hours} hours, and ${minutes} minutes until the event`}>
      <span><strong>{days}</strong>Days</span>
      <span><strong>{hours}</strong>Hours</span>
      <span><strong>{minutes}</strong>Minutes</span>
    </div>
  );
}

export type RsvpSubmission = {
  guestName: string;
  mobile: string;
  email?: string;
  attendance: "attending" | "not_attending";
  numberOfGuests: number;
  dietaryRestrictions?: string;
  message?: string;
  website?: string;
};

export type GiftReservationSubmission = {
  giftId: string;
  guestName: string;
  mobileNumber?: string;
  website?: string;
};

export type PublicEventSettings = {
  title: string;
  parentNames: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string;
  timeZone: string;
  venue: string;
  googleMaps?: string;
  dressCode?: string;
  parking?: string;
  contactPerson: string;
  contactNumber: string;
  rsvpDeadline: string;
  announcement?: string;
};

function getMapEmbedUrl(googleMapsUrl: string, venue: string) {
  const coordinates = googleMapsUrl.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  );
  const query = coordinates
    ? `${coordinates[1]},${coordinates[2]}`
    : venue;

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
}

type BabyShowerExperienceProps = {
  gifts?: Gift[];
  event?: PublicEventSettings | null;
  onSubmitRsvp?: (submission: RsvpSubmission) => Promise<void>;
  onReserveGift?: (
    submission: GiftReservationSubmission,
  ) => Promise<{ reservationCode: string }>;
};

export function BabyShowerExperience({
  gifts = previewGifts,
  event,
  onSubmitRsvp,
  onReserveGift,
}: BabyShowerExperienceProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpComplete, setRsvpComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(gifts.map((gift) => gift.category)))],
    [gifts],
  );
  const visibleGifts = useMemo(
    () =>
      selectedCategory === "All"
        ? gifts
        : gifts.filter((gift) => gift.category === selectedCategory),
    [gifts, selectedCategory],
  );

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  }

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const attendance =
      data.get("attendance") === "yes" ? "attending" : "not_attending";

    setFormError(null);
    setRsvpSubmitting(true);
    try {
      await onSubmitRsvp?.({
        guestName: String(data.get("guestName") ?? "").trim(),
        mobile: String(data.get("mobile") ?? "").trim(),
        email: String(data.get("email") ?? "").trim() || undefined,
        attendance,
        numberOfGuests:
          attendance === "attending"
            ? Number(data.get("numberOfGuests") ?? 1)
            : 0,
        dietaryRestrictions:
          String(data.get("dietaryRestrictions") ?? "").trim() || undefined,
        message: String(data.get("message") ?? "").trim() || undefined,
        website: String(data.get("website") ?? "").trim() || undefined,
      });
      form.reset();
      setRsvpComplete(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setRsvpSubmitting(false);
    }
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedGift) return;

    const data = new FormData(event.currentTarget);
    const guestName = String(data.get("reservationName") ?? "").trim();
    if (!guestName) return;

    setFormError(null);
    setReservationSubmitting(true);
    try {
      const result = onReserveGift
        ? await onReserveGift({
            giftId: selectedGift.id,
            guestName,
            mobileNumber:
              String(data.get("reservationMobile") ?? "").trim() || undefined,
            website:
              String(data.get("reservationWebsite") ?? "").trim() || undefined,
          })
        : {
            reservationCode: `BABY-${Math.random()
              .toString(36)
              .slice(2, 8)
              .toUpperCase()}`,
          };

      setReservation({
        gift: selectedGift,
        code: result.reservationCode,
      });
      setSelectedGift(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setReservationSubmitting(false);
    }
  }

  async function shareInvitation() {
    const shareData = {
      title: event?.title || "Baby Shower Celebration",
      text: "You’re invited to celebrate a little one on the way.",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(window.location.href);
  }

  function downloadCalendar() {
    if (!event?.eventDate || !event.eventTime) return;
    const calendar = buildCalendarFile(event);
    const url = URL.createObjectURL(
      new Blob([calendar], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "baby-shower.ics";
    link.click();
    URL.revokeObjectURL(url);
  }

  const formattedDate = event?.eventDate
    ? new Date(`${event.eventDate}T12:00:00`).toLocaleDateString("en-AE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Coming soon";
  const formatEventTime = (time: string) =>
    new Date(`2000-01-01T${time}:00`).toLocaleTimeString("en-AE", {
        hour: "numeric",
        minute: "2-digit",
      });
  const formattedTime = event?.eventTime
    ? `${formatEventTime(event.eventTime)}${
        event.eventEndTime ? `–${formatEventTime(event.eventEndTime)}` : ""
      }`
    : "To be announced";

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Baby shower home">
          <span className="brand-mark">
            <Heart size={18} fill="currentColor" />
          </span>
          <span>Baby in Bloom</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <button onClick={() => scrollTo("details")}>The Day</button>
          <button onClick={() => scrollTo("gifts")}>Gift Wishlist</button>
          <button className="nav-rsvp" onClick={() => setRsvpOpen(true)}>
            RSVP
          </button>
        </nav>

        <button
          className="menu-button"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X /> : <Menu />}
        </button>

        {mobileNavOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <button onClick={() => scrollTo("details")}>The Day</button>
            <button onClick={() => scrollTo("gifts")}>Gift Wishlist</button>
            <button onClick={() => setRsvpOpen(true)}>RSVP</button>
          </nav>
        )}
      </header>

      <section className="hero" id="home">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} /> A sweet celebration awaits
          </span>
          <p className="hero-kicker">Please join us for a</p>
          <h1>
            {event?.title || "Baby Shower"}
            <span>{event?.parentNames ? `for ${event.parentNames}` : "in Bloom"}</span>
          </h1>
          <p className="hero-text">
            Tiny hands, sleepy smiles, and a lifetime of love. Come celebrate
            this beautiful new chapter with us.
          </p>
          {event?.eventDate && event.eventTime && (
            <EventCountdown date={event.eventDate} time={event.eventTime} />
          )}
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setRsvpOpen(true)}>
              Kindly RSVP <ChevronRight size={18} />
            </button>
            <button className="button button-secondary" onClick={() => scrollTo("gifts")}>
              <GiftIcon size={18} /> View wishlist
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="arch">
            <div className="moon">☾</div>
            <div className="cloud cloud-one" />
            <div className="cloud cloud-two" />
            <div className="stars">✦ · ✧ · ✦</div>
            <div className="bassinet">
              <div className="bassinet-canopy" />
              <div className="bassinet-basket">♡</div>
              <div className="bassinet-legs" />
            </div>
          </div>
          <span className="art-label">A little dream is on the way</span>
        </div>
      </section>

      <section className="announcement">
        <span>With full hearts</span>
        <p>
          {event?.announcement ||
            "We’re gathering our favorite people for an afternoon of warmth, laughter, and love."}
        </p>
      </section>

      <section className="details-section" id="details">
        <div className="section-heading">
          <span className="eyebrow">Save the date</span>
          <h2>The sweetest afternoon</h2>
          <p>
            {event?.eventDate
              ? `Celebrating ${event.parentNames} and their beautiful new chapter.`
              : "Final event details will be shared here by the hosts."}
          </p>
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <span className="detail-icon">
              <CalendarDays />
            </span>
            <p className="detail-label">Date</p>
            <h3>{formattedDate}</h3>
            <p>
              {event?.rsvpDeadline
                ? `Please RSVP by ${new Date(`${event.rsvpDeadline}T12:00:00`).toLocaleDateString("en-AE", { day: "numeric", month: "long" })}.`
                : "Please check back for the celebration date."}
            </p>
          </article>
          <article className="detail-card featured">
            <span className="detail-icon">
              <Clock3 />
            </span>
            <p className="detail-label">Time</p>
            <h3>{formattedTime}</h3>
            <p>{event?.timeZone || "We’ll share the gathering time with your invitation."}</p>
          </article>
          <article className="detail-card">
            <span className="detail-icon">
              <MapPin />
            </span>
            <p className="detail-label">Venue</p>
            <h3>{event?.venue || "Dubai, UAE"}</h3>
            <p>{event?.parking || "The full venue and parking details are coming soon."}</p>
          </article>
        </div>

        {event && (event.dressCode || event.contactNumber || event.googleMaps) && (
          <div className="event-extras">
            {event.dressCode && (
              <span>
                <strong>Dress code</strong>
                {event.dressCode}
              </span>
            )}
            {event.contactNumber && (
              <a href={`tel:${event.contactNumber}`}>
                <strong>Contact</strong>
                {event.contactPerson} · {event.contactNumber}
              </a>
            )}
            {event.googleMaps && (
              <a href={event.googleMaps} target="_blank" rel="noreferrer">
                <strong>Directions</strong>
                Open in Google Maps
              </a>
            )}
          </div>
        )}

        {event?.googleMaps && (
          <div className="event-map">
            <iframe
              title={`Map to ${event.venue}`}
              src={getMapEmbedUrl(event.googleMaps, event.venue)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a href={event.googleMaps} target="_blank" rel="noreferrer">
              <MapPin size={18} />
              Open location in Google Maps
            </a>
          </div>
        )}

        <div className="detail-actions">
          <button
            className="text-button"
            disabled={!event?.eventDate || !event.eventTime}
            title={!event?.eventDate ? "Available once the event date is set" : undefined}
            onClick={downloadCalendar}
          >
            <CalendarDays size={18} /> Add to calendar
          </button>
          <button className="text-button" onClick={shareInvitation}>
            <Share2 size={18} /> Share invitation
          </button>
        </div>
      </section>

      <section className="gift-section" id="gifts">
        <div className="gift-intro">
          <div>
            <span className="eyebrow">Chosen with care</span>
            <h2>A little wishlist</h2>
          </div>
          <p>
            Your presence is the loveliest gift. If you’d like to bring
            something more, these thoughtful essentials will help welcome baby.
          </p>
        </div>

        {categories.length > 2 && (
          <div className="filter-row" aria-label="Filter gifts by category">
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? "active" : ""}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="gift-grid">
          {visibleGifts.map((gift) => (
            <article className="gift-card" key={gift.id}>
              <div className="gift-visual">
                {gift.imageUrl ? (
                  <Image
                    className="gift-image"
                    src={gift.imageUrl}
                    alt={gift.name}
                    width={640}
                    height={420}
                    unoptimized
                  />
                ) : (
                  <span>{gift.icon}</span>
                )}
                {gift.imageSourceUrl && (
                  <a
                    className="gift-image-credit"
                    href={gift.imageSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View photo source for ${gift.name}`}
                  >
                    Photo source
                  </a>
                )}
                <small className={gift.reserved ? "reserved" : "available"}>
                  {gift.reserved ? "Reserved" : "Available"}
                </small>
              </div>
              <div className="gift-card-copy">
                {gift.category !== "Wishlist" && <p>{gift.category}</p>}
                <h3>{gift.name}</h3>
                {gift.price && <span className="gift-price">{gift.price}</span>}
                {gift.description && (
                  <p className="gift-description">{gift.description}</p>
                )}
                <button
                  disabled={gift.reserved}
                  onClick={() => {
                    setFormError(null);
                    setSelectedGift(gift);
                  }}
                >
                  {gift.reserved ? (
                    <>
                      <Check size={17} /> Thoughtfully reserved
                    </>
                  ) : (
                    <>
                      Reserve this gift <ChevronRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-card">
          <span className="closing-heart">♡</span>
          <p className="hero-kicker">We can’t wait to celebrate</p>
          <h2>Will you join us?</h2>
          <p>
            Please let us know when the final date is shared. It should take
            less than two minutes.
          </p>
          <button className="button button-primary" onClick={() => setRsvpOpen(true)}>
            RSVP now <ChevronRight size={18} />
          </button>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">
            <Heart size={18} fill="currentColor" />
          </span>
          <span>Baby in Bloom</span>
        </a>
        <p>Made with love for a very special little arrival.</p>
      </footer>

      {rsvpOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-title">
            <button
              className="modal-close"
              aria-label="Close RSVP form"
              onClick={() => {
                setRsvpOpen(false);
                setRsvpComplete(false);
                setFormError(null);
              }}
            >
              <X />
            </button>

            {rsvpComplete ? (
              <div className="success-state">
                <span>
                  <Check size={32} />
                </span>
                <p className="eyebrow">RSVP received</p>
                <h2 id="rsvp-title">Thank you!</h2>
                <p>We can’t wait to celebrate with you.</p>
                <button className="button button-primary" onClick={() => setRsvpOpen(false)}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <span className="eyebrow">You’re invited</span>
                <h2 id="rsvp-title">Kindly RSVP</h2>
                <p className="modal-intro">Tell us who’s coming to celebrate.</p>
                <form onSubmit={submitRsvp}>
                  <label className="honeypot-field" aria-hidden="true">
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                  <label>
                    Guest name
                    <input name="guestName" autoComplete="name" required placeholder="Your full name" />
                  </label>
                  <div className="form-row">
                    <label>
                      Mobile number
                      <input name="mobile" type="tel" autoComplete="tel" required placeholder="+971" />
                    </label>
                    <label>
                      Email <small>optional</small>
                      <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                    </label>
                  </div>
                  <fieldset>
                    <legend>Will you attend?</legend>
                    <div className="choice-row">
                      <label>
                        <input type="radio" name="attendance" value="yes" required />
                        Joyfully attending
                      </label>
                      <label>
                        <input type="radio" name="attendance" value="no" required />
                        Unable to attend
                      </label>
                    </div>
                  </fieldset>
                  <div className="form-row">
                    <label>
                      Number of guests
                      <input name="numberOfGuests" type="number" min="1" max="10" defaultValue="1" />
                    </label>
                    <label>
                      Food restrictions
                      <input name="dietaryRestrictions" placeholder="Optional" />
                    </label>
                  </div>
                  <label>
                    A message for the parents
                    <textarea name="message" rows={3} placeholder="Share a little love…" />
                  </label>
                  {formError && (
                    <p className="form-error" role="alert">
                      {formError}
                    </p>
                  )}
                  <button
                    className="button button-primary submit-button"
                    type="submit"
                    disabled={rsvpSubmitting}
                  >
                    {rsvpSubmitting ? "Sending…" : "Send RSVP"}{" "}
                    <ChevronRight size={18} />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}

      {selectedGift && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal compact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-title"
          >
            <button
              className="modal-close"
              aria-label="Close gift reservation"
              onClick={() => {
                setSelectedGift(null);
                setFormError(null);
              }}
            >
              <X />
            </button>
            <span className="gift-modal-icon">{selectedGift.icon}</span>
            <p className="eyebrow">{selectedGift.category}</p>
            <h2 id="reservation-title">Reserve {selectedGift.name}</h2>
            <p className="modal-intro">
              We’ll keep your name private and mark this gift as reserved.
            </p>
            <form onSubmit={submitReservation}>
              <label className="honeypot-field" aria-hidden="true">
                Website
                <input
                  name="reservationWebsite"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
              <label>
                Your name
                <input name="reservationName" required autoComplete="name" placeholder="Your full name" />
              </label>
              <label>
                Mobile number <small>optional</small>
                <input name="reservationMobile" type="tel" autoComplete="tel" placeholder="+971" />
              </label>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <button
                className="button button-primary submit-button"
                type="submit"
                disabled={reservationSubmitting}
              >
                {reservationSubmitting ? "Reserving…" : "Confirm reservation"}
              </button>
            </form>
          </section>
        </div>
      )}

      {reservation && (
        <div className="toast" role="status">
          <span>
            <Check size={19} />
          </span>
          <div>
            <strong>{reservation.gift.name} reserved</strong>
            <p>Keep your code: {reservation.code}</p>
          </div>
          <button aria-label="Dismiss reservation confirmation" onClick={() => setReservation(null)}>
            <X size={18} />
          </button>
        </div>
      )}
    </main>
  );
}

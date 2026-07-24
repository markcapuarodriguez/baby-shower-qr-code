"use client";

import { useMutation, useQuery } from "convex/react";
import type { Id } from "convex/values";
import { api } from "../../convex/_generated/api";
import {
  BabyShowerExperience,
  type GiftReservationSubmission,
} from "./BabyShowerExperience";
import { gifts as previewGifts, type Gift } from "./gift-data";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { wishlistImages } from "./wishlist-images";

const categoryIcons: Record<string, string> = {
  Essentials: "☁️",
  Feeding: "🍼",
  "Bath & Care": "🫧",
  Clothing: "🧸",
  Nursery: "🧺",
  Travel: "🛺",
  Health: "🌡️",
};

function formatPrice(minPrice: number, maxPrice: number) {
  if (minPrice === 0 && maxPrice === 0) return "";

  return minPrice === maxPrice
    ? `AED ${minPrice}`
    : `AED ${minPrice}–${maxPrice}`;
}

function ConnectedBabyShowerExperience() {
  const liveGifts = useQuery(api.gifts.listVisible);
  const event = useQuery(api.eventSettings.getPublic);
  const submitRsvp = useMutation(api.rsvps.submit);
  const reserveGift = useMutation(api.reservations.reserve);

  const giftCards: Gift[] =
    liveGifts?.map((gift) => {
      const webImage = wishlistImages[gift.name];

      return {
        id: gift.id,
        name: gift.name,
        category: gift.category,
        description: gift.description,
        minPrice: gift.minPrice,
        price: formatPrice(gift.minPrice, gift.maxPrice),
        reserved: gift.reserved,
        icon: categoryIcons[gift.category] ?? "🎁",
        imageUrl: gift.imageUrl ?? webImage?.imageUrl,
        imageSourceUrl: gift.imageUrl ? undefined : webImage?.sourceUrl,
      };
    }) ?? [];

  async function handleReservation(submission: GiftReservationSubmission) {
    return await reserveGift({
      giftId: submission.giftId as Id<"gifts">,
      guestName: submission.guestName,
      mobileNumber: submission.mobileNumber,
      website: submission.website,
    });
  }

  return (
    <BabyShowerExperience
      event={event}
      gifts={giftCards}
      onSubmitRsvp={async (submission) => {
        await submitRsvp(submission);
      }}
      onReserveGift={handleReservation}
    />
  );
}

export function ConvexBabyShowerApp() {
  return (
    <ConvexClientProvider
      fallback={<BabyShowerExperience gifts={previewGifts} />}
    >
      <ConnectedBabyShowerExperience />
    </ConvexClientProvider>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { ConvexBabyShowerApp } from "./components/ConvexBabyShowerApp";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const imageUrl = host ? `${protocol}://${host}/og.png` : undefined;

  return {
    title: "A Little One Is on the Way",
    description:
      "Join us for a warm celebration, RSVP, and explore the baby gift wishlist.",
    openGraph: imageUrl
      ? {
          title: "Baby in Bloom",
          description: "A little one is on the way.",
          images: [{ url: imageUrl, width: 1736, height: 907 }],
        }
      : undefined,
    twitter: imageUrl
      ? {
          card: "summary_large_image",
          title: "Baby in Bloom",
          description: "A little one is on the way.",
          images: [imageUrl],
        }
      : undefined,
  };
}

export default function Home() {
  return <ConvexBabyShowerApp />;
}

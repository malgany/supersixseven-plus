import type { Metadata } from "next";
import { headers } from "next/headers";
import FightGame from "./FightGame";

const title = "Fight Turn — Protótipo 2D";
const description =
  "Protótipo local de luta 2D para dois jogadores, controlado pelo teclado.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const imageUrl = new URL("/og.png", origin).toString();

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1672,
          height: 941,
          alt: "Dois lutadores minimalistas na arena Fight Turn",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function Home() {
  return <FightGame />;
}

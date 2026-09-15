import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Thoughtful — Find a gift they'll actually love",
  description:
    "Tell us a little about them. We'll help you find something that feels just right. Gift ideas chosen around who they are, the occasion and your budget.",
  openGraph: {
    title: "Thoughtful — Find a gift they'll actually love",
    description:
      "Tell us a little about them. We'll help you find something that feels just right.",
    images: ["/images/hero.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${instrument.variable}`}>
      <body className="bg-cream font-sans text-charcoal antialiased">
        <a
          href="#main"
          className="sr-only z-[80] rounded-sm bg-charcoal px-4 py-2 text-sm font-medium text-cream focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

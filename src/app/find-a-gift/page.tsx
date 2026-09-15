import type { Metadata } from "next";
import { GiftFinder } from "@/components/finder/gift-finder";

export const metadata: Metadata = {
  title: "Find a gift — Thoughtful",
  description:
    "Six quick questions about who they are, the occasion and your budget — and we'll find gifts that feel just right.",
  robots: { index: false },
};

export default function FindAGiftPage() {
  return <GiftFinder />;
}

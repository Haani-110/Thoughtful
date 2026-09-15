import type { Metadata } from "next";
import { ResultsExperience } from "@/components/results/results-experience";

export const metadata: Metadata = {
  title: "Your gift shortlist — Thoughtful",
  robots: { index: false },
};

export default function ResultsPage() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      <ResultsExperience />
    </div>
  );
}

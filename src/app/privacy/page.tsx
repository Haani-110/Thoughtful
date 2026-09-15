import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy — Thoughtful",
  description: "Thoughtful's privacy approach, in plain terms.",
};

const PARAGRAPHS = [
  {
    heading: "What we keep",
    body: "The details you share in the gift finder stay in your browser — they exist to shape your recommendations and nothing else. No account, no tracking, nothing stored on our side.",
  },
  {
    heading: "What we never do",
    body: "We don't sell or share your details. We don't follow you around the web, and we don't buy attention from ad networks. Thoughtful's recommendations are chosen around the person you're shopping for — not around advertisers.",
  },
  {
    heading: "As we grow",
    body: "If we ever introduce accounts, saving the little details about the people you love will always be optional, always yours to delete, and never used for anything but better gifts.",
  },
];

export default function PrivacyPage() {
  return (
    <div id="top">
      <Navbar />
      <main id="main">
        <article className="container-x pt-40 pb-24 lg:pt-52 lg:pb-32">
          <p className="eyebrow flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-8 bg-champagne" />
            Thoughtful
          </p>
          <h1 className="mt-7 max-w-2xl font-serif text-5xl leading-[1.06] tracking-[-0.015em] text-charcoal md:text-6xl">
            Privacy, in plain terms.
          </h1>
          <p className="mt-6 text-[0.6875rem] font-medium tracking-[0.25em] text-faint uppercase">
            Last updated — February 2026
          </p>

          <div className="mt-16 max-w-2xl space-y-12">
            {PARAGRAPHS.map((section) => (
              <section
                key={section.heading}
                className="border-t border-line-soft pt-8"
              >
                <h2 className="font-serif text-2xl tracking-[-0.01em] text-charcoal">
                  {section.heading}
                </h2>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-20">
            <Button href="/#top" variant="link">
              Back to Thoughtful
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    index: "01",
    title: "Tell us about them",
    body: "Share the little details that make them who they are.",
  },
  {
    index: "02",
    title: "We\u2019ll narrow it down",
    body: "Thoughtful looks at their interests, the occasion and your budget.",
  },
  {
    index: "03",
    title: "Choose something meaningful",
    body: "Explore ideas that feel personal instead of predictable.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-24"
    >
      <div className="container-x py-24 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-8 bg-champagne" />
                How it works
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2
                id="how-it-works-title"
                className="mt-7 font-serif text-[2.5rem] leading-[1.08] tracking-[-0.015em] text-charcoal md:text-6xl md:leading-[1.05]"
              >
                A better way to give.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={180} className="lg:justify-self-end">
            <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted lg:pb-2 lg:text-right">
              Three small steps between you and the thing they&rsquo;ll keep.
            </p>
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-3 lg:mt-20">
          {STEPS.map((step, i) => (
            <li key={step.index}>
              <Reveal
                delay={i * 130}
                className="h-full border-t border-line pt-8"
              >
                <p className="font-serif text-2xl text-bronze italic">
                  {step.index}
                </p>
                <h3 className="mt-7 font-serif text-2xl leading-snug tracking-[-0.01em] text-charcoal md:text-[1.75rem]">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-muted">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

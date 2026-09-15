import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const NOTICED = ["Film photography", "Keepsakes", "Slow travel"];

const LEADS = [
  "An archival album for years of prints.",
  "A linen keepsake box for the negatives.",
];

export function Details() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="scroll-mt-24 border-y border-line bg-beige"
    >
      <div className="container-x py-24 lg:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* ------------ imagery ------------ */}
          <div className="order-2 lg:order-1 lg:col-span-5">
            <Reveal variant="media">
              <figure>
                <div className="relative aspect-[4/5] bg-card">
                  <Image
                    src="https://images.pexels.com/photos/10302632/pexels-photo-10302632.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
                    alt="Someone flipping through a well-loved photo album of printed memories"
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
                  <span>Fig. 02</span>
                  <span>The trips, kept in print</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* ------------ the point ------------ */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <SectionHeading
              eyebrow="Why it feels personal"
              title={<span id="about-title">The little details matter.</span>}
            />

            <Reveal delay={200}>
              <blockquote className="mt-12 lg:mt-14">
                <p className="max-w-xl font-serif text-[1.6rem] leading-snug tracking-[-0.01em] text-balance text-charcoal md:text-[2rem]">
                  &ldquo;She photographs every trip we take,{" "}
                  <em className="text-burgundy italic">
                    and keeps the prints.
                  </em>
                  &rdquo;
                </p>
                <footer className="mt-5 text-[0.6875rem] font-medium tracking-[0.25em] text-faint uppercase">
                  Something you might tell us
                </footer>
              </blockquote>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-10 flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-10 bg-champagne" />
                <span className="font-serif text-xl text-burgundy italic">
                  Now we have something to work with.
                </span>
              </p>
            </Reveal>

            <Reveal delay={380}>
              <div className="mt-12 grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
                <div>
                  <h3 className="text-[0.6875rem] font-medium tracking-[0.25em] text-muted uppercase">
                    What we notice
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-2.5">
                    {NOTICED.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-line bg-card px-4 py-1.5 text-xs font-medium tracking-[0.08em] text-charcoal-2"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[0.6875rem] font-medium tracking-[0.25em] text-muted uppercase">
                    Where it leads
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {LEADS.map((lead) => (
                      <li key={lead} className="flex items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 shrink-0 translate-y-[-2px] rotate-45 bg-champagne"
                        />
                        <span className="font-serif text-lg text-charcoal-2">
                          {lead}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

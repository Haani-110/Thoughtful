import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const INTERESTS = ["Photography", "Coffee", "Travel"];

const IDEAS = [
  {
    name: "A restored 35mm film camera",
    tag: "Photography",
    price: "from $90",
    img: "https://images.pexels.com/photos/37157311/pexels-photo-37157311.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "An arrangement of analog photography equipment including cameras and film",
  },
  {
    name: "Three months of single-origin coffee",
    tag: "Coffee",
    price: "from $48",
    img: "https://images.pexels.com/photos/29498509/pexels-photo-29498509.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "Pour-over coffee in a filter beside a ceramic mug on a wooden table",
  },
  {
    name: "A linen-bound travel journal",
    tag: "Travel",
    price: "from $34",
    img: "https://images.pexels.com/photos/7235894/pexels-photo-7235894.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    alt: "A flat lay of travel planning items, a notebook and a compass on a map",
  },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="container-x pt-36 pb-20 sm:pt-40 lg:pt-48 lg:pb-28">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* ------------ editorial copy ------------ */}
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow flex items-center gap-4">
                <span aria-hidden="true" className="h-px w-8 bg-champagne" />
                Gifting, considered
              </p>
            </Reveal>

            <Reveal delay={100}>
              <h1
                id="hero-title"
                className="mt-8 font-serif text-[2.9rem] leading-[1.05] tracking-[-0.02em] text-balance text-charcoal sm:text-6xl md:text-7xl lg:text-[5.6rem] xl:text-[6.4rem]"
              >
                Find a gift
                <br />
                they&rsquo;ll{" "}
                <em className="text-burgundy italic">actually love</em>.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-8 max-w-md text-base leading-relaxed text-muted md:text-lg">
                Tell us a little about them. We&rsquo;ll help you find
                something that feels just right.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Button href="/find-a-gift">Find the perfect gift</Button>
                <Button href="#how-it-works" variant="link">
                  See how it works
                </Button>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <p className="mt-9 text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
                Takes about a minute&ensp;·&ensp;No account needed
              </p>
            </Reveal>
          </div>

          {/* ------------ editorial imagery ------------ */}
          <div className="lg:col-span-5">
            <Reveal variant="media" delay={150}>
              <figure>
                <div className="relative aspect-[4/3] bg-beige sm:aspect-[16/11] lg:aspect-[4/5]">
                  <Image
                    src="/images/hero.jpg"
                    alt="A stack of gifts wrapped in ivory and blush paper with dusty-rose ribbons on a light oak table"
                    fill
                    priority
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-4 flex items-baseline justify-between text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
                  <span>Fig. 01</span>
                  <span>Wrapped for a lover of film</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        {/* ------------ a small product signal ------------ */}
        <div className="mt-20 border-t border-line pt-14 lg:mt-28 lg:pt-16">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow">A small example</p>
              <p className="mt-6 max-w-sm font-serif text-3xl leading-snug tracking-[-0.01em] text-charcoal md:text-[2.125rem]">
                For the friend who
                <br />
                has everything
              </p>
              <ul className="mt-7 flex flex-wrap gap-3" aria-label="Their interests">
                {INTERESTS.map((interest) => (
                  <li
                    key={interest}
                    className="rounded-full border border-line bg-card px-4 py-2 text-[0.6875rem] font-medium tracking-[0.18em] text-charcoal-2 uppercase"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={140} className="lg:col-span-7">
              <p className="font-serif text-xl text-charcoal-2 italic md:text-[1.375rem]">
                A few ideas, chosen around what they love.
              </p>
              <ul className="mt-8">
                {IDEAS.map((idea) => (
                  <li
                    key={idea.name}
                    className="flex items-center gap-5 border-t border-line-soft py-5 last:border-b"
                  >
                    <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-[2px] bg-beige sm:h-14 sm:w-14">
                      <Image
                        src={idea.img}
                        alt={idea.alt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-charcoal sm:text-[0.9375rem]">
                        {idea.name}
                      </span>
                      <span className="mt-1 block text-[0.6875rem] font-medium tracking-[0.2em] text-muted uppercase">
                        {idea.tag}
                      </span>
                    </span>
                    <span className="ml-auto pl-4 text-[0.8125rem] whitespace-nowrap text-charcoal-2/80">
                      {idea.price}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

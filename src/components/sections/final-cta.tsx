import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section
      id="start"
      aria-labelledby="start-title"
      className="scroll-mt-24 border-t border-line"
    >
      <div className="container-x py-28 text-center lg:py-40">
        <Reveal>
          <h2
            id="start-title"
            className="mx-auto max-w-4xl font-serif text-[2.6rem] leading-[1.08] tracking-[-0.015em] text-balance text-charcoal md:text-6xl md:leading-[1.06]"
          >
            Give them something that says,{" "}
            <em className="text-burgundy italic">&ldquo;I know you.&rdquo;</em>
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mx-auto mt-7 max-w-md text-base leading-relaxed text-muted md:text-lg">
            A few details are all it takes to start.
          </p>
        </Reveal>
        <Reveal delay={260} className="mt-12">
          <div className="flex flex-col items-center gap-6">
            <Button href="/find-a-gift">Find the perfect gift</Button>
            <p className="text-[0.6875rem] font-medium tracking-[0.22em] text-faint uppercase">
              Six quick questions
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

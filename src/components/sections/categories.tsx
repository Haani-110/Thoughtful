import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryTile, type CategoryTileProps } from "./category-tile";

const CATEGORIES: Omit<CategoryTileProps, "index">[] = [
  {
    title: "Safe Picks",
    body: "Ideas they\u2019re very likely to enjoy.",
    img: "https://images.pexels.com/photos/6305601/pexels-photo-6305601.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    alt: "A beautifully wrapped gift in fabric beside lit candles in a warm setting",
  },
  {
    title: "Creative",
    body: "Unexpected gifts for people who are hard to shop for.",
    img: "https://images.pexels.com/photos/13554884/pexels-photo-13554884.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    alt: "Simple ceramic vases with a single orange flower on a table",
  },
  {
    title: "Personal",
    body: "Thoughtful ideas with a more emotional touch.",
    img: "https://images.pexels.com/photos/8997971/pexels-photo-8997971.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    alt: "A still life of vintage handwritten papers with flowers",
  },
  {
    title: "Experiences",
    body: "Something to remember, not something to unwrap.",
    img: "https://images.pexels.com/photos/9736289/pexels-photo-9736289.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    alt: "A woman shaping clay on a pottery wheel in a bright workshop",
  },
];

export function Categories() {
  return (
    <section
      id="gift-ideas"
      aria-labelledby="gift-ideas-title"
      className="scroll-mt-24 border-t border-line"
    >
      <div className="container-x py-24 lg:py-36">
        <SectionHeading
          eyebrow="Gift ideas"
          title={
            <span id="gift-ideas-title">
              Not every good gift comes in a box.
            </span>
          }
          intro="Every search draws on four kinds of ideas — so at least one of them lands."
        />

        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => (
            <Reveal
              key={category.title}
              delay={i * 110}
              className={i % 2 === 1 ? "lg:mt-14" : ""}
            >
              <CategoryTile index={i} {...category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

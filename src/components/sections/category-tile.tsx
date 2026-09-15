import Image from "next/image";

export interface CategoryTileProps {
  index: number;
  title: string;
  body: string;
  img: string;
  alt: string;
}

/** An editorial image tile for one kind of gift idea. */
export function CategoryTile({
  index,
  title,
  body,
  img,
  alt,
}: CategoryTileProps) {
  return (
    <figure className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-beige">
        <Image
          src={img}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 100vw"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
      </div>
      <figcaption className="mt-6">
        <p className="text-[0.6875rem] font-medium tracking-[0.3em] text-bronze uppercase">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mt-3 font-serif text-[1.5rem] tracking-[-0.01em] text-charcoal">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      </figcaption>
    </figure>
  );
}

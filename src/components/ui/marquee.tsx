import { Asterisk } from "lucide-react";
import { Fragment } from "react";

const OCCASIONS = [
  "Birthdays",
  "Anniversaries",
  "Housewarmings",
  "New parents",
  "Thank-yous",
  "Graduations",
  "Just because",
  "Hard to shop for",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {OCCASIONS.map((occasion) => (
        <Fragment key={`${occasion}-${hidden}`}>
          <span className="px-7 text-[0.6875rem] font-medium tracking-[0.3em] whitespace-nowrap text-muted uppercase sm:px-10">
            {occasion}
          </span>
          <Asterisk className="h-3 w-3 shrink-0 text-champagne" aria-hidden="true" />
        </Fragment>
      ))}
    </div>
  );
}

/** A slow, quiet ribbon of the occasions Thoughtful is for. */
export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-line-soft bg-card py-5" role="presentation">
      <div className="marquee-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}

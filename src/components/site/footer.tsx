import Link from "next/link";
import { Wordmark } from "./wordmark";

const FOOTER_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Gift ideas", href: "/#gift-ideas" },
  { label: "About", href: "/#about" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="container-x pt-14 pb-10">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[16rem] text-[0.8125rem] leading-relaxed text-muted">
              Gifts, chosen with care.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] font-medium tracking-[0.04em] text-charcoal-2 transition-colors duration-300 hover:text-burgundy"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs tracking-[0.06em] text-faint">
            © {year} Thoughtful. All rights reserved.
          </p>
          <p className="text-xs tracking-[0.06em] text-faint">
            Made for people who give well.
          </p>
        </div>
      </div>
    </footer>
  );
}

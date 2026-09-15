import Link from "next/link";
import { Asterisk } from "lucide-react";

/** The Thoughtful wordmark — Fraunces with a quiet champagne asterisk. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/#top"
      aria-label="Thoughtful — back to top"
      className={`group inline-flex items-start gap-1 ${className}`}
    >
      <span className="font-serif text-[1.375rem] leading-none tracking-[-0.01em] text-charcoal transition-colors duration-300 group-hover:text-burgundy">
        Thoughtful
      </span>
      <Asterisk
        className="mt-0.5 h-2.5 w-2.5 text-champagne transition-transform duration-500 group-hover:rotate-90"
        aria-hidden="true"
      />
    </Link>
  );
}

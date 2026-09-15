"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Wordmark } from "./wordmark";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Gift ideas", href: "/#gift-ideas" },
  { label: "About", href: "/#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-line-soft bg-cream/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between lg:h-[5.5rem]">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center lg:flex">
            <ul className="flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative text-[0.8125rem] font-medium tracking-[0.04em] text-charcoal-2 transition-colors duration-300 hover:text-charcoal"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-1.5 h-px origin-left scale-x-0 bg-burgundy transition-transform duration-400 ease-out group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              href="/find-a-gift"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              Find a gift
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-burgundy lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- mobile menu ---------- */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] flex flex-col bg-cream transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between">
          <Wordmark />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center text-charcoal transition-colors hover:text-burgundy"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile" className="container-x mt-10 flex-1 sm:mt-14">
          <ul className="space-y-2">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.href}
                style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
                className={`transition-all duration-500 ease-out ${
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-3"
                >
                  <span className="text-[0.6875rem] font-medium tracking-[0.25em] text-bronze">
                    0{i + 1}
                  </span>
                  <span className="font-serif text-4xl tracking-[-0.01em] text-charcoal transition-colors duration-300 group-hover:text-burgundy sm:text-5xl">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`container-x pb-10 transition-all delay-300 duration-500 ${
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="border-t border-line pt-8">
            <Button
              href="/find-a-gift"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={() => setOpen(false)}
            >
              Find the perfect gift
            </Button>
            <p className="mt-5 flex items-center gap-2 text-xs tracking-wide text-muted">
              <ArrowUpRight className="h-3.5 w-3.5 text-bronze" aria-hidden="true" />
              Takes about a minute — no account needed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

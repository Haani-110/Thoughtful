"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { Button } from "@/components/ui/button";
import { GiftCard } from "./gift-card";
import { PerfectPick } from "./perfect-pick";
import { GiftModal } from "./gift-modal";
import { FindingState } from "./finding-state";
import { RefinePanel } from "./refine-panel";
import { readAnswers, writeAnswers, clearAnswers } from "@/lib/answers-storage";
import type { RecommendationItem, RecommendationsPayload } from "@/lib/recommendations";
import {
  BUDGET_OPTIONS,
  BUDGET_CUSTOM_ID,
  OCCASION_OPTIONS,
  RECIPIENT_OPTIONS,
  type GiftAnswers,
} from "@/components/finder/finder-data";

const MIN_LOADING_MS = 1_600;

type Phase = "loading" | "error" | "ready" | "no-answers" | "no-match";

/* ------------------------------ helpers ------------------------------ */

function label(
  options: { id: string; label: string }[],
  id: string | null,
): string | null {
  if (!id) return null;
  return options.find((o) => o.id === id)?.label ?? null;
}

const joinNatural = (parts: string[]) =>
  parts.length <= 1
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;

/** True when any recommendation in the payload is a live eBay listing. */
function payloadContainsEbay(payload: RecommendationsPayload): boolean {
  return [
    payload.groups.perfect,
    ...payload.groups.safe,
    ...payload.groups.creative,
    ...payload.groups.personal,
    ...payload.groups.experiences,
  ].some((item) => item !== null && item.product.source === "ebay");
}

/** Deterministic supporting line, composed from the brief. */
function supportLine(answers: GiftAnswers): string {
  const interests = answers.interests
    .slice(0, 3)
    .map((i) => (i === "Home & Decor" ? "home & decor" : i.toLowerCase()));

  const budget =
    answers.budget === BUDGET_CUSTOM_ID && answers.customBudget
      ? `$${answers.customBudget}`
      : (label(BUDGET_OPTIONS, answers.budget) ?? null);

  if (interests.length > 0 && budget) {
    return `Based on their love of ${joinNatural(interests)}, and your ${budget} budget.`;
  }
  if (interests.length > 0) {
    return `Based on their love of ${joinNatural(interests)}.`;
  }
  if (budget) return `Chosen within your ${budget} budget.`;
  return "Chosen around everything you told us.";
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* --------------------------- state screens --------------------------- */

function CenteredState({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <main
      id="main"
      className="container-x flex flex-1 flex-col items-center justify-center py-24 text-center"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 max-w-xl font-serif text-4xl leading-[1.12] tracking-[-0.015em] text-balance text-charcoal md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
        {body}
      </p>
      <div className="mt-9">{children}</div>
    </main>
  );
}

/* --------------------------- gift sections --------------------------- */

function GiftSection({
  title,
  caption,
  items,
  startIndex,
  onView,
}: {
  title: string;
  caption: string;
  items: RecommendationItem[];
  startIndex: number;
  onView: (item: RecommendationItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="mt-14 lg:mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-serif text-[1.35rem] tracking-[-0.01em] text-charcoal">
          {title}
        </h3>
        <p className="text-sm text-muted">{caption}</p>
      </div>
      <ul className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {items.map((item, i) => (
          <li key={item.product.id} className="h-full">
            <GiftCard item={item} index={startIndex + i} onView={onView} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* --------------------------- the experience --------------------------- */

export function ResultsExperience() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<GiftAnswers | null>(null);
  const [payload, setPayload] = useState<RecommendationsPayload | null>(null);
  const [refining, setRefining] = useState(false);
  const [refineFailed, setRefineFailed] = useState(false);
  const [viewing, setViewing] = useState<RecommendationItem | null>(null);

  const requestRecommendations = useCallback(async (brief: GiftAnswers) => {
    try {
      const [response] = await Promise.all([
        fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(brief),
        }),
        wait(MIN_LOADING_MS),
      ]);

      const data = (await response.json()) as
        | ({ status: "ok" } & RecommendationsPayload)
        | { status: "error" };

      if (!response.ok || data.status !== "ok") return "error" as const;
      if (data.totalCount === 0) return "no-match" as const;
      setPayload(data);
      return "ready" as const;
    } catch {
      return "error" as const;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const brief = readAnswers();
      await null; // read external state first, update React state after
      if (cancelled) return;

      if (!brief) {
        setPhase("no-answers");
        return;
      }
      setAnswers(brief);
      const outcome = await requestRecommendations(brief);
      if (!cancelled) setPhase(outcome);
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [requestRecommendations]);

  /* "Make it more personal" — fold the new detail into the brief.
     On failure the current recommendations stay exactly as they are. */
  const refine = (newDetail: string) => {
    if (!answers) return;
    const next: GiftAnswers = {
      ...answers,
      detail: [answers.detail.trim(), newDetail].filter(Boolean).join(" "),
    };
    setRefineFailed(false);
    setRefining(true);
    void requestRecommendations(next).then((outcome) => {
      setRefining(false);
      if (outcome === "ready") {
        writeAnswers(next);
        setAnswers(next);
        setPhase("ready");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Keep the existing picks and answers — just tell the user gently.
        setRefineFailed(true);
      }
    });
  };

  const retry = () => {
    if (!answers) return;
    setPhase("loading");
    void requestRecommendations(answers).then(setPhase);
  };

  /* "Start over" — clear the brief and begin the finder fresh. */
  const startOver = () => {
    clearAnswers();
    router.push("/find-a-gift");
  };

  const recipientLabel = label(RECIPIENT_OPTIONS, answers?.recipient ?? null);
  const occasionLabel = label(OCCASION_OPTIONS, answers?.occasion ?? null);

  const contextChips = answers
    ? ([occasionLabel, ...answers.interests.slice(0, 3)].filter(
        Boolean,
      ) as string[])
    : [];

  return (
    <>
      <header className="border-b border-line-soft">
        <div className="container-x flex h-[4.25rem] items-center justify-between">
          <Wordmark />
          <button
            type="button"
            onClick={startOver}
            className="text-[0.6875rem] font-medium tracking-[0.22em] text-muted uppercase transition-colors duration-300 hover:text-burgundy"
          >
            Start over
          </button>
        </div>
      </header>

      {phase === "loading" || refining ? (
        <FindingState
          title={
            refining ? (
              <>
                Making it even
                <br />
                more personal&hellip;
              </>
            ) : undefined
          }
          captions={
            refining
              ? [
                  "Taking that into account…",
                  "Matching their interests…",
                  "Finding the thoughtful ones…",
                ]
              : undefined
          }
        />
      ) : null}

      {phase === "error" && !refining ? (
        <CenteredState
          eyebrow="A small hiccup"
          title="Something went wrong while finding your gifts."
          body="Nothing was lost — your answers are still right here with us."
        >
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={retry}
              className="group inline-flex items-center justify-center gap-3 rounded-[2px] bg-burgundy px-7 py-4 text-[0.6875rem] font-medium tracking-[0.22em] text-cream uppercase transition-all duration-300 hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3"
            >
              Try again
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </CenteredState>
      ) : null}

      {phase === "no-answers" && !refining ? (
        <CenteredState
          eyebrow="Your thoughtful picks"
          title="Nothing here yet."
          body="Tell us a little about them first — it only takes a minute."
        >
          <Button href="/find-a-gift">Start the gift finder</Button>
        </CenteredState>
      ) : null}

      {phase === "no-match" && !refining ? (
        <CenteredState
          eyebrow="Your thoughtful picks"
          title="Let's try a slightly different approach."
          body="We couldn't find a strong match from your current preferences."
        >
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
            <Button href="/find-a-gift">Adjust preferences</Button>
            <button
              type="button"
              onClick={startOver}
              className="text-sm font-medium text-muted underline decoration-charcoal/25 underline-offset-4 transition-colors duration-300 hover:text-burgundy hover:decoration-burgundy/50"
            >
              Start over
            </button>
          </div>
        </CenteredState>
      ) : null}

      {phase === "ready" && payload && answers && !refining ? (
        <main id="main" className="flex-1">
          <div className="container-x pt-14 md:pt-20">
            {/* ------------------------- summary ------------------------- */}
            <div className="step-enter mx-auto max-w-3xl text-center">
              <p className="eyebrow">Your thoughtful picks</p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-[-0.015em] text-balance text-charcoal md:text-[3.4rem]">
                Here are some gifts
                <br />
                they&rsquo;ll love.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-muted md:text-base">
                {payload.summary ?? supportLine(answers)}
              </p>
              {contextChips.length > 0 ? (
                <ul
                  aria-label="What you told us"
                  className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
                >
                  {recipientLabel && recipientLabel !== "Other" ? (
                    <li className="rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium tracking-[0.04em] text-charcoal-2">
                      For your {recipientLabel.toLowerCase()}
                    </li>
                  ) : null}
                  {contextChips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-line bg-card px-3.5 py-1.5 text-xs font-medium tracking-[0.04em] text-charcoal-2"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              ) : null}
              {answers.detail.trim() ? (
                <blockquote className="mx-auto mt-8 max-w-xl">
                  <p className="font-serif text-lg leading-snug text-muted italic">
                    &ldquo;{answers.detail.trim()}&rdquo;
                  </p>
                </blockquote>
              ) : null}
            </div>

            {/* ----------------------- perfect match ---------------------- */}
            {payload.groups.perfect ? (
              <section
                aria-label="Perfect match"
                className="mx-auto mt-14 max-w-5xl lg:mt-16"
              >
                <PerfectPick item={payload.groups.perfect} onView={setViewing} />
              </section>
            ) : null}

            {/* -------------------- more recommendations ------------------- */}
            <div className="mx-auto max-w-5xl">
              <h2 className="mt-20 flex items-center gap-5 text-center">
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
                <span className="font-serif text-2xl tracking-[-0.01em] text-charcoal lg:text-[1.75rem]">
                  More ideas worth considering
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </h2>

              <GiftSection
                title="Safe picks"
                caption="Reliable choices that fit them well."
                items={payload.groups.safe}
                startIndex={1}
                onView={setViewing}
              />
              <GiftSection
                title="Creative"
                caption="More unexpected, in a good way."
                items={payload.groups.creative}
                startIndex={5}
                onView={setViewing}
              />
              <GiftSection
                title="Personal"
                caption="The ones with a little more heart."
                items={payload.groups.personal}
                startIndex={9}
                onView={setViewing}
              />
              <GiftSection
                title="Experiences"
                caption="Something to remember, not something to unwrap."
                items={payload.groups.experiences}
                startIndex={13}
                onView={setViewing}
              />
            </div>
          </div>

          {/* -------------------- make it more personal ------------------- */}
          <RefinePanel
            onRefine={refine}
            errorMessage={
              refineFailed
                ? "We couldn't refine right now — your current picks are still here."
                : null
            }
          />

          {/* --------------------- preferences / restart ------------------ */}
          <div className="container-x pb-20">
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 pt-14 text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                <Link
                  href="/find-a-gift"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-charcoal transition-colors duration-300 hover:text-burgundy"
                >
                  <ArrowLeft
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                  Change preferences
                </Link>
                <span aria-hidden="true" className="h-1 w-1 rotate-45 bg-champagne" />
                <button
                  type="button"
                  onClick={startOver}
                  className="text-sm font-medium text-muted underline decoration-charcoal/20 underline-offset-4 transition-colors duration-300 hover:text-burgundy hover:decoration-burgundy/50"
                >
                  Start over
                </button>
              </div>
              <p className="max-w-md text-xs leading-relaxed tracking-[0.04em] text-faint">
                {payload.source === "ai"
                  ? payloadContainsEbay(payload)
                    ? "Ranked around everything you told us — gifts come from Thoughtful's curated catalog and live eBay listings."
                    : "Ranked around everything you told us — every gift is from Thoughtful's curated catalog."
                  : "Chosen from Thoughtful's curated catalog by our matching rules — AI ranking is resting right now."}
              </p>
            </div>
          </div>
        </main>
      ) : null}

      {/* ------------------------- gift detail modal ------------------------ */}
      {viewing ? (
        <GiftModal item={viewing} onClose={() => setViewing(null)} />
      ) : null}
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Wordmark } from "@/components/site/wordmark";
import { readAnswers, writeAnswers } from "@/lib/answers-storage";
import { FinderProgress } from "./progress";
import { StepRecipient } from "./step-recipient";
import { StepOccasion } from "./step-occasion";
import { StepInterests } from "./step-interests";
import { StepBudget } from "./step-budget";
import { StepGiftType } from "./step-gift-type";
import { StepDetails } from "./step-details";
import {
  BUDGET_CUSTOM_ID,
  FINDER_STEPS,
  INITIAL_ANSWERS,
  type GiftAnswers,
} from "./finder-data";

export function GiftFinder() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<GiftAnswers>(INITIAL_ANSWERS);
  const questionRef = useRef<HTMLHeadingElement>(null);

  /* Re-open with previous answers when returning via "Change preferences". */
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const previous = readAnswers();
      await null; // read external state first, update React state after
      if (!cancelled && previous) setAnswers(previous);
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = FINDER_STEPS.length;
  const current = FINDER_STEPS[stepIndex];
  const isLast = stepIndex === total - 1;

  const set = useCallback(
    <K extends keyof GiftAnswers>(key: K, value: GiftAnswers[K]) =>
      setAnswers((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const toggleInterest = useCallback((label: string) => {
    setAnswers((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  }, []);

  /* ------------------------- validation ------------------------- */
  const canContinue = (() => {
    switch (current.id) {
      case "recipient":
        return answers.recipient !== null;
      case "occasion":
        return answers.occasion !== null;
      case "interests":
        return answers.interests.length > 0;
      case "budget":
        if (answers.budget === null) return false;
        if (answers.budget === BUDGET_CUSTOM_ID) {
          return answers.customBudget !== "" && Number(answers.customBudget) > 0;
        }
        return true;
      case "giftType":
        return answers.giftType !== null;
      case "detail":
        return true; // optional
      default:
        return false;
    }
  })();

  /* ----------------------- step transitions ---------------------- */
  useEffect(() => {
    questionRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex]);

  const back = () => setStepIndex((s) => Math.max(0, s - 1));
  const next = () => {
    if (!isLast) setStepIndex((s) => Math.min(total - 1, s + 1));
  };

  const finish = () => {
    writeAnswers(answers);
    router.push("/results");
  };

  const primary = () => (isLast ? finish() : next());

  /* ------------------------- step control ------------------------ */
  const stepControl = (() => {
    switch (current.id) {
      case "recipient":
        return (
          <StepRecipient
            value={answers.recipient}
            onChange={(id) => set("recipient", id)}
          />
        );
      case "occasion":
        return (
          <StepOccasion
            value={answers.occasion}
            onChange={(id) => set("occasion", id)}
          />
        );
      case "interests":
        return <StepInterests values={answers.interests} onToggle={toggleInterest} />;
      case "budget":
        return (
          <StepBudget
            value={answers.budget}
            custom={answers.customBudget}
            onChange={(id) => set("budget", id)}
            onCustomChange={(v) => set("customBudget", v)}
          />
        );
      case "giftType":
        return (
          <StepGiftType
            value={answers.giftType}
            onChange={(id) => set("giftType", id)}
          />
        );
      case "detail":
        return (
          <StepDetails value={answers.detail} onChange={(v) => set("detail", v)} />
        );
    }
  })();

  return (
    <div className="flex min-h-[100svh] flex-col bg-cream">
      {/* ----------------------- quiet chrome ----------------------- */}
      <header className="border-b border-line-soft">
        <div className="container-x flex h-[4.25rem] items-center justify-between">
          <Wordmark />
          <Link
            href="/"
            aria-label="Leave the gift finder and return home"
            className="group inline-flex items-center gap-2 text-[0.6875rem] font-medium tracking-[0.22em] text-muted uppercase transition-colors duration-300 hover:text-burgundy"
          >
            <span className="hidden sm:inline">Leave</span>
            <X
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
              aria-hidden="true"
            />
          </Link>
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        <div className="container-x w-full flex-1 pt-9 md:pt-14">
          <div className="mx-auto w-full max-w-3xl">
            <FinderProgress step={stepIndex + 1} total={total} />

            <div key={current.id} className="mt-10 md:mt-14">
              <div className="step-enter">
                <h2
                  ref={questionRef}
                  tabIndex={-1}
                  className="font-serif text-[2.1rem] leading-[1.1] tracking-[-0.015em] text-charcoal outline-none md:text-[2.75rem]"
                >
                  {current.question}
                </h2>
                {current.support ? (
                  <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                    {current.support}
                  </p>
                ) : null}
              </div>

              <div className="mt-10 md:mt-12">{stepControl}</div>
            </div>
          </div>
        </div>

        {/* ------------------------ action bar ----------------------- */}
        <div className="sticky bottom-0 mt-16 border-t border-line bg-cream/90 backdrop-blur-sm">
          <div className="container-x">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 py-4">
              <button
                type="button"
                onClick={back}
                aria-hidden={stepIndex === 0 || undefined}
                tabIndex={stepIndex === 0 ? -1 : undefined}
                className={`group inline-flex items-center gap-2 rounded-sm px-2 py-3 text-sm font-medium text-muted transition-all duration-300 hover:text-charcoal ${
                  stepIndex === 0 ? "invisible" : ""
                }`}
              >
                <ArrowLeft
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden="true"
                />
                Back
              </button>

              <div className="flex items-center gap-6">
                {isLast ? (
                  <button
                    type="button"
                    onClick={finish}
                    className="text-sm font-medium text-muted underline decoration-charcoal/25 underline-offset-4 transition-colors duration-300 hover:text-burgundy hover:decoration-burgundy/50"
                  >
                    Skip this step
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={primary}
                  disabled={!canContinue}
                  className="group inline-flex items-center justify-center gap-3 rounded-[2px] bg-burgundy px-7 py-4 text-[0.6875rem] font-medium tracking-[0.22em] text-cream uppercase transition-all duration-300 ease-out hover:-translate-y-px hover:bg-burgundy-2 active:bg-burgundy-3 disabled:pointer-events-none disabled:opacity-40"
                >
                  {isLast ? "Find my gifts" : "Continue"}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

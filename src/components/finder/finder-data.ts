import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Cake,
  CalendarHeart,
  CircleDashed,
  Dices,
  Flower2,
  Gem,
  GraduationCap,
  Heart,
  Laugh,
  MoonStar,
  Package,
  Palette,
  PenLine,
  Smile,
  Sparkles,
  Ticket,
  TreePine,
  UsersRound,
} from "lucide-react";

/** Every answer the questionnaire collects. */
export interface GiftAnswers {
  recipient: string | null;
  occasion: string | null;
  interests: string[];
  budget: string | null;
  customBudget: string;
  giftType: string | null;
  detail: string;
}

export const INITIAL_ANSWERS: GiftAnswers = {
  recipient: null,
  occasion: null,
  interests: [],
  budget: null,
  customBudget: "",
  giftType: null,
  detail: "",
};

export interface FinderOption {
  id: string;
  label: string;
  hint?: string;
  Icon?: LucideIcon;
}

export const RECIPIENT_OPTIONS: FinderOption[] = [
  { id: "partner", label: "Partner", Icon: Heart },
  { id: "friend", label: "Friend", Icon: UsersRound },
  { id: "parent", label: "Parent", Icon: Flower2 },
  { id: "sibling", label: "Sibling", Icon: Smile },
  { id: "colleague", label: "Colleague", Icon: Briefcase },
  { id: "other", label: "Other", Icon: CircleDashed },
];

export const OCCASION_OPTIONS: FinderOption[] = [
  { id: "birthday", label: "Birthday", Icon: Cake },
  { id: "anniversary", label: "Anniversary", Icon: CalendarHeart },
  { id: "graduation", label: "Graduation", Icon: GraduationCap },
  { id: "wedding", label: "Wedding", Icon: Gem },
  { id: "valentines", label: "Valentine\u2019s Day", Icon: Heart },
  { id: "eid", label: "Eid", Icon: MoonStar },
  { id: "christmas", label: "Christmas", Icon: TreePine },
  { id: "just-because", label: "Just because", Icon: Sparkles },
  { id: "other", label: "Other", Icon: CircleDashed },
];

export const INTEREST_OPTIONS: string[] = [
  "Photography",
  "Travel",
  "Coffee",
  "Books",
  "Fitness",
  "Gaming",
  "Fashion",
  "Cooking",
  "Music",
  "Art",
  "Technology",
  "Beauty",
  "Sports",
  "Food",
  "Home & Decor",
];

export const BUDGET_CUSTOM_ID = "custom";

export const BUDGET_OPTIONS: FinderOption[] = [
  { id: "under-25", label: "Under $25" },
  { id: "25-50", label: "$25\u201350" },
  { id: "50-100", label: "$50\u2013100" },
  { id: "100-250", label: "$100\u2013250" },
  { id: BUDGET_CUSTOM_ID, label: "Custom budget", hint: "Tell us the number" },
];

export const GIFT_TYPE_OPTIONS: FinderOption[] = [
  { id: "practical", label: "Practical", hint: "Something they\u2019ll use every day", Icon: Package },
  { id: "creative", label: "Creative", hint: "Unexpected, in a good way", Icon: Palette },
  { id: "personalized", label: "Personalized", hint: "Made just for them", Icon: PenLine },
  { id: "luxury", label: "Luxury", hint: "A little indulgence", Icon: Gem },
  { id: "funny", label: "Funny", hint: "Guaranteed to make them smile", Icon: Laugh },
  { id: "experience", label: "Experience", hint: "Memories over things", Icon: Ticket },
  { id: "surprise", label: "Surprise me", hint: "Leave room for our taste", Icon: Dices },
];

export type FinderStepId =
  | "recipient"
  | "occasion"
  | "interests"
  | "budget"
  | "giftType"
  | "detail";

export interface FinderStep {
  id: FinderStepId;
  question: string;
  support?: string;
}

export const FINDER_STEPS: FinderStep[] = [
  {
    id: "recipient",
    question: "Who are you shopping for?",
    support: "We\u2019ll keep their personality at the center of every idea.",
  },
  {
    id: "occasion",
    question: "What\u2019s the occasion?",
    support: "The reason for the gift shapes what feels right.",
  },
  {
    id: "interests",
    question: "What are they into?",
    support: "Pick everything that sounds like them.",
  },
  {
    id: "budget",
    question: "How much would you like to spend?",
    support: "Great gifts exist at every price.",
  },
  {
    id: "giftType",
    question: "What kind of gift feels right?",
    support: "Choose a mood — we\u2019ll match the ideas to it.",
  },
  {
    id: "detail",
    question: "Anything else we should know?",
    support: "A little detail can make the recommendations much more personal.",
  },
];

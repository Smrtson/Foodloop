import type { BatchDraft, MatchFactors } from "../types";

export const allowedHandlingPriorities = [
  "Low handling risk",
  "Needs confirmation",
  "Short window",
] as const;

export type HandlingPriority = (typeof allowedHandlingPriorities)[number];

export const bannedSafetyLanguage = [
  "safe",
  "unsafe",
  "certified",
  "approved for consumption",
];

export const preferredSafetyLanguage = [
  "low handling risk",
  "needs confirmation",
  "short window",
  "manual review",
  "donor confirms",
];

export const guardOperationalLanguage = (value: string) =>
  value
    .replace(/\bunsafe\b/gi, "needs manual review")
    .replace(/\bsafe\b/gi, "low handling risk")
    .replace(/\bcertified\b/gi, "donor-confirmed")
    .replace(/approved for consumption/gi, "ready for human review");

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const asString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export const clampScore = (value: unknown, fallback: number) => {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(numberValue)));
};

export const normaliseHandlingPriority = (
  value: unknown,
  fallback: HandlingPriority,
): HandlingPriority =>
  allowedHandlingPriorities.includes(value as HandlingPriority)
    ? (value as HandlingPriority)
    : fallback;

export const normaliseStringArray = (
  value: unknown,
  fallback: string[],
  maxItems = 4,
) => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value
    .filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
    .map((item) => item.trim())
    .slice(0, maxItems);

  return items.length > 0 ? items : fallback;
};

export const firstArrayValue = (
  record: Record<string, unknown>,
  keys: string[],
): unknown[] | null => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
};

export const normaliseFactors = (
  value: unknown,
  fallback: MatchFactors,
): MatchFactors => {
  const factors = isRecord(value) ? value : {};

  return {
    compatibility: clampScore(factors.compatibility, fallback.compatibility),
    demand: clampScore(factors.demand, fallback.demand),
    distance: clampScore(factors.distance, fallback.distance),
    capacity: clampScore(factors.capacity, fallback.capacity),
    urgencyFit: clampScore(factors.urgencyFit, fallback.urgencyFit),
  };
};

export const inferHandlingPriorityFromDraft = (
  draft: Pick<
    BatchDraft,
    "category" | "pickupDeadline" | "temperatureStatus" | "holdingStatus" | "handlingPriority"
  >,
): HandlingPriority => {
  const text = [
    draft.category,
    draft.pickupDeadline,
    draft.temperatureStatus,
    draft.holdingStatus,
    draft.handlingPriority,
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("short window") ||
    text.includes("chilled") ||
    text.includes("cold") ||
    text.includes("1:") ||
    text.includes("12:")
  ) {
    return "Short window";
  }

  if (
    text.includes("needs confirmation") ||
    text.includes("confirm") ||
    text.includes("mixed ripeness") ||
    text.includes("bruising") ||
    text.includes("photo evidence only")
  ) {
    return "Needs confirmation";
  }

  return "Low handling risk";
};

import type {
  AgentRecommendation,
  AIModalResponse,
  ForecastSummary,
  ImpactAgentSummary,
  MatchQueueBatch,
  NGOCandidate,
  SensorEvidence,
  SharedRoutePlan,
} from "../types";

export interface AIOutputHighlight {
  label: string;
  value: string;
}

export interface AIOutputDisplay {
  title: string;
  summary: string;
  bullets: string[];
  highlights?: AIOutputHighlight[];
  footerNote?: string;
}

function compactStrings(values: Array<string | undefined | null>) {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function getSelectedCandidate(batch: MatchQueueBatch): NGOCandidate | undefined {
  return (
    batch.candidates.find((candidate) => candidate.id === batch.selectedCandidateId) ??
    batch.candidates[0]
  );
}

export function buildIntakeOutputDisplay(
  recommendation: AgentRecommendation,
  forecast: ForecastSummary,
  sensorEvidence: SensorEvidence,
): AIOutputDisplay {
  return {
    title: recommendation.agentName || "FoodLoop Intake AI",
    summary: recommendation.summary,
    bullets: compactStrings([
      `Needs confirmation: ${recommendation.requiredConfirmation}`,
      `Forecast: ${forecast.predictedBand} during ${forecast.likelyWindow}.`,
      `Evidence: ${sensorEvidence.holdingStatus}; ${sensorEvidence.sensorAttachment}.`,
    ]),
    highlights: compactStrings([
      recommendation.confidence ? `${recommendation.confidence}%` : undefined,
    ]).map((value) => ({ label: "Confidence", value })),
    footerNote: compactStrings([
      recommendation.handlingPriority,
      sensorEvidence.lastReadingAt
        ? `Last evidence reading: ${sensorEvidence.lastReadingAt}`
        : undefined,
    ]).join(" - "),
  };
}

export function buildMatchingOutputDisplay(batch: MatchQueueBatch): AIOutputDisplay {
  const selectedCandidate = getSelectedCandidate(batch);

  return {
    title: "Recipient match reasoning",
    summary: batch.aiSummary,
    bullets: compactStrings([
      batch.ngoFitExplanation,
      selectedCandidate
        ? `Top recommendation: ${selectedCandidate.name}. ${selectedCandidate.reason}`
        : undefined,
      batch.handlingNotes ? `Handling note: ${batch.handlingNotes}` : undefined,
      batch.routePreview ? `Route preview: ${batch.routePreview}` : undefined,
    ]),
    highlights: [
      selectedCandidate
        ? { label: "Top match", value: selectedCandidate.name }
        : undefined,
      selectedCandidate
        ? { label: "Score", value: `${selectedCandidate.score}/100` }
        : undefined,
      { label: "Priority", value: batch.handlingPriority },
      { label: "Deadline", value: batch.pickupDeadline },
    ].filter((item): item is AIOutputHighlight => Boolean(item)),
  };
}

export function buildCommunicationOutputDisplay(
  response: AIModalResponse,
): AIOutputDisplay {
  return {
    title: response.title,
    summary: response.intro,
    bullets: compactStrings([response.message, ...response.nextSteps]),
    highlights: response.nextSteps.length
      ? [{ label: "Next steps", value: String(response.nextSteps.length) }]
      : undefined,
    footerNote: response.confidenceNote,
  };
}

export function buildRouteOutputDisplay(
  routePlan: SharedRoutePlan,
): AIOutputDisplay {
  return {
    title: routePlan.agent.agentName || "FoodLoop Route AI",
    summary: routePlan.agent.summary,
    bullets: routePlan.agent.reasons,
    highlights: [
      { label: "ETA", value: routePlan.agent.etaLabel },
      { label: "Window", value: routePlan.agent.pickupWindow },
      { label: "Status", value: routePlan.agent.statusLabel },
      { label: "Distance", value: routePlan.routeDistanceLabel },
    ],
    footerNote:
      "Route facts stay deterministic; the AI explains the route without changing ETA, stops, or geometry.",
  };
}

export function buildImpactOutputDisplay(
  impactSummary: ImpactAgentSummary,
): AIOutputDisplay {
  return {
    title: impactSummary.title,
    summary: impactSummary.intro,
    bullets: impactSummary.points,
    footerNote: impactSummary.caveat,
  };
}

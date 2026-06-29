import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";

declare const process: {
  cwd: () => string;
};

const openRouterChatEndpoint = "https://openrouter.ai/api/v1/chat/completions";
const defaultOpenRouterModel = "openai/gpt-4o-mini";
const openRouterTimeoutMs = 12_000;

type AISource = "openrouter" | "fallback";
type HandlingPriority = "Low handling risk" | "Needs confirmation" | "Short window";
type AgentAction = "request-info" | "decline";

interface BatchDraft {
  donorName: string;
  location: string;
  category: string;
  itemDescription: string;
  quantity: string;
  unit: string;
  packaging: string;
  preparedTime: string;
  pickupDeadline: string;
  storageLocation: string;
  temperatureStatus: string;
  holdingStatus: string;
  sensorAttachment: string;
  handlingPriority: HandlingPriority;
  donorNotes: string;
}

interface AgentRecommendation {
  agentName: string;
  confidence: number;
  extractedCategory: string;
  extractedQuantity: string;
  extractedPackaging: string;
  preparedTime: string;
  pickupDeadline: string;
  requiredConfirmation: string;
  handlingPriority: HandlingPriority;
  summary: string;
}

interface ForecastSummary {
  predictedBand: string;
  likelyWindow: string;
  patternBasis: string;
  confidence: number;
}

interface SensorEvidence {
  storageLocation: string;
  temperature: string;
  holdingStatus: string;
  sensorAttachment: string;
  lastReadingAt: string;
}

interface IntakeScenarioPayload {
  id?: string;
  title?: string;
  donorName?: string;
  location?: string;
  categoryHint?: string;
  fallbackDraft?: BatchDraft;
  fallbackRecommendation?: AgentRecommendation;
  forecast?: ForecastSummary;
  sensorEvidence?: SensorEvidence;
}

interface IntakeAgentRequest {
  scenario?: IntakeScenarioPayload;
}

interface IntakeAgentResponse {
  draft: BatchDraft;
  recommendation: AgentRecommendation;
  forecast: ForecastSummary;
  sensorEvidence: SensorEvidence;
  source: AISource;
  model?: string;
}

interface MatchFactors {
  compatibility: number;
  demand: number;
  distance: number;
  capacity: number;
  urgencyFit: number;
}

interface NGOCandidate {
  id: string;
  name: string;
  district: string;
  distanceKm: number;
  demandLabel: string;
  capacityLabel: string;
  serviceWindow: string;
  score: number;
  factors: MatchFactors;
  reason: string;
  progressStatus: string;
}

interface MatchRankAgentRequest {
  batchDraft?: BatchDraft;
  scenario?: IntakeScenarioPayload;
  candidatePool?: NGOCandidate[];
}

interface MatchRankAgentResponse {
  candidates: NGOCandidate[];
  aiSummary: string;
  ngoFitExplanation: string;
  handlingNotes: string;
  routePreview: string;
  source: AISource;
  model?: string;
}

interface MatchingAgentRequest {
  action?: AgentAction;
  role?: "donor" | "ngo";
  batchId?: string;
  batchTitle?: string;
  candidateName?: string;
  handlingPriority?: string;
  context?: string[];
}

interface MatchingAgentResponse {
  title: string;
  intro: string;
  message: string;
  nextSteps: string[];
  confidenceNote: string;
  source: AISource;
  model?: string;
}

interface ImpactAgentRequest {
  batch?: {
    id?: string;
    title?: string;
    donorName?: string;
    itemDescription?: string;
    quantityLabel?: string;
    handlingPriority?: string;
  };
  candidate?: {
    id?: string;
    name?: string;
    district?: string;
  };
  currentImpact?: {
    estimatedItems?: number;
    kgRescued?: number;
    mealEquivalents?: number;
    co2eAvoidedKg?: number;
  };
}

interface ImpactAgentResponse {
  title: string;
  intro: string;
  points: string[];
  caveat: string;
  source: AISource;
  model?: string;
}

interface ReadableRequestBody {
  on: (
    eventName: "data" | "end" | "error",
    listener: (value?: unknown) => void,
  ) => void;
}

interface DevRequest extends ReadableRequestBody {
  method?: string;
}

interface DevResponse {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
}

const allowedHandlingPriorities: HandlingPriority[] = [
  "Low handling risk",
  "Needs confirmation",
  "Short window",
];

const fallbackDraft: BatchDraft = {
  donorName: "Sunrise Bakery",
  location: "Queen's Road East, Wan Chai",
  category: "Bakery surplus",
  itemDescription: "Assorted buns, rolls, croissants",
  quantity: "118",
  unit: "items",
  packaging: "Clamshell boxes and paper sleeves",
  preparedTime: "Today, 10:20 AM",
  pickupDeadline: "Today, 2:45 PM",
  storageLocation: "Front prep counter, Wan Chai",
  temperatureStatus: "Ambient, 24.1 C",
  holdingStatus: "Sealed packaging, no open handling observed",
  sensorAttachment: "Tag FL-WC-17 attached",
  handlingPriority: "Low handling risk",
  donorNotes:
    "Please collect from the side entrance. Donor confirms the record before matching.",
};

const fallbackRecommendation: AgentRecommendation = {
  agentName: "AI Intake Agent",
  confidence: 86,
  extractedCategory: "Bakery surplus",
  extractedQuantity: "118 items",
  extractedPackaging: "Boxes and paper sleeves",
  preparedTime: "Today, 10:20 AM",
  pickupDeadline: "Today, 2:45 PM",
  requiredConfirmation: "Donor confirms category, quantity, and pickup window.",
  handlingPriority: "Low handling risk",
  summary:
    "AI drafted a structured batch from the photo. It is decision support only.",
};

const fallbackForecast: ForecastSummary = {
  predictedBand: "100 to 130 bakery items",
  likelyWindow: "Late morning surplus peak",
  patternBasis: "Typical donor output for this scenario",
  confidence: 78,
};

const fallbackSensorEvidence: SensorEvidence = {
  storageLocation: "Front prep counter, Wan Chai",
  temperature: "24.1 C ambient",
  holdingStatus: "Holding stable",
  sensorAttachment: "Tag FL-WC-17",
  lastReadingAt: "10:24 AM",
};

const fallbackModalCopy: Record<
  AgentAction,
  Omit<MatchingAgentResponse, "source" | "model">
> = {
  "request-info": {
    title: "Information request draft",
    intro: "Fallback demo copy generated without a live AI response.",
    message:
      "Please confirm the final count, pickup contact, holding location, and any packaging notes before the recipient accepts this batch.",
    nextSteps: [
      "Send the request to the donor contact.",
      "Keep the recipient place in queue while waiting.",
      "Refresh the match recommendation after the donor replies.",
    ],
    confidenceNote:
      "This text is canned for the local demo. Add OPENROUTER_API_KEY for live generated wording.",
  },
  decline: {
    title: "Decline and reroute note",
    intro: "Fallback demo copy generated without a live AI response.",
    message:
      "Thank you for reviewing this opportunity. We cannot accept the current batch window, so FoodLoop should offer it to the next matched recipient.",
    nextSteps: [
      "Record the decline reason for matching transparency.",
      "Keep the batch visible to backup recipients.",
      "Notify the donor only after a new recipient is selected.",
    ],
    confidenceNote:
      "This text is canned for the local demo. Add OPENROUTER_API_KEY for live generated wording.",
  },
};

const fallbackImpactResponse: ImpactAgentResponse = {
  title: "AI Impact Agent summary",
  intro:
    "FoodLoop converted the confirmed handoff into an impact story across rescue volume, community value, ESG reporting, and operational efficiency.",
  points: [
    "This pickup adds a receipt-level impact estimate to the overall FoodLoop demo totals.",
    "NGO confirmation closes the loop before impact language appears.",
    "FoodLoop keeps demo estimates separate from audited measurement claims.",
  ],
  caveat:
    "All current-pickup impact values use deterministic demo formulas for pitch clarity.",
  source: "fallback",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const clampScore = (value: unknown, fallback: number) => {
  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(numberValue)));
};

const normaliseHandlingPriority = (
  value: unknown,
  fallback: HandlingPriority,
): HandlingPriority =>
  allowedHandlingPriorities.includes(value as HandlingPriority)
    ? (value as HandlingPriority)
    : fallback;

const normaliseStringArray = (
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

const readRequestBody = (request: ReadableRequestBody) =>
  new Promise<string>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const sendJson = (response: DevResponse, statusCode: number, payload: unknown) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const parseRequestPayload = async <T>(request: DevRequest) =>
  JSON.parse(await readRequestBody(request)) as T;

const extractContentText = (content: unknown) =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content
          .map((part) =>
            typeof part === "object" && part && "text" in part
              ? String(part.text)
              : "",
          )
          .join("")
      : "";

const parseAgentJson = (content: unknown): unknown | null => {
  const trimmed = extractContentText(content).trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : (trimmed.match(/\{[\s\S]*\}/)?.[0] ?? "");

  if (!jsonText) {
    return null;
  }

  try {
    return JSON.parse(jsonText) as unknown;
  } catch {
    return null;
  }
};

const requestOpenRouterContent = async ({
  apiKey,
  model,
  temperature,
  messages,
}: {
  apiKey: string;
  model: string;
  temperature: number;
  messages: Array<{ role: "system" | "user"; content: string }>;
}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), openRouterTimeoutMs);

  try {
    const openRouterResponse = await fetch(openRouterChatEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "FoodLoop RescueCore Demo",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!openRouterResponse.ok) {
      return { ok: false as const, status: openRouterResponse.status };
    }

    const data = (await openRouterResponse.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    return {
      ok: true as const,
      content: data.choices?.[0]?.message?.content,
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

const getScenarioFallback = (scenario?: IntakeScenarioPayload) => ({
  id: asString(scenario?.id, "bakery"),
  title: asString(scenario?.title, "Wan Chai bakery surplus"),
  donorName: asString(scenario?.donorName, fallbackDraft.donorName),
  location: asString(scenario?.location, fallbackDraft.location),
  categoryHint: asString(scenario?.categoryHint, fallbackDraft.category),
  fallbackDraft: scenario?.fallbackDraft ?? fallbackDraft,
  fallbackRecommendation: scenario?.fallbackRecommendation ?? fallbackRecommendation,
  forecast: scenario?.forecast ?? fallbackForecast,
  sensorEvidence: scenario?.sensorEvidence ?? fallbackSensorEvidence,
});

const normaliseDraft = (value: unknown, fallback: BatchDraft): BatchDraft => {
  const draft = isRecord(value) ? value : {};

  return {
    donorName: asString(draft.donorName, fallback.donorName),
    location: asString(draft.location, fallback.location),
    category: asString(draft.category, fallback.category),
    itemDescription: asString(draft.itemDescription, fallback.itemDescription),
    quantity: asString(draft.quantity, fallback.quantity),
    unit: asString(draft.unit, fallback.unit),
    packaging: asString(draft.packaging, fallback.packaging),
    preparedTime: asString(draft.preparedTime, fallback.preparedTime),
    pickupDeadline: asString(draft.pickupDeadline, fallback.pickupDeadline),
    storageLocation: asString(draft.storageLocation, fallback.storageLocation),
    temperatureStatus: asString(draft.temperatureStatus, fallback.temperatureStatus),
    holdingStatus: asString(draft.holdingStatus, fallback.holdingStatus),
    sensorAttachment: asString(draft.sensorAttachment, fallback.sensorAttachment),
    handlingPriority: normaliseHandlingPriority(
      draft.handlingPriority,
      fallback.handlingPriority,
    ),
    donorNotes: asString(draft.donorNotes, fallback.donorNotes),
  };
};

const normaliseRecommendation = (
  value: unknown,
  fallback: AgentRecommendation,
  draft: BatchDraft,
): AgentRecommendation => {
  const recommendation = isRecord(value) ? value : {};

  return {
    agentName: asString(recommendation.agentName, fallback.agentName),
    confidence: clampScore(recommendation.confidence, fallback.confidence),
    extractedCategory: asString(
      recommendation.extractedCategory,
      draft.category || fallback.extractedCategory,
    ),
    extractedQuantity: asString(
      recommendation.extractedQuantity,
      `${draft.quantity} ${draft.unit}`.trim() || fallback.extractedQuantity,
    ),
    extractedPackaging: asString(
      recommendation.extractedPackaging,
      draft.packaging || fallback.extractedPackaging,
    ),
    preparedTime: asString(
      recommendation.preparedTime,
      draft.preparedTime || fallback.preparedTime,
    ),
    pickupDeadline: asString(
      recommendation.pickupDeadline,
      draft.pickupDeadline || fallback.pickupDeadline,
    ),
    requiredConfirmation: asString(
      recommendation.requiredConfirmation,
      fallback.requiredConfirmation,
    ),
    handlingPriority: normaliseHandlingPriority(
      recommendation.handlingPriority,
      draft.handlingPriority,
    ),
    summary: asString(recommendation.summary, fallback.summary),
  };
};

const normaliseForecast = (
  value: unknown,
  fallback: ForecastSummary,
): ForecastSummary => {
  const forecast = isRecord(value) ? value : {};

  return {
    predictedBand: asString(forecast.predictedBand, fallback.predictedBand),
    likelyWindow: asString(forecast.likelyWindow, fallback.likelyWindow),
    patternBasis: asString(forecast.patternBasis, fallback.patternBasis),
    confidence: clampScore(forecast.confidence, fallback.confidence),
  };
};

const normaliseSensorEvidence = (
  value: unknown,
  fallback: SensorEvidence,
): SensorEvidence => {
  const sensor = isRecord(value) ? value : {};

  return {
    storageLocation: asString(sensor.storageLocation, fallback.storageLocation),
    temperature: asString(sensor.temperature, fallback.temperature),
    holdingStatus: asString(sensor.holdingStatus, fallback.holdingStatus),
    sensorAttachment: asString(sensor.sensorAttachment, fallback.sensorAttachment),
    lastReadingAt: asString(sensor.lastReadingAt, fallback.lastReadingAt),
  };
};

const fallbackIntakeResponse = (
  scenario?: IntakeScenarioPayload,
  detail?: string,
): IntakeAgentResponse => {
  const scenarioFallback = getScenarioFallback(scenario);

  return {
    draft: scenarioFallback.fallbackDraft,
    recommendation: {
      ...scenarioFallback.fallbackRecommendation,
      summary: detail
        ? `${scenarioFallback.fallbackRecommendation.summary} ${detail}`
        : scenarioFallback.fallbackRecommendation.summary,
    },
    forecast: scenarioFallback.forecast,
    sensorEvidence: scenarioFallback.sensorEvidence,
    source: "fallback",
  };
};

const normaliseIntakeResponse = (
  value: unknown,
  scenario: IntakeScenarioPayload | undefined,
  model: string,
): IntakeAgentResponse | null => {
  if (!isRecord(value) || !isRecord(value.draft)) {
    return null;
  }

  const fallback = getScenarioFallback(scenario);
  const draft = normaliseDraft(value.draft, fallback.fallbackDraft);

  return {
    draft,
    recommendation: normaliseRecommendation(
      value.recommendation,
      fallback.fallbackRecommendation,
      draft,
    ),
    forecast: normaliseForecast(value.forecast, fallback.forecast),
    sensorEvidence: normaliseSensorEvidence(
      value.sensorEvidence,
      fallback.sensorEvidence,
    ),
    source: "openrouter",
    model,
  };
};

const normaliseFactors = (
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

const cloneCandidatePool = (candidatePool?: NGOCandidate[]) =>
  Array.isArray(candidatePool)
    ? candidatePool
        .filter((candidate) => isRecord(candidate) && typeof candidate.id === "string")
        .map((candidate) => ({
          ...candidate,
          score: clampScore(candidate.score, 70),
          factors: normaliseFactors(candidate.factors, {
            compatibility: 70,
            demand: 70,
            distance: 70,
            capacity: 70,
            urgencyFit: 70,
          }),
        }))
    : [];

const fallbackMatchRankResponse = (
  request: MatchRankAgentRequest,
  detail?: string,
): MatchRankAgentResponse => {
  const candidatePool = cloneCandidatePool(request.candidatePool);
  const fallback = getScenarioFallback(request.scenario);
  const draft = request.batchDraft ?? fallback.fallbackDraft;
  const quantityLabel = draft.quantity
    ? `${draft.quantity} ${draft.unit}`
    : "the submitted batch";

  return {
    candidates: candidatePool,
    aiSummary: `FoodLoop ranked the known candidate pool for ${quantityLabel} of ${
      draft.itemDescription || fallback.categoryHint
    }.`,
    ngoFitExplanation: detail
      ? `Fallback ranking used known demo recipients. ${detail}`
      : "Fallback ranking used known demo recipients and did not add unverified NGOs.",
    handlingNotes:
      draft.handlingPriority === "Short window"
        ? "Use a nearby recipient with capacity inside the donor pickup window."
        : draft.handlingPriority === "Needs confirmation"
          ? "Recipient should confirm count, handoff notes, and any quality observations before acceptance."
          : "Packaging and pickup timing look operationally straightforward, pending human confirmation.",
    routePreview:
      "Likely pickup route will be generated after the recipient accepts the batch.",
    source: "fallback",
  };
};

const normaliseMatchRankResponse = (
  value: unknown,
  request: MatchRankAgentRequest,
  model: string,
): MatchRankAgentResponse | null => {
  if (!isRecord(value) || !Array.isArray(value.candidates)) {
    return null;
  }

  const candidatePool = cloneCandidatePool(request.candidatePool);
  const knownCandidates = new Map(
    candidatePool.map((candidate) => [candidate.id, candidate]),
  );
  const rankedCandidates: NGOCandidate[] = [];
  const seenCandidateIds = new Set<string>();

  for (const candidateValue of value.candidates) {
    if (!isRecord(candidateValue)) {
      continue;
    }

    const id = asString(candidateValue.id, "");
    const knownCandidate = knownCandidates.get(id);

    if (!knownCandidate || seenCandidateIds.has(id)) {
      continue;
    }

    rankedCandidates.push({
      ...knownCandidate,
      score: clampScore(candidateValue.score, knownCandidate.score),
      factors: normaliseFactors(candidateValue.factors, knownCandidate.factors),
      reason: asString(candidateValue.reason, knownCandidate.reason),
      progressStatus: asString(
        candidateValue.progressStatus,
        knownCandidate.progressStatus,
      ),
    });
    seenCandidateIds.add(id);
  }

  if (rankedCandidates.length === 0) {
    return null;
  }

  for (const candidate of candidatePool) {
    if (!seenCandidateIds.has(candidate.id)) {
      rankedCandidates.push(candidate);
    }
  }

  const fallback = fallbackMatchRankResponse(request);

  return {
    candidates: rankedCandidates,
    aiSummary: asString(value.aiSummary, fallback.aiSummary),
    ngoFitExplanation: asString(
      value.ngoFitExplanation,
      fallback.ngoFitExplanation,
    ),
    handlingNotes: asString(value.handlingNotes, fallback.handlingNotes),
    routePreview: asString(value.routePreview, fallback.routePreview),
    source: "openrouter",
    model,
  };
};

const fallbackResponse = (
  action: AgentAction = "request-info",
  detail?: string,
): MatchingAgentResponse => ({
  ...fallbackModalCopy[action],
  confidenceNote: detail
    ? `${fallbackModalCopy[action].confidenceNote} ${detail}`
    : fallbackModalCopy[action].confidenceNote,
  source: "fallback",
});

const normaliseModalResponse = (
  value: unknown,
  action: AgentAction,
  model: string,
): MatchingAgentResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  const fallback = fallbackResponse(action);

  return {
    title: asString(value.title, fallback.title),
    intro: asString(value.intro, fallback.intro),
    message: asString(value.message, fallback.message),
    nextSteps: normaliseStringArray(value.nextSteps, fallback.nextSteps, 3),
    confidenceNote: asString(value.confidenceNote, fallback.confidenceNote),
    source: "openrouter",
    model,
  };
};

const fallbackImpactAgentResponse = (detail?: string): ImpactAgentResponse => ({
  ...fallbackImpactResponse,
  caveat: detail
    ? `${fallbackImpactResponse.caveat} ${detail}`
    : fallbackImpactResponse.caveat,
});

const normaliseImpactResponse = (
  value: unknown,
  model: string,
): ImpactAgentResponse | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    title: asString(value.title, fallbackImpactResponse.title),
    intro: asString(value.intro, fallbackImpactResponse.intro),
    points: normaliseStringArray(value.points, fallbackImpactResponse.points, 4),
    caveat: asString(value.caveat, fallbackImpactResponse.caveat),
    source: "openrouter",
    model,
  };
};

const createMatchingAgentPlugin = (mode: string): Plugin => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.OPENROUTER_MODEL || defaultOpenRouterModel;

  return {
    name: "foodloop-matching-agent",
    configureServer(server) {
      server.middlewares.use("/api/intake-agent", async (request, response) => {
        const devRequest = request as DevRequest;
        const devResponse = response as DevResponse;

        if (devRequest.method !== "POST") {
          devResponse.statusCode = 405;
          devResponse.setHeader("Allow", "POST");
          devResponse.end("Method Not Allowed");
          return;
        }

        let payload: IntakeAgentRequest;

        try {
          payload = await parseRequestPayload<IntakeAgentRequest>(devRequest);
        } catch {
          sendJson(devResponse, 400, { error: "Invalid JSON body" });
          return;
        }

        if (!apiKey) {
          sendJson(
            devResponse,
            200,
            fallbackIntakeResponse(payload.scenario, "No local API key was configured."),
          );
          return;
        }

        try {
          const result = await requestOpenRouterContent({
            apiKey,
            model,
            temperature: 0.18,
            messages: [
              {
                role: "system",
                content:
                  "You are FoodLoop's Intake Agent for a pitch demo. Return only valid JSON with draft, recommendation, forecast, and sensorEvidence. The draft must use donor-observed handling recommendations only, never certification or verdict wording. handlingPriority must be exactly one of: Low handling risk, Needs confirmation, Short window.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  task:
                    "Create a donor-editable intake draft from this selected photo scenario.",
                  scenario: payload.scenario,
                }),
              },
            ],
          });

          if (!result.ok) {
            sendJson(
              devResponse,
              200,
              fallbackIntakeResponse(
                payload.scenario,
                `OpenRouter returned ${result.status}.`,
              ),
            );
            return;
          }

          const parsed = normaliseIntakeResponse(
            parseAgentJson(result.content),
            payload.scenario,
            model,
          );

          sendJson(
            devResponse,
            200,
            parsed ??
              fallbackIntakeResponse(
                payload.scenario,
                "OpenRouter response could not be validated.",
              ),
          );
        } catch {
          sendJson(
            devResponse,
            200,
            fallbackIntakeResponse(payload.scenario, "OpenRouter request failed."),
          );
        }
      });

      server.middlewares.use("/api/match-rank-agent", async (request, response) => {
        const devRequest = request as DevRequest;
        const devResponse = response as DevResponse;

        if (devRequest.method !== "POST") {
          devResponse.statusCode = 405;
          devResponse.setHeader("Allow", "POST");
          devResponse.end("Method Not Allowed");
          return;
        }

        let payload: MatchRankAgentRequest;

        try {
          payload = await parseRequestPayload<MatchRankAgentRequest>(devRequest);
        } catch {
          sendJson(devResponse, 400, { error: "Invalid JSON body" });
          return;
        }

        if (cloneCandidatePool(payload.candidatePool).length === 0) {
          sendJson(devResponse, 400, { error: "Candidate pool is required" });
          return;
        }

        if (!apiKey) {
          sendJson(
            devResponse,
            200,
            fallbackMatchRankResponse(payload, "No local API key was configured."),
          );
          return;
        }

        try {
          const result = await requestOpenRouterContent({
            apiKey,
            model,
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content:
                  "You are FoodLoop's Matching Agent. Return only valid JSON with candidates, aiSummary, ngoFitExplanation, handlingNotes, and routePreview. You may only rank candidate IDs supplied by the user. Do not invent NGOs, workflow states, safety verdicts, or unsafe labels. Scores and factor values must be integers from 0 to 100.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  task:
                    "Rank the known NGO candidates for this donor-confirmed batch.",
                  batchDraft: payload.batchDraft,
                  scenario: payload.scenario,
                  allowedCandidateIds: cloneCandidatePool(payload.candidatePool).map(
                    (candidate) => candidate.id,
                  ),
                  candidatePool: payload.candidatePool,
                }),
              },
            ],
          });

          if (!result.ok) {
            sendJson(
              devResponse,
              200,
              fallbackMatchRankResponse(
                payload,
                `OpenRouter returned ${result.status}.`,
              ),
            );
            return;
          }

          const parsed = normaliseMatchRankResponse(
            parseAgentJson(result.content),
            payload,
            model,
          );

          sendJson(
            devResponse,
            200,
            parsed ??
              fallbackMatchRankResponse(
                payload,
                "OpenRouter ranking could not be validated.",
              ),
          );
        } catch {
          sendJson(
            devResponse,
            200,
            fallbackMatchRankResponse(payload, "OpenRouter request failed."),
          );
        }
      });

      server.middlewares.use("/api/matching-agent", async (request, response) => {
        const devRequest = request as DevRequest;
        const devResponse = response as DevResponse;

        if (devRequest.method !== "POST") {
          devResponse.statusCode = 405;
          devResponse.setHeader("Allow", "POST");
          devResponse.end("Method Not Allowed");
          return;
        }

        let payload: MatchingAgentRequest;

        try {
          payload = await parseRequestPayload<MatchingAgentRequest>(devRequest);
        } catch {
          sendJson(devResponse, 400, { error: "Invalid JSON body" });
          return;
        }

        const action = payload.action === "decline" ? "decline" : "request-info";

        if (!apiKey) {
          sendJson(
            devResponse,
            200,
            fallbackResponse(action, "No local API key was configured."),
          );
          return;
        }

        try {
          const result = await requestOpenRouterContent({
            apiKey,
            model,
            temperature: 0.25,
            messages: [
              {
                role: "system",
                content:
                  "You are FoodLoop's Matching Agent for a pitch demo. Return only valid JSON with title, intro, message, nextSteps, and confidenceNote. Keep wording concise, operational, and human-confirmed. Use handling and review language, not certification verdict wording.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  task:
                    action === "request-info"
                      ? "Draft an NGO-to-donor information request."
                      : "Draft an NGO decline and reroute note.",
                  payload,
                }),
              },
            ],
          });

          if (!result.ok) {
            sendJson(
              devResponse,
              200,
              fallbackResponse(action, `OpenRouter returned ${result.status}.`),
            );
            return;
          }

          const parsed = normaliseModalResponse(
            parseAgentJson(result.content),
            action,
            model,
          );

          sendJson(
            devResponse,
            200,
            parsed ??
              fallbackResponse(action, "OpenRouter response could not be parsed."),
          );
        } catch {
          sendJson(
            devResponse,
            200,
            fallbackResponse(action, "OpenRouter request failed."),
          );
        }
      });

      server.middlewares.use("/api/impact-agent", async (request, response) => {
        const devRequest = request as DevRequest;
        const devResponse = response as DevResponse;

        if (devRequest.method !== "POST") {
          devResponse.statusCode = 405;
          devResponse.setHeader("Allow", "POST");
          devResponse.end("Method Not Allowed");
          return;
        }

        let payload: ImpactAgentRequest;

        try {
          payload = await parseRequestPayload<ImpactAgentRequest>(devRequest);
        } catch {
          sendJson(devResponse, 400, { error: "Invalid JSON body" });
          return;
        }

        if (!apiKey) {
          sendJson(
            devResponse,
            200,
            fallbackImpactAgentResponse("No local API key was configured."),
          );
          return;
        }

        try {
          const result = await requestOpenRouterContent({
            apiKey,
            model,
            temperature: 0.22,
            messages: [
              {
                role: "system",
                content:
                  "You are FoodLoop's Impact Agent. Return only valid JSON with title, intro, points, and caveat. The handoff is confirmed by an NGO, but all impact values are demo estimates and must not be described as audited measurement.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  task:
                    "Summarize the confirmed rescue handoff for a pitch demo impact panel.",
                  payload,
                }),
              },
            ],
          });

          if (!result.ok) {
            sendJson(
              devResponse,
              200,
              fallbackImpactAgentResponse(`OpenRouter returned ${result.status}.`),
            );
            return;
          }

          const parsed = normaliseImpactResponse(parseAgentJson(result.content), model);

          sendJson(
            devResponse,
            200,
            parsed ??
              fallbackImpactAgentResponse(
                "OpenRouter impact summary could not be validated.",
              ),
          );
        } catch {
          sendJson(
            devResponse,
            200,
            fallbackImpactAgentResponse("OpenRouter request failed."),
          );
        }
      });
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), createMatchingAgentPlugin(mode)],
}));

import type {
  AgentRecommendation,
  AIModalAction,
  AIModalResponse,
  BatchDraft,
  DemoPageId,
  ForecastSummary,
  ImpactAgentSummary,
  ImpactCumulativeTrendDatum,
  ImpactMetricDefinition,
  ImpactOverallTotals,
  ImpactSeriesDatum,
  MatchRankAgentResponse,
  MatchQueueBatch,
  NGOCandidate,
  PhotoScenario,
  RouteCoordinate,
  ScenarioId,
  SensorEvidence,
  SharedRoutePlan,
} from "./types";
import { getSkillMetadata } from "./ai/skillRegistry";
import bakeryPhoto from "./assets/wan-chai-bakery-surplus.png";
import sandwichPhoto from "./assets/chilled-sandwich-surplus.png";
import fruitPhoto from "./assets/tai-kok-tsui-fruit-boxes.png";

const toDatetimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const todayAt = (hours: number, minutes: number) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return toDatetimeLocalValue(date);
};

export const pageMeta: Array<{
  id: DemoPageId;
  label: string;
  path: string;
  status: string;
}> = [
  {
    id: "intake",
    label: "Donor Intake",
    path: "/intake",
    status: "Ready for walkthrough",
  },
  {
    id: "matching",
    label: "NGO Match Queue",
    path: "/matching",
    status: "Ready for walkthrough",
  },
  {
    id: "route",
    label: "Shared Route",
    path: "/route",
    status: "Ready for walkthrough",
  },
  {
    id: "impact",
    label: "Shared Impact",
    path: "/impact",
    status: "Unlocks after receipt",
  },
  {
    id: "architecture",
    label: "AI Skills",
    path: "/architecture",
    status: "Prompt showcase",
  },
];

export const emptyDraft: BatchDraft = {
  donorName: "Sunrise Bakery",
  location: "Queen's Road East, Wan Chai",
  category: "",
  itemDescription: "",
  quantity: "",
  unit: "items",
  packaging: "",
  preparedTime: "",
  pickupDeadline: "",
  storageLocation: "Front prep counter, Wan Chai",
  temperatureStatus: "Ambient, holding stable",
  holdingStatus: "Sealed and ready for pickup",
  sensorAttachment: "Tag FL-WC-17",
  handlingPriority: "Needs confirmation",
  donorNotes: "",
};

export const analyzedDraft: BatchDraft = {
  donorName: "Sunrise Bakery",
  location: "Queen's Road East, Wan Chai",
  category: "Bakery surplus",
  itemDescription: "Assorted buns, rolls, croissants",
  quantity: "118",
  unit: "items",
  packaging: "Clamshell boxes and paper sleeves",
  preparedTime: "Today, 10:20 AM",
  pickupDeadline: todayAt(14, 45),
  storageLocation: "Front prep counter, Wan Chai",
  temperatureStatus: "Ambient, 24.1 C",
  holdingStatus: "Sealed packaging, no open handling observed",
  sensorAttachment: "Tag FL-WC-17 attached",
  handlingPriority: "Low handling risk",
  donorNotes:
    "Please collect from the side entrance. Donor confirms the record before matching.",
};

export const agentRecommendation: AgentRecommendation = {
  agentName: "FoodLoop Intake AI",
  confidence: 86,
  extractedCategory: "Bakery surplus",
  extractedQuantity: "118 items",
  extractedPackaging: "Boxes and paper sleeves",
  preparedTime: "Today, 10:20 AM",
  pickupDeadline: "Today, 2:45 PM",
  requiredConfirmation: "Donor confirms category, quantity, and pickup window.",
  handlingPriority: "Low handling risk",
  summary:
    "FoodLoop AI drafted a structured batch from the photo and Wan Chai donor pattern. It is decision support only.",
};

export const forecastSummary: ForecastSummary = {
  predictedBand: "100 to 130 bakery items",
  likelyWindow: "Late morning surplus peak",
  patternBasis: "Typical Thursday output for Wan Chai bakery donors",
  confidence: 78,
};

export const sensorEvidence: SensorEvidence = {
  storageLocation: "Front prep counter, Wan Chai",
  temperature: "24.1 C ambient",
  holdingStatus: "Holding stable",
  sensorAttachment: "Tag FL-WC-17",
  lastReadingAt: "10:24 AM",
};

const sandwichEmptyDraft: BatchDraft = {
  donorName: "Cedar Table Cafe",
  location: "Hennessy Road, Causeway Bay",
  category: "",
  itemDescription: "",
  quantity: "",
  unit: "packs",
  packaging: "",
  preparedTime: "",
  pickupDeadline: "",
  storageLocation: "Chilled display cabinet, Causeway Bay",
  temperatureStatus: "Chilled, reading required",
  holdingStatus: "Wrapped packs awaiting pickup",
  sensorAttachment: "Tag FL-CB-08",
  handlingPriority: "Needs confirmation",
  donorNotes: "",
};

const sandwichDraft: BatchDraft = {
  donorName: "Cedar Table Cafe",
  location: "Hennessy Road, Causeway Bay",
  category: "Chilled ready-to-eat",
  itemDescription: "Wrapped egg, tuna, and salad sandwiches",
  quantity: "64",
  unit: "packs",
  packaging: "Individually wrapped and labelled",
  preparedTime: "Today, 8:45 AM",
  pickupDeadline: todayAt(13, 20),
  storageLocation: "Chilled display cabinet, Causeway Bay",
  temperatureStatus: "Chilled, 4.7 C",
  holdingStatus: "Sealed packs, staff confirms chilled cabinet holding",
  sensorAttachment: "Tag FL-CB-08 attached",
  handlingPriority: "Short window",
  donorNotes:
    "Please collect with cold bags from the cafe side counter. Donor confirms the record before matching.",
};

const sandwichRecommendation: AgentRecommendation = {
  agentName: "FoodLoop Intake AI",
  confidence: 84,
  extractedCategory: "Chilled ready-to-eat",
  extractedQuantity: "64 packs",
  extractedPackaging: "Individually wrapped packs",
  preparedTime: "Today, 8:45 AM",
  pickupDeadline: "Today, 1:20 PM",
  requiredConfirmation:
    "Donor confirms count, chilled holding, and pickup contact before matching.",
  handlingPriority: "Short window",
  summary:
    "FoodLoop AI drafted a chilled ready-to-eat batch from the photo. It is a handling recommendation only.",
};

const sandwichForecast: ForecastSummary = {
  predictedBand: "55 to 70 sandwich packs",
  likelyWindow: "Breakfast-to-lunch surplus peak",
  patternBasis: "Typical weekday cafe batch from Causeway Bay donors",
  confidence: 74,
};

const sandwichSensorEvidence: SensorEvidence = {
  storageLocation: "Chilled display cabinet, Causeway Bay",
  temperature: "4.7 C chilled",
  holdingStatus: "Holding stable",
  sensorAttachment: "Tag FL-CB-08",
  lastReadingAt: "8:52 AM",
};

const fruitEmptyDraft: BatchDraft = {
  donorName: "Tai Kok Tsui Market Stall 18",
  location: "Fuk Tsun Street, Tai Kok Tsui",
  category: "",
  itemDescription: "",
  quantity: "",
  unit: "boxes",
  packaging: "",
  preparedTime: "",
  pickupDeadline: "",
  storageLocation: "Covered stall area, Tai Kok Tsui",
  temperatureStatus: "Ambient, shaded stall",
  holdingStatus: "Boxed fruit awaiting pickup",
  sensorAttachment: "Photo evidence only",
  handlingPriority: "Needs confirmation",
  donorNotes: "",
};

const fruitDraft: BatchDraft = {
  donorName: "Tai Kok Tsui Market Stall 18",
  location: "Fuk Tsun Street, Tai Kok Tsui",
  category: "Fresh produce",
  itemDescription: "Mixed apple, orange, and pear boxes",
  quantity: "36",
  unit: "boxes",
  packaging: "Stacked cardboard fruit boxes",
  preparedTime: "Today, 9:30 AM",
  pickupDeadline: todayAt(17, 30),
  storageLocation: "Covered stall area, Tai Kok Tsui",
  temperatureStatus: "Ambient, shaded stall",
  holdingStatus: "Covered boxes with mixed ripeness noted",
  sensorAttachment: "Photo evidence attached",
  handlingPriority: "Needs confirmation",
  donorNotes:
    "Please confirm visible bruising and whether partial acceptance is useful for sorting.",
};

const fruitRecommendation: AgentRecommendation = {
  agentName: "FoodLoop Intake AI",
  confidence: 81,
  extractedCategory: "Fresh produce",
  extractedQuantity: "36 boxes",
  extractedPackaging: "Stacked cardboard boxes",
  preparedTime: "Today, 9:30 AM",
  pickupDeadline: "Today, 5:30 PM",
  requiredConfirmation:
    "Donor confirms box count, ripeness notes, and sorting expectations.",
  handlingPriority: "Needs confirmation",
  summary:
    "FoodLoop AI drafted a produce batch from the photo and flagged quality notes for human review.",
};

const fruitForecast: ForecastSummary = {
  predictedBand: "30 to 40 fruit boxes",
  likelyWindow: "Late morning market stall surplus",
  patternBasis: "Typical produce handoff pattern for Tai Kok Tsui donors",
  confidence: 72,
};

const fruitSensorEvidence: SensorEvidence = {
  storageLocation: "Covered stall area, Tai Kok Tsui",
  temperature: "Ambient, shaded",
  holdingStatus: "Covered and ready for sorting",
  sensorAttachment: "Photo evidence only",
  lastReadingAt: "9:34 AM",
};

export const impactOverallTotals: ImpactOverallTotals = {
  foodRescuedKg: 680,
  mealEquivalents: 1240,
  co2eAvoidedTonnes: 1.8,
  pickupSuccessRate: 94,
};

export const impactCumulativeMetricDefinitions: ImpactMetricDefinition[] = [
  {
    key: "kgRescued",
    label: "kg rescued",
    shortLabel: "kg",
    unit: "kg",
    tone: "green",
  },
  {
    key: "mealsDelivered",
    label: "meals delivered",
    shortLabel: "meals",
    unit: "meals",
    tone: "blue",
  },
  {
    key: "co2eAvoidedKg",
    label: "CO2e avoided",
    shortLabel: "CO2e",
    unit: "kg CO2e",
    tone: "green",
  },
];

export const impactCumulativeTrend: ImpactCumulativeTrendDatum[] = [
  { label: "Mon", kgRescued: 74, mealsDelivered: 136, co2eAvoidedKg: 190 },
  { label: "Tue", kgRescued: 156, mealsDelivered: 214, co2eAvoidedKg: 468 },
  { label: "Wed", kgRescued: 231, mealsDelivered: 476, co2eAvoidedKg: 590 },
  { label: "Thu", kgRescued: 419, mealsDelivered: 612, co2eAvoidedKg: 1125 },
  { label: "Fri", kgRescued: 507, mealsDelivered: 988, co2eAvoidedKg: 1386 },
  { label: "Today", kgRescued: 680, mealsDelivered: 1240, co2eAvoidedKg: 1800 },
];

export const impactDonationStatusBreakdown: ImpactSeriesDatum[] = [
  { label: "Completed", value: 74, tone: "green" },
  { label: "Rerouted", value: 16, tone: "blue" },
  { label: "Pending receipt", value: 10, tone: "amber" },
];

export const impactRouteTimeSaved: ImpactSeriesDatum[] = [
  { label: "Intake cleanup", value: 22, tone: "blue" },
  { label: "Recipient matching", value: 34, tone: "green" },
  { label: "Dispatch coordination", value: 18, tone: "amber" },
];

export const impactAgentSummary: ImpactAgentSummary = {
  title: "FoodLoop impact summary",
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
  ...getSkillMetadata("impact"),
};

export const ngoPreviewRows = [
  {
    name: "Harbour Care Kitchen",
    fit: "High fit",
    distance: "1.4 km",
    capacity: "120 item capacity today",
  },
  {
    name: "Wan Chai Community Pantry",
    fit: "High fit",
    distance: "2.1 km",
    capacity: "Morning snacks requested",
  },
  {
    name: "Hope Table Hong Kong",
    fit: "Review",
    distance: "3.0 km",
    capacity: "Needs confirmation",
  },
];

export const matchQueueBatches: MatchQueueBatch[] = ([
  {
    id: "FL-WC-0625-014",
    title: "Bakery surplus",
    donorName: "Sunrise Bakery",
    donorLocation: "Queen's Road East, Wan Chai",
    category: "Bakery surplus",
    itemDescription: "Assorted buns, rolls, croissants",
    quantityLabel: "118 items",
    packaging: "Clamshell boxes and paper sleeves",
    preparedTime: "Today, 10:20 AM",
    pickupDeadline: "Today, 2:45 PM",
    storageEvidence: "Front prep counter, sealed and ready for pickup",
    handlingPriority: "Low handling risk",
    handlingNotes:
      "Packaging is closed and the pickup window leaves time for nearby distribution.",
    aiSummary:
      "FoodLoop found strong bakery demand near Wan Chai and ranked NGOs with confirmed snack capacity today.",
    ngoFitExplanation:
      "This batch reached the NGO queue because bakery items match pantry demand, distance is short, and capacity is already open.",
    donorStatus:
      "Submitted for matching. FoodLoop is ranking recipient fit and capacity.",
    routePreview: "Likely pickup route from Wan Chai to Central in 14-18 minutes.",
    selectedCandidateId: "harbour-care-kitchen",
    candidates: [
      {
        id: "harbour-care-kitchen",
        name: "Harbour Care Kitchen",
        district: "Central and Sheung Wan",
        distanceKm: 1.4,
        demandLabel: "High snack demand",
        capacityLabel: "120 item capacity today",
        serviceWindow: "12:30 PM to 3:30 PM",
        score: 92,
        factors: {
          compatibility: 96,
          demand: 91,
          distance: 94,
          capacity: 88,
          urgencyFit: 86,
        },
        reason:
          "Accepts bakery items, has a lunch pantry run today, and can collect before the donor deadline.",
        progressStatus: "Top recommendation",
      },
      {
        id: "wan-chai-community-pantry",
        name: "Wan Chai Community Pantry",
        district: "Wan Chai",
        distanceKm: 2.1,
        demandLabel: "Steady demand",
        capacityLabel: "90 item capacity",
        serviceWindow: "1:00 PM to 4:00 PM",
        score: 86,
        factors: {
          compatibility: 93,
          demand: 83,
          distance: 88,
          capacity: 78,
          urgencyFit: 84,
        },
        reason:
          "Strong food fit and nearby collection, but lower remaining capacity than the top recipient.",
        progressStatus: "Available backup",
      },
      {
        id: "north-point-meal-circle",
        name: "North Point Meal Circle",
        district: "North Point",
        distanceKm: 3.2,
        demandLabel: "Moderate demand",
        capacityLabel: "140 item capacity",
        serviceWindow: "2:00 PM to 5:00 PM",
        score: 79,
        factors: {
          compatibility: 89,
          demand: 74,
          distance: 72,
          capacity: 91,
          urgencyFit: 70,
        },
        reason:
          "Capacity is strong, but travel time makes the pickup less efficient for this batch.",
        progressStatus: "Reroute option",
      },
    ],
    recipientProgress: [
      { label: "Submitted", status: "done" },
      { label: "Ranked", status: "active" },
      { label: "Recipient review", status: "waiting" },
      { label: "Route pending", status: "waiting" },
    ],
  },
  {
    id: "FL-CT-0625-022",
    title: "Chilled sandwiches",
    donorName: "Cedar Table Cafe",
    donorLocation: "Hennessy Road, Causeway Bay",
    category: "Chilled ready-to-eat",
    itemDescription: "Wrapped egg, tuna, and salad sandwiches",
    quantityLabel: "64 packs",
    packaging: "Individually wrapped and labelled",
    preparedTime: "Today, 8:45 AM",
    pickupDeadline: "Today, 1:20 PM",
    storageEvidence: "Chilled cabinet, 4.7 C, staff confirms sealed packs",
    handlingPriority: "Short window",
    handlingNotes:
      "Pickup should be accepted by an NGO with cold-bag capacity and a nearby route.",
    aiSummary:
      "FoodLoop prioritised cold-chain capacity, short travel time, and immediate meal demand.",
    ngoFitExplanation:
      "This batch reached the queue because the NGO has chilled transport capacity and a meal service starting soon.",
    donorStatus:
      "Submitted with a short pickup window. FoodLoop is checking chilled capacity before acceptance.",
    routePreview: "Likely pickup route from Causeway Bay to Tin Hau in 10-14 minutes.",
    selectedCandidateId: "tin-hau-supper-room",
    candidates: [
      {
        id: "tin-hau-supper-room",
        name: "Tin Hau Supper Room",
        district: "Tin Hau",
        distanceKm: 1.1,
        demandLabel: "Immediate lunch demand",
        capacityLabel: "Cold bags for 70 packs",
        serviceWindow: "12:00 PM to 2:00 PM",
        score: 89,
        factors: {
          compatibility: 91,
          demand: 94,
          distance: 96,
          capacity: 86,
          urgencyFit: 91,
        },
        reason:
          "Closest chilled-capable recipient with meal service inside the donor pickup window.",
        progressStatus: "Top recommendation",
      },
      {
        id: "causeway-neighbour-table",
        name: "Causeway Neighbour Table",
        district: "Causeway Bay",
        distanceKm: 0.8,
        demandLabel: "Medium demand",
        capacityLabel: "Cold bags for 42 packs",
        serviceWindow: "12:30 PM to 3:00 PM",
        score: 82,
        factors: {
          compatibility: 87,
          demand: 78,
          distance: 98,
          capacity: 64,
          urgencyFit: 88,
        },
        reason:
          "Very close, but current cold capacity is below the full batch quantity.",
        progressStatus: "Partial capacity",
      },
      {
        id: "eastern-harbour-lunch-club",
        name: "Eastern Harbour Lunch Club",
        district: "Quarry Bay",
        distanceKm: 4.6,
        demandLabel: "High demand",
        capacityLabel: "Cold bags for 100 packs",
        serviceWindow: "1:30 PM to 4:00 PM",
        score: 75,
        factors: {
          compatibility: 92,
          demand: 90,
          distance: 58,
          capacity: 94,
          urgencyFit: 62,
        },
        reason:
          "Demand and capacity are strong, but route timing is weaker for the pickup deadline.",
        progressStatus: "Later reroute",
      },
    ],
    recipientProgress: [
      { label: "Submitted", status: "done" },
      { label: "Cold capacity check", status: "active" },
      { label: "Recipient review", status: "waiting" },
      { label: "Route pending", status: "waiting" },
    ],
  },
  {
    id: "FL-TK-0625-031",
    title: "Fruit boxes",
    donorName: "Tai Kok Tsui Market Stall 18",
    donorLocation: "Fuk Tsun Street, Tai Kok Tsui",
    category: "Fresh produce",
    itemDescription: "Mixed apple, orange, and pear boxes",
    quantityLabel: "36 boxes",
    packaging: "Stacked cardboard fruit boxes",
    preparedTime: "Today, 9:30 AM",
    pickupDeadline: "Today, 5:30 PM",
    storageEvidence: "Covered stall area, donor notes mixed ripeness",
    handlingPriority: "Needs confirmation",
    handlingNotes:
      "Confirm box count, visible bruising, and whether partial acceptance is preferred.",
    aiSummary:
      "FoodLoop found produce demand, but the recipient should confirm quality notes before accepting.",
    ngoFitExplanation:
      "This batch reached the queue because the NGO can sort produce and has afternoon volunteer capacity.",
    donorStatus:
      "Submitted for matching. FoodLoop is requesting confirmation details before final recipient acceptance.",
    routePreview: "Likely pickup route from Tai Kok Tsui to Sham Shui Po in 12-16 minutes.",
    selectedCandidateId: "sham-shui-po-fresh-box",
    candidates: [
      {
        id: "sham-shui-po-fresh-box",
        name: "Sham Shui Po Fresh Box",
        district: "Sham Shui Po",
        distanceKm: 1.7,
        demandLabel: "High produce demand",
        capacityLabel: "Volunteer sorting team ready",
        serviceWindow: "2:00 PM to 6:00 PM",
        score: 84,
        factors: {
          compatibility: 90,
          demand: 92,
          distance: 89,
          capacity: 86,
          urgencyFit: 73,
        },
        reason:
          "Nearby produce program with volunteers available to inspect and sort mixed boxes.",
        progressStatus: "Top recommendation",
      },
      {
        id: "olympic-neighbour-kitchen",
        name: "Olympic Neighbour Kitchen",
        district: "Olympic",
        distanceKm: 1.2,
        demandLabel: "Medium produce demand",
        capacityLabel: "18 box capacity",
        serviceWindow: "3:00 PM to 5:00 PM",
        score: 77,
        factors: {
          compatibility: 82,
          demand: 76,
          distance: 94,
          capacity: 58,
          urgencyFit: 76,
        },
        reason:
          "Very close, but capacity would require splitting the batch with another recipient.",
        progressStatus: "Partial capacity",
      },
      {
        id: "kowloon-west-share-table",
        name: "Kowloon West Share Table",
        district: "Jordan",
        distanceKm: 3.8,
        demandLabel: "Steady demand",
        capacityLabel: "40 box capacity",
        serviceWindow: "1:30 PM to 5:30 PM",
        score: 73,
        factors: {
          compatibility: 79,
          demand: 72,
          distance: 65,
          capacity: 88,
          urgencyFit: 74,
        },
        reason:
          "Can take the full quantity, but produce fit and travel distance are weaker.",
        progressStatus: "Available backup",
      },
    ],
    recipientProgress: [
      { label: "Submitted", status: "done" },
      { label: "Confirmation needed", status: "active" },
      { label: "Recipient review", status: "waiting" },
      { label: "Route pending", status: "waiting" },
    ],
  },
] satisfies MatchQueueBatch[]).map((batch): MatchQueueBatch => ({
  ...batch,
  aiSource: "fallback",
  ...getSkillMetadata("matching", ["handling-risk"]),
}));

export const photoScenarios: PhotoScenario[] = [
  {
    id: "bakery",
    title: "Wan Chai bakery surplus",
    cardTitle: "Bakery",
    batchPrefix: "WC",
    donorName: emptyDraft.donorName,
    location: emptyDraft.location,
    photoLabel: "Wan Chai bakery photo",
    fileMeta: "PNG, local asset",
    imageSrc: bakeryPhoto,
    imageAlt: "Sealed bakery surplus in green crates at a Wan Chai bakery counter",
    categoryHint: "Bakery surplus",
    emptyDraft,
    fallbackDraft: analyzedDraft,
    fallbackRecommendation: agentRecommendation,
    forecast: forecastSummary,
    sensorEvidence,
    templateBatchId: "FL-WC-0625-014",
  },
  {
    id: "sandwiches",
    title: "Causeway Bay chilled sandwiches",
    cardTitle: "Sandwiches",
    batchPrefix: "CB",
    donorName: sandwichEmptyDraft.donorName,
    location: sandwichEmptyDraft.location,
    photoLabel: "Causeway Bay cafe photo",
    fileMeta: "PNG, local asset",
    imageSrc: sandwichPhoto,
    imageAlt:
      "Individually wrapped sandwiches stacked in trays beside a chilled cafe display",
    categoryHint: "Chilled ready-to-eat",
    emptyDraft: sandwichEmptyDraft,
    fallbackDraft: sandwichDraft,
    fallbackRecommendation: sandwichRecommendation,
    forecast: sandwichForecast,
    sensorEvidence: sandwichSensorEvidence,
    templateBatchId: "FL-CT-0625-022",
  },
  {
    id: "fruit",
    title: "Tai Kok Tsui fruit boxes",
    cardTitle: "Fruit",
    batchPrefix: "TK",
    donorName: fruitEmptyDraft.donorName,
    location: fruitEmptyDraft.location,
    photoLabel: "Tai Kok Tsui market photo",
    fileMeta: "PNG, local asset",
    imageSrc: fruitPhoto,
    imageAlt: "Mixed apples, oranges, and pears stacked in cardboard fruit boxes",
    categoryHint: "Fresh produce",
    emptyDraft: fruitEmptyDraft,
    fallbackDraft: fruitDraft,
    fallbackRecommendation: fruitRecommendation,
    forecast: fruitForecast,
    sensorEvidence: fruitSensorEvidence,
    templateBatchId: "FL-TK-0625-031",
  },
];

export const getPhotoScenario = (scenarioId: ScenarioId) =>
  photoScenarios.find((scenario) => scenario.id === scenarioId) ??
  photoScenarios[0];

export const getTemplateBatchForScenario = (scenarioId: ScenarioId) => {
  const scenario = getPhotoScenario(scenarioId);

  return (
    matchQueueBatches.find((batch) => batch.id === scenario.templateBatchId) ??
    matchQueueBatches[0]
  );
};

export const getCandidatePoolForScenario = (scenarioId: ScenarioId) =>
  getTemplateBatchForScenario(scenarioId).candidates.map((candidate) => ({
    ...candidate,
    factors: { ...candidate.factors },
  }));

const queueDatetimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const formatQueueDeadline = (value: string) => {
  if (!queueDatetimeLocalPattern.test(value)) {
    return value;
  }

  const deadline = new Date(value);

  if (Number.isNaN(deadline.getTime())) {
    return value;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(deadline);
  const today = new Date();

  if (
    deadline.getFullYear() === today.getFullYear() &&
    deadline.getMonth() === today.getMonth() &&
    deadline.getDate() === today.getDate()
  ) {
    return `Today, ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(deadline);

  return `${dateLabel}, ${timeLabel}`;
};

export const buildFallbackMatchRankResponse = (
  scenarioId: ScenarioId,
  draft: BatchDraft,
): MatchRankAgentResponse => {
  const template = getTemplateBatchForScenario(scenarioId);
  const quantityLabel = draft.quantity
    ? `${draft.quantity} ${draft.unit}`
    : template.quantityLabel;

  return {
    candidates: getCandidatePoolForScenario(scenarioId),
    aiSummary: `FoodLoop ranked known recipient partners for ${quantityLabel} of ${
      draft.itemDescription || template.itemDescription
    }, using compatibility, demand, distance, capacity, and urgency fit.`,
    ngoFitExplanation:
      "Fallback demo data keeps the known demo candidate pool and explains fit without adding unverified recipient records.",
    handlingNotes:
      draft.handlingPriority === "Short window"
        ? "Pickup should be accepted by a nearby recipient with capacity inside the donor window."
        : draft.handlingPriority === "Needs confirmation"
          ? "Recipient should confirm count, handoff notes, and any quality observations before acceptance."
          : "Packaging and pickup timing look operationally straightforward, pending human confirmation.",
    routePreview: template.routePreview,
    source: "fallback",
    ...getSkillMetadata("matching", ["handling-risk"]),
  };
};

export function buildGeneratedBatchFromDraft({
  scenario,
  draft,
  matchResponse,
  sequence,
}: {
  scenario: PhotoScenario;
  draft: BatchDraft;
  matchResponse: MatchRankAgentResponse;
  sequence: number;
}): MatchQueueBatch {
  const template = getTemplateBatchForScenario(scenario.id);
  const candidates =
    matchResponse.candidates.length > 0
      ? matchResponse.candidates
      : getCandidatePoolForScenario(scenario.id);
  const selectedCandidate = candidates[0] ?? template.candidates[0];
  const quantityLabel = draft.quantity
    ? `${draft.quantity} ${draft.unit}`
    : template.quantityLabel;
  const pickupDeadline =
    formatQueueDeadline(draft.pickupDeadline) || template.pickupDeadline;
  const storageEvidence =
    [draft.storageLocation, draft.temperatureStatus, draft.holdingStatus]
      .filter(Boolean)
      .join(", ") || template.storageEvidence;
  const batchTitle = draft.category || scenario.categoryHint;

  return {
    id: `FL-${scenario.batchPrefix}-AI-${String(sequence).padStart(3, "0")}`,
    title: batchTitle,
    donorName: draft.donorName || scenario.donorName,
    donorLocation: draft.location || scenario.location,
    category: draft.category || scenario.categoryHint,
    itemDescription: draft.itemDescription || template.itemDescription,
    quantityLabel,
    packaging: draft.packaging || template.packaging,
    preparedTime: draft.preparedTime || template.preparedTime,
    pickupDeadline,
    storageEvidence,
    handlingPriority: draft.handlingPriority,
    handlingNotes: matchResponse.handlingNotes || template.handlingNotes,
    aiSummary: matchResponse.aiSummary || template.aiSummary,
    ngoFitExplanation:
      matchResponse.ngoFitExplanation || template.ngoFitExplanation,
    donorStatus:
      "Submitted from FoodLoop AI intake. FoodLoop ranked known recipient partners and is waiting for NGO action.",
    routePreview: matchResponse.routePreview || template.routePreview,
    selectedCandidateId: selectedCandidate.id,
    candidates,
    aiSource: matchResponse.source,
    aiModel: matchResponse.model,
    modelOutput: matchResponse.modelOutput,
    skillId: matchResponse.skillId,
    skillName: matchResponse.skillName,
    skillVersion: matchResponse.skillVersion,
    guarded: matchResponse.guarded,
    supportingSkills: matchResponse.supportingSkills,
    scenarioId: scenario.id,
    recipientProgress: [
      { label: "Submitted", status: "done" },
      { label: "Ranked", status: "active" },
      { label: "Recipient review", status: "waiting" },
      { label: "Route pending", status: "waiting" },
    ],
  };
}

export const sharedRoutePlan: SharedRoutePlan = {
  id: "ROUTE-WC-014",
  batchId: "FL-WC-0625-014",
  title: "Accepted bakery surplus route",
  donorName: "Sunrise Bakery",
  ngoName: "Harbour Care Kitchen",
  quantityLabel: "118 items",
  itemDescription: "Assorted buns, rolls, croissants",
  routeDistanceLabel: "1.4 km",
  etaLabel: "16 min",
  pickupWindow: "12:20 PM to 12:45 PM",
  slaStatus: "On track",
  driverName: "Kai Wong",
  volunteerName: "Maya Lau",
  routeNote:
    "Short Wan Chai to Central handoff with pickup before the donor deadline.",
  routeGeometry: {
    type: "LineString",
    coordinates: [
      [114.1712, 22.2765],
      [114.1698, 22.2773],
      [114.168, 22.2782],
      [114.1652, 22.2796],
      [114.1623, 22.2808],
      [114.1599, 22.2816],
      [114.1584, 22.2819],
    ],
  },
  stops: [
    {
      id: "pickup",
      kind: "pickup",
      label: "Pickup",
      name: "Sunrise Bakery",
      address: "Queen's Road East, Wan Chai",
      coordinates: [114.1712, 22.2765],
      window: "12:20 PM to 12:45 PM",
      contact: "Mr. Chan, bakery counter",
      note: "Collect from the side entrance. Batch is sealed and ready.",
    },
    {
      id: "dropoff",
      kind: "dropoff",
      label: "Drop-off",
      name: "Harbour Care Kitchen",
      address: "Central and Sheung Wan",
      coordinates: [114.1584, 22.2819],
      window: "12:55 PM to 1:15 PM",
      contact: "Maya Lau, kitchen lead",
      note: "Recipient has capacity for the full bakery batch today.",
    },
  ],
  timeline: [
    {
      id: "submitted",
      label: "Submitted",
      time: "10:31 AM",
      note: "Donor confirmed the batch record.",
      status: "done",
    },
    {
      id: "matched",
      label: "Matched",
      time: "10:38 AM",
      note: "Harbour Care Kitchen ranked as the top fit.",
      status: "done",
    },
    {
      id: "accepted",
      label: "Accepted",
      time: "10:42 AM",
      note: "Recipient accepted the batch.",
      status: "done",
    },
    {
      id: "pickup-scheduled",
      label: "Pickup scheduled",
      time: "12:20 PM",
      note: "Driver assigned and route shared.",
      status: "active",
    },
    {
      id: "received",
      label: "Received",
      time: "Pending",
      note: "NGO confirms after drop-off.",
      status: "waiting",
    },
  ],
  agent: {
    agentName: "Route Agent",
    confidence: 88,
    etaLabel: "16 min",
    pickupWindow: "12:20 PM to 12:45 PM",
    statusLabel: "Window on track",
    summary:
      "The route keeps travel short, fits the recipient service window, and leaves donor-side buffer before the deadline.",
    reasons: [
      "Nearest accepted NGO with open bakery capacity.",
      "Pickup window avoids the lunch traffic peak.",
      "Receipt confirmation stays with the NGO volunteer.",
    ],
  },
};

const donorCoordinates: Record<string, RouteCoordinate> = {
  "Sunrise Bakery": [114.1712, 22.2765],
  "Cedar Table Cafe": [114.1858, 22.2799],
  "Tai Kok Tsui Market Stall 18": [114.162, 22.3192],
};

const candidateCoordinates: Record<string, RouteCoordinate> = {
  "harbour-care-kitchen": [114.1584, 22.2819],
  "wan-chai-community-pantry": [114.1749, 22.2774],
  "north-point-meal-circle": [114.2018, 22.2913],
  "tin-hau-supper-room": [114.191, 22.2822],
  "causeway-neighbour-table": [114.1837, 22.2807],
  "eastern-harbour-lunch-club": [114.2157, 22.2854],
  "sham-shui-po-fresh-box": [114.1595, 22.3305],
  "olympic-neighbour-kitchen": [114.1613, 22.3178],
  "kowloon-west-share-table": [114.1695, 22.3046],
};

const fallbackPickupCoordinate: RouteCoordinate = [114.1694, 22.3193];
const fallbackDropoffCoordinate: RouteCoordinate = [114.1623, 22.2808];

const interpolateRoute = (
  pickup: RouteCoordinate,
  dropoff: RouteCoordinate,
): RouteCoordinate[] => {
  const [pickupLng, pickupLat] = pickup;
  const [dropoffLng, dropoffLat] = dropoff;
  const midpoint: RouteCoordinate = [
    Number(((pickupLng + dropoffLng) / 2 + 0.0012).toFixed(4)),
    Number(((pickupLat + dropoffLat) / 2 - 0.0008).toFixed(4)),
  ];

  return [pickup, midpoint, dropoff];
};

const getRouteEtaMinutes = (candidate: NGOCandidate) =>
  Math.max(10, Math.round(candidate.distanceKm * 7 + 6));

const getPickupStart = (deadline: string) => {
  const timeMatch = deadline.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!timeMatch) {
    return "Next available";
  }

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const totalMinutes = Math.max(0, hours * 60 + minutes - 85);
  const displayHours24 = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;
  const displayMeridiem = displayHours24 >= 12 ? "PM" : "AM";
  const displayHours12 = displayHours24 % 12 || 12;

  return `${displayHours12}:${String(displayMinutes).padStart(2, "0")} ${displayMeridiem}`;
};

export function buildRoutePlanFromMatch(
  batch: MatchQueueBatch,
  candidate: NGOCandidate,
): SharedRoutePlan {
  if (
    batch.id === sharedRoutePlan.batchId &&
    candidate.id === "harbour-care-kitchen"
  ) {
    return {
      ...sharedRoutePlan,
      donorName: batch.donorName,
      ngoName: candidate.name,
      quantityLabel: batch.quantityLabel,
      itemDescription: batch.itemDescription,
      routeDistanceLabel: `${candidate.distanceKm.toFixed(1)} km`,
    };
  }

  const pickupCoordinate = donorCoordinates[batch.donorName] ?? fallbackPickupCoordinate;
  const dropoffCoordinate =
    candidateCoordinates[candidate.id] ?? fallbackDropoffCoordinate;
  const etaMinutes = getRouteEtaMinutes(candidate);
  const pickupStart = getPickupStart(batch.pickupDeadline);
  const pickupWindow =
    pickupStart === "Next available"
      ? candidate.serviceWindow
      : `${pickupStart} to ${batch.pickupDeadline.replace(/^Today,\s*/, "")}`;
  const statusLabel =
    batch.handlingPriority === "Short window" ? "Tight window" : "Window on track";

  return {
    id: `ROUTE-${batch.id}`,
    batchId: batch.id,
    title: `Accepted ${batch.title.toLowerCase()} route`,
    donorName: batch.donorName,
    ngoName: candidate.name,
    quantityLabel: batch.quantityLabel,
    itemDescription: batch.itemDescription,
    routeDistanceLabel: `${candidate.distanceKm.toFixed(1)} km`,
    etaLabel: `${etaMinutes} min`,
    pickupWindow,
    slaStatus: statusLabel,
    driverName: "FoodLoop Dispatch",
    volunteerName: candidate.name,
    routeNote: `${batch.donorLocation} handoff to ${candidate.district}, matched against ${candidate.capacityLabel.toLowerCase()}.`,
    routeGeometry: {
      type: "LineString",
      coordinates: interpolateRoute(pickupCoordinate, dropoffCoordinate),
    },
    stops: [
      {
        id: "pickup",
        kind: "pickup",
        label: "Pickup",
        name: batch.donorName,
        address: batch.donorLocation,
        coordinates: pickupCoordinate,
        window: pickupWindow,
        contact: "Donor pickup contact",
        note: `${batch.storageEvidence}. ${batch.packaging}.`,
      },
      {
        id: "dropoff",
        kind: "dropoff",
        label: "Drop-off",
        name: candidate.name,
        address: candidate.district,
        coordinates: dropoffCoordinate,
        window: candidate.serviceWindow,
        contact: "NGO receiving lead",
        note: candidate.reason,
      },
    ],
    timeline: [
      {
        id: "submitted",
        label: "Submitted",
        time: batch.preparedTime,
        note: `${batch.donorName} submitted ${batch.quantityLabel} of ${batch.itemDescription}.`,
        status: "done",
      },
      {
        id: "matched",
        label: "Matched",
        time: "FoodLoop AI ranked",
        note: `${candidate.name} selected as the recommended NGO at ${candidate.score}% fit.`,
        status: "done",
      },
      {
        id: "accepted",
        label: "Accepted",
        time: "Now",
        note: `${candidate.name} accepted the batch for routing.`,
        status: "done",
      },
      {
        id: "pickup-scheduled",
        label: "Pickup scheduled",
        time: pickupStart,
        note: `Dispatch route generated before the ${batch.pickupDeadline} donor deadline.`,
        status: "active",
      },
      {
        id: "received",
        label: "Received",
        time: "Pending",
        note: `${candidate.name} confirms after drop-off.`,
        status: "waiting",
      },
    ],
    agent: {
      agentName: "Route Agent",
      confidence: Math.min(95, Math.max(72, candidate.score - 4)),
      etaLabel: `${etaMinutes} min`,
      pickupWindow,
      statusLabel,
      summary: `The route connects ${batch.donorName} to ${candidate.name}, keeping the accepted match aligned with distance, capacity, and the donor pickup deadline.`,
      reasons: [
        `${candidate.distanceKm.toFixed(1)} km route from ${batch.donorLocation} to ${candidate.district}.`,
        `${candidate.capacityLabel} covers ${batch.quantityLabel}.`,
        `${candidate.demandLabel} and ${candidate.serviceWindow} fit the batch window.`,
      ],
    },
  };
}

export const fallbackAIModalCopy: Record<
  AIModalAction,
  Omit<AIModalResponse, "source" | "model">
> = {
  "request-info": {
    title: "Information request draft",
    intro:
      "Fallback demo data prepared this copy because a FoodLoop AI recommendation is unavailable.",
    message:
      "Please confirm the final count, pickup contact, holding location, and any packaging notes before the recipient accepts this batch.",
    nextSteps: [
      "Send the request to the donor contact.",
      "Keep the recipient place in queue while waiting.",
      "Refresh the match recommendation after the donor replies.",
    ],
    confidenceNote:
      "No usable FoodLoop AI recommendation was returned for this action.",
  },
  decline: {
    title: "Decline and reroute note",
    intro:
      "Fallback demo data prepared this copy because a FoodLoop AI recommendation is unavailable.",
    message:
      "Thank you for reviewing this opportunity. We cannot accept the current batch window, so FoodLoop should offer it to the next matched recipient.",
    nextSteps: [
      "Record the decline reason for matching transparency.",
      "Keep the batch visible to backup recipients.",
      "Notify the donor only after a new recipient is selected.",
    ],
    confidenceNote:
      "No usable FoodLoop AI recommendation was returned for this action.",
  },
};

export const stubContent: Record<
  Exclude<DemoPageId, "intake">,
  {
    title: string;
    summary: string;
    cards: Array<{ label: string; value: string; note: string }>;
  }
> = {
  matching: {
    title: "NGO Match Queue",
    summary:
      "This stub will become the ranked NGO opportunity queue with explainable match scoring.",
    cards: [
      {
        label: "FoodLoop Matching AI",
        value: "Ranks by demand, distance, capacity, and compatibility",
        note: "NGO confirms before accepting a batch.",
      },
      {
        label: "Handling priority",
        value: "Low handling risk, Short window, Needs confirmation",
        note: "Labels describe review state and time pressure.",
      },
      {
        label: "Recipient actions",
        value: "Accept Batch, Request More Info, Decline",
        note: "Actions will update shared route status.",
      },
    ],
  },
  route: {
    title: "Shared Route",
    summary:
      "This stub will show the shared pairing, pickup window, and route timeline for donor and NGO.",
    cards: [
      {
        label: "Route Agent",
        value: "ETA and pickup window",
        note: "Blue logistics state leads this screen.",
      },
      {
        label: "Shared status",
        value: "Submitted, matched, accepted, scheduled, received",
        note: "Both sides see the same operational record.",
      },
      {
        label: "Counterpart preview",
        value: "Role-aware confirmation state",
        note: "Donor and NGO views stay linked.",
      },
    ],
  },
  impact: {
    title: "Shared Impact",
    summary:
      "This stub will turn completed pickups into ESG and community impact reporting.",
    cards: [
      {
        label: "Food rescued",
        value: "kg, meals, and CO2e avoided",
        note: "Green metrics show FoodLoop impact.",
      },
      {
        label: "FoodLoop Impact AI",
        value: "Report-ready summary draft",
        note: "Human review remains part of reporting.",
      },
      {
        label: "Trends",
        value: "Weekly rescue, pickup success, time saved",
        note: "Charts will stay compact for pitch screenshots.",
      },
    ],
  },
  architecture: {
    title: "Architecture And FoodLoop AI",
    summary:
      "This stub will explain the full demo system from donor intake through impact reporting.",
    cards: [
      {
        label: "Agent flow",
        value: "Intake, Forecast, Matching, Route, Impact",
        note: "Each agent recommends; humans confirm key decisions.",
      },
      {
        label: "Rules layer",
        value: "Review, handling, and evidence checks",
        note: "The system avoids verdict wording.",
      },
      {
        label: "MVP boundary",
        value: "Mock data, transparent scoring, no backend",
        note: "Future work can add accounts, sensors, routing, and audit logs.",
      },
    ],
  },
};

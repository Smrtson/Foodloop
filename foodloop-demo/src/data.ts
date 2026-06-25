import type {
  AgentRecommendation,
  BatchDraft,
  DemoPageId,
  ForecastSummary,
  SensorEvidence,
} from "./types";

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
    status: "Develop later",
  },
  {
    id: "route",
    label: "Shared Route",
    path: "/route",
    status: "Develop later",
  },
  {
    id: "impact",
    label: "Shared Impact",
    path: "/impact",
    status: "Develop later",
  },
  {
    id: "architecture",
    label: "Architecture",
    path: "/architecture",
    status: "Develop later",
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
  pickupDeadline: "Today, 2:45 PM",
  storageLocation: "Front prep counter, Wan Chai",
  temperatureStatus: "Ambient, 24.1 C",
  holdingStatus: "Sealed packaging, no open handling observed",
  sensorAttachment: "Tag FL-WC-17 attached",
  handlingPriority: "Low handling risk",
  donorNotes:
    "Please collect from the side entrance. Donor confirms the record before matching.",
};

export const agentRecommendation: AgentRecommendation = {
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
    "AI drafted a structured batch from the photo and Wan Chai donor pattern. It is decision support only.",
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
        label: "AI Matching Agent",
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
        label: "Impact Agent",
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
    title: "Architecture And AI Agents",
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

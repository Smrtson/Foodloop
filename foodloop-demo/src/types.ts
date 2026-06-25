export type Role = "donor" | "ngo";

export type DemoPageId =
  | "intake"
  | "matching"
  | "route"
  | "impact"
  | "architecture";

export type IntakeStatus = "idle" | "drafted" | "submitted";

export interface BatchDraft {
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
  handlingPriority: "Low handling risk" | "Needs confirmation" | "Short window";
  donorNotes: string;
}

export interface AgentRecommendation {
  agentName: string;
  confidence: number;
  extractedCategory: string;
  extractedQuantity: string;
  extractedPackaging: string;
  preparedTime: string;
  pickupDeadline: string;
  requiredConfirmation: string;
  handlingPriority: BatchDraft["handlingPriority"];
  summary: string;
}

export interface ForecastSummary {
  predictedBand: string;
  likelyWindow: string;
  patternBasis: string;
  confidence: number;
}

export interface SensorEvidence {
  storageLocation: string;
  temperature: string;
  holdingStatus: string;
  sensorAttachment: string;
  lastReadingAt: string;
}

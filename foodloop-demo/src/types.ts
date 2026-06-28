export type Role = "donor" | "ngo";

export type DemoPageId =
  | "intake"
  | "matching"
  | "route"
  | "impact"
  | "architecture";

export type IntakeStatus = "idle" | "analyzing" | "drafted" | "submitted";

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

export type MatchFactorKey =
  | "compatibility"
  | "demand"
  | "distance"
  | "capacity"
  | "urgencyFit";

export interface MatchFactors {
  compatibility: number;
  demand: number;
  distance: number;
  capacity: number;
  urgencyFit: number;
}

export interface NGOCandidate {
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

export interface MatchQueueBatch {
  id: string;
  title: string;
  donorName: string;
  donorLocation: string;
  category: string;
  itemDescription: string;
  quantityLabel: string;
  packaging: string;
  preparedTime: string;
  pickupDeadline: string;
  storageEvidence: string;
  handlingPriority: BatchDraft["handlingPriority"];
  handlingNotes: string;
  aiSummary: string;
  ngoFitExplanation: string;
  donorStatus: string;
  routePreview: string;
  selectedCandidateId: string;
  candidates: NGOCandidate[];
  recipientProgress: Array<{
    label: string;
    status: "done" | "active" | "waiting";
  }>;
}

export interface AcceptedRouteMatch {
  batch: MatchQueueBatch;
  candidate: NGOCandidate;
}

export type MatchAction = "accept" | "request-info" | "decline";

export type MatchActionState =
  | "idle"
  | "accepted"
  | "info-requested"
  | "declined";

export type AIModalAction = Extract<MatchAction, "request-info" | "decline">;

export interface AIModalRequest {
  action: AIModalAction;
  role: Role;
  batchId: string;
  batchTitle: string;
  candidateName: string;
  handlingPriority: BatchDraft["handlingPriority"];
  context: string[];
}

export interface AIModalResponse {
  title: string;
  intro: string;
  message: string;
  nextSteps: string[];
  confidenceNote: string;
  source: "openrouter" | "fallback";
  model?: string;
}

export type RouteStopKind = "pickup" | "dropoff";

export type RouteCoordinate = [longitude: number, latitude: number];

export interface RouteLineGeometry {
  type: "LineString";
  coordinates: RouteCoordinate[];
}

export interface RouteStop {
  id: string;
  kind: RouteStopKind;
  label: string;
  name: string;
  address: string;
  coordinates: RouteCoordinate;
  window: string;
  contact: string;
  note: string;
}

export interface RouteTimelineStep {
  id: string;
  label: string;
  time: string;
  note: string;
  status: "done" | "active" | "waiting";
}

export interface RouteAgentRecommendation {
  agentName: string;
  confidence: number;
  etaLabel: string;
  pickupWindow: string;
  statusLabel: string;
  summary: string;
  reasons: string[];
}

export interface SharedRoutePlan {
  id: string;
  batchId: string;
  title: string;
  donorName: string;
  ngoName: string;
  quantityLabel: string;
  itemDescription: string;
  routeDistanceLabel: string;
  etaLabel: string;
  pickupWindow: string;
  slaStatus: string;
  driverName: string;
  volunteerName: string;
  routeNote: string;
  routeGeometry: RouteLineGeometry;
  stops: RouteStop[];
  timeline: RouteTimelineStep[];
  agent: RouteAgentRecommendation;
}

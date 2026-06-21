export type ScreenId = "intake" | "matching" | "dispatch" | "impact" | "architecture";

export type FoodCategory = "Bakery" | "Prepared meals" | "Produce" | "Chilled dairy";

export type RiskLabel = "Low" | "Medium" | "High";

export type RiskReasonSeverity = "positive" | "caution" | "critical";

export interface BatchLocation {
  district: string;
  address: string;
  mapX: number;
  mapY: number;
}

export interface FoodBatch {
  id: string;
  donorName: string;
  donorType: string;
  contactName: string;
  contactPhone: string;
  category: FoodCategory;
  items: string[];
  quantityKg: number;
  servings: number;
  packaging: "Sealed trays" | "Mixed trays" | "Loose crates";
  storage: "Ambient" | "Chilled" | "Frozen";
  temperatureC: number;
  preparedHoursAgo: number;
  consumeWithinHours: number;
  allergens: string[];
  location: BatchLocation;
  photoConfidence: number;
  donorNotes: string;
}

export interface RiskReason {
  title: string;
  detail: string;
  severity: RiskReasonSeverity;
}

export interface RiskResult {
  score: number;
  label: RiskLabel;
  decision: "Ready for matching" | "Needs review" | "Hold for manual review";
  recommendation: string;
  reasons: RiskReason[];
}

export interface ScoreBreakdown {
  categoryFit: number;
  capacityFit: number;
  responseFit: number;
  routeFit: number;
  riskFit: number;
}

export interface NgoCandidate {
  id: string;
  name: string;
  district: string;
  focus: string;
  contactName: string;
  accepts: FoodCategory[];
  capacityKg: number;
  coldChain: boolean;
  responseMinutes: number;
  routeMinutesFromDonor: number;
  openWindow: string;
  reliability: number;
  activeClients: number;
  vehicleStatus: string;
  score?: number;
  scoreBreakdown?: ScoreBreakdown;
  matchNotes?: string[];
}

export interface RouteStop {
  label: string;
  address: string;
  district: string;
  mapX: number;
  mapY: number;
  time: string;
}

export interface RoutePlan {
  id: string;
  etaMinutes: number;
  distanceKm: number;
  pickupWindow: string;
  slaStatus: "On track" | "At risk" | "Late";
  driverName: string;
  vehicle: string;
  stops: RouteStop[];
  optimizationNotes: string[];
  updatedAt: string;
}

export interface ImpactMetrics {
  mealsRescued: number;
  kgDiverted: number;
  co2eAvoidedKg: number;
  ngoFulfillmentRate: number;
  averageMatchMinutes: number;
  donorRepeatRate: number;
  weeklyTrend: Array<{ day: string; meals: number; kg: number }>;
  categoryBreakdown: Array<{ label: string; value: number; status: string }>;
}

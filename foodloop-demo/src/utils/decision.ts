import type { FoodBatch, NgoCandidate, RiskResult, RoutePlan, ScoreBreakdown } from "../types";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function calculateRiskScore(batch: FoodBatch): RiskResult {
  let score = 18;
  const reasons: RiskResult["reasons"] = [];

  if (batch.consumeWithinHours <= 8) {
    score += 22;
    reasons.push({
      title: "Short consumption window",
      detail: "The batch should be distributed quickly because the best-before window is under 8 hours.",
      severity: "critical",
    });
  } else if (batch.consumeWithinHours <= 12) {
    score += 13;
    reasons.push({
      title: "Same-day distribution needed",
      detail: "The batch is suitable for rescue, with matching prioritized for nearby NGOs.",
      severity: "caution",
    });
  } else {
    reasons.push({
      title: "Comfortable service window",
      detail: "The available window gives dispatchers enough time to consolidate pickup.",
      severity: "positive",
    });
  }

  if (batch.storage === "Ambient" && batch.temperatureC >= 20) {
    score += 9;
    reasons.push({
      title: "Ambient storage",
      detail: "Room-temperature storage is acceptable for bakery items but should not be delayed.",
      severity: "caution",
    });
  }

  if (batch.packaging === "Sealed trays") {
    score -= 8;
    reasons.push({
      title: "Sealed packaging",
      detail: "Trays appear protected for transport and handoff, reducing handling risk.",
      severity: "positive",
    });
  } else {
    score += 8;
    reasons.push({
      title: "Packaging needs attention",
      detail: "Dispatch should confirm containers are sealed before pickup.",
      severity: "caution",
    });
  }

  if (batch.photoConfidence >= 0.9) {
    score -= 5;
    reasons.push({
      title: "Photo evidence is clear",
      detail: "The mock vision step can identify product type and tray condition with high confidence.",
      severity: "positive",
    });
  }

  if (batch.allergens.length >= 3) {
    score += 5;
    reasons.push({
      title: "Allergen labeling required",
      detail: "Gluten, dairy, and egg tags should travel with the donation record.",
      severity: "caution",
    });
  }

  const normalizedScore = Math.round(clamp(score, 0, 100));
  const label = normalizedScore >= 68 ? "High" : normalizedScore >= 35 ? "Medium" : "Low";
  const decision =
    label === "High" ? "Hold for manual review" : label === "Medium" ? "Needs review" : "Ready for matching";

  return {
    score: normalizedScore,
    label,
    decision,
    recommendation:
      label === "High"
        ? "Escalate to a human coordinator before matching."
        : "Use AI decision support to shortlist nearby NGOs, then confirm dispatch details.",
    reasons,
  };
}

export function rankNgoMatches(batch: FoodBatch, ngos: NgoCandidate[], risk: RiskResult): NgoCandidate[] {
  return ngos
    .map((ngo) => {
      const categoryFit = ngo.accepts.includes(batch.category) ? 30 : 0;
      const capacityFit = clamp((ngo.capacityKg / batch.quantityKg) * 20, 0, 20);
      const responseFit = clamp(20 - ngo.responseMinutes * 0.7, 0, 20);
      const routeFit = clamp(20 - ngo.routeMinutesFromDonor * 0.45, 0, 20);
      const riskFit = risk.label === "High" ? (ngo.coldChain ? 10 : 3) : ngo.coldChain ? 8 : 6;
      const scoreBreakdown: ScoreBreakdown = {
        categoryFit: Math.round(categoryFit),
        capacityFit: Math.round(capacityFit),
        responseFit: Math.round(responseFit),
        routeFit: Math.round(routeFit),
        riskFit: Math.round(riskFit),
      };
      const score = Math.round(
        categoryFit + capacityFit + responseFit + routeFit + riskFit + ngo.reliability * 10,
      );

      const matchNotes = [
        `${ngo.routeMinutesFromDonor} min donor-to-NGO route`,
        `${ngo.capacityKg} kg available intake capacity`,
        ngo.coldChain ? "Cold chain available if required" : "Ambient handoff only",
      ];

      return {
        ...ngo,
        score,
        scoreBreakdown,
        matchNotes,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function buildRoutePlan(batch: FoodBatch, selectedNgo: NgoCandidate): RoutePlan {
  const etaMinutes = selectedNgo.routeMinutesFromDonor + 8;
  const slaStatus = etaMinutes <= 24 ? "On track" : etaMinutes <= 36 ? "At risk" : "Late";

  return {
    id: `route-${batch.id}-${selectedNgo.id}`,
    etaMinutes,
    distanceKm: Number((selectedNgo.routeMinutesFromDonor * 0.42).toFixed(1)),
    pickupWindow: "11:35-12:05",
    slaStatus,
    driverName: "Ricky Chan",
    vehicle: selectedNgo.coldChain ? "EV van with chilled crate" : "EV van",
    updatedAt: "11:18 HKT",
    stops: [
      {
        label: "Pickup",
        address: batch.location.address,
        district: batch.location.district,
        mapX: batch.location.mapX,
        mapY: batch.location.mapY,
        time: "11:42",
      },
      {
        label: "Drop-off",
        address: `${selectedNgo.name}, ${selectedNgo.district}`,
        district: selectedNgo.district,
        mapX: selectedNgo.id === "ngo-st-james" ? 57 : selectedNgo.id === "ngo-north-harbour" ? 72 : 68,
        mapY: selectedNgo.id === "ngo-st-james" ? 38 : selectedNgo.id === "ngo-north-harbour" ? 44 : 64,
        time: "11:58",
      },
    ],
    optimizationNotes: [
      "Prioritize the closest open intake window.",
      "Keep bakery batch separate from chilled dairy route.",
      "Attach allergen labels to driver handoff checklist.",
    ],
  };
}

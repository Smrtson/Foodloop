import {
  bannedSafetyLanguage,
  preferredSafetyLanguage,
} from "./guards";
import type {
  AISkillDefinition,
  AISkillMetadata,
  AISkillResponseMetadata,
  SkillId,
} from "./skillTypes";

const skillVersion = "v1.0-competition";

const formatJsonTask = (skillId: SkillId, task: string, context: unknown) =>
  JSON.stringify(
    {
      skillId,
      task,
      input: context,
    },
    null,
    2,
  );

const sharedDecisionSupportRules = `FoodLoop AI is decision support for a food rescue demo. Humans confirm donor records, recipient acceptance, route execution, and impact language. Never claim certification, approval for consumption, or a final food-safety verdict. Avoid these words and phrases as conclusions: ${bannedSafetyLanguage.join(", ")}. Prefer operational language such as: ${preferredSafetyLanguage.join(", ")}. Return only valid JSON.`;

const intakeExamples = [
  {
    title: "Bakery photo becomes donor-editable draft",
    input:
      '{"scenario":{"donorName":"Sunrise Bakery","location":"Queen\'s Road East, Wan Chai","categoryHint":"Bakery surplus","fallbackDraft":{"quantity":"118","unit":"items","packaging":"Clamshell boxes and paper sleeves"}}}',
    output:
      '{"draft":{"donorName":"Sunrise Bakery","location":"Queen\'s Road East, Wan Chai","category":"Bakery surplus","itemDescription":"Assorted buns, rolls, croissants","quantity":"118","unit":"items","packaging":"Clamshell boxes and paper sleeves","preparedTime":"Today, 10:20 AM","pickupDeadline":"Today, 2:45 PM","storageLocation":"Front prep counter, Wan Chai","temperatureStatus":"Ambient, 24.1 C","holdingStatus":"Sealed packaging, no open handling observed","sensorAttachment":"Tag FL-WC-17 attached","handlingPriority":"Low handling risk","donorNotes":"Please collect from the side entrance. Donor confirms the record before matching."},"recommendation":{"agentName":"FoodLoop Intake AI","confidence":86,"extractedCategory":"Bakery surplus","extractedQuantity":"118 items","extractedPackaging":"Boxes and paper sleeves","preparedTime":"Today, 10:20 AM","pickupDeadline":"Today, 2:45 PM","requiredConfirmation":"Donor confirms category, quantity, and pickup window.","handlingPriority":"Low handling risk","summary":"Drafted a structured donor record from the selected photo and donor pattern."},"forecast":{"predictedBand":"100 to 130 bakery items","likelyWindow":"Late morning surplus peak","patternBasis":"Typical donor output for this scenario","confidence":78},"sensorEvidence":{"storageLocation":"Front prep counter, Wan Chai","temperature":"24.1 C ambient","holdingStatus":"Holding stable","sensorAttachment":"Tag FL-WC-17","lastReadingAt":"10:24 AM"}}',
  },
  {
    title: "Produce photo keeps confirmation language",
    input:
      '{"scenario":{"donorName":"Tai Kok Tsui Market Stall 18","categoryHint":"Fresh produce","fallbackDraft":{"quantity":"36","unit":"boxes","holdingStatus":"Covered boxes with mixed ripeness noted"}}}',
    output:
      '{"draft":{"donorName":"Tai Kok Tsui Market Stall 18","location":"Fuk Tsun Street, Tai Kok Tsui","category":"Fresh produce","itemDescription":"Mixed apple, orange, and pear boxes","quantity":"36","unit":"boxes","packaging":"Stacked cardboard fruit boxes","preparedTime":"Today, 9:30 AM","pickupDeadline":"Today, 5:30 PM","storageLocation":"Covered stall area, Tai Kok Tsui","temperatureStatus":"Ambient, shaded stall","holdingStatus":"Covered boxes with mixed ripeness noted","sensorAttachment":"Photo evidence attached","handlingPriority":"Needs confirmation","donorNotes":"Please confirm visible bruising and whether partial acceptance is useful for sorting."},"recommendation":{"agentName":"FoodLoop Intake AI","confidence":81,"extractedCategory":"Fresh produce","extractedQuantity":"36 boxes","extractedPackaging":"Stacked cardboard boxes","preparedTime":"Today, 9:30 AM","pickupDeadline":"Today, 5:30 PM","requiredConfirmation":"Donor confirms box count, ripeness notes, and sorting expectations.","handlingPriority":"Needs confirmation","summary":"Drafted a produce batch and kept quality notes for human review."},"forecast":{"predictedBand":"30 to 40 fruit boxes","likelyWindow":"Late morning market stall surplus","patternBasis":"Typical produce handoff pattern for Tai Kok Tsui donors","confidence":72},"sensorEvidence":{"storageLocation":"Covered stall area, Tai Kok Tsui","temperature":"Ambient, shaded","holdingStatus":"Covered and ready for sorting","sensorAttachment":"Photo evidence only","lastReadingAt":"9:34 AM"}}',
  },
];

const handlingExamples = [
  {
    title: "Closed bakery packaging",
    input:
      '{"draft":{"category":"Bakery surplus","temperatureStatus":"Ambient, 24.1 C","holdingStatus":"Sealed packaging, no open handling observed","pickupDeadline":"Today, 2:45 PM"}}',
    output:
      '{"handlingPriority":"Low handling risk","requiredConfirmation":"Donor confirms category, quantity, and pickup window.","handlingNotes":"Packaging is closed and the pickup window leaves time for nearby distribution."}',
  },
  {
    title: "Chilled short pickup window",
    input:
      '{"draft":{"category":"Chilled ready-to-eat","temperatureStatus":"Chilled, 4.7 C","holdingStatus":"Sealed packs, staff confirms chilled cabinet holding","pickupDeadline":"Today, 1:20 PM"}}',
    output:
      '{"handlingPriority":"Short window","requiredConfirmation":"Donor confirms count, chilled holding, and pickup contact before matching.","handlingNotes":"Use a nearby recipient with capacity inside the donor pickup window."}',
  },
];

const forecastExamples = [
  {
    title: "Bakery forecast",
    input:
      '{"scenario":{"title":"Wan Chai bakery surplus","forecast":{"predictedBand":"100 to 130 bakery items","likelyWindow":"Late morning surplus peak","patternBasis":"Typical Thursday output for Wan Chai bakery donors","confidence":78}}}',
    output:
      '{"predictedBand":"100 to 130 bakery items","likelyWindow":"Late morning surplus peak","patternBasis":"Typical Thursday output for Wan Chai bakery donors","confidence":78}',
  },
  {
    title: "Sandwich forecast",
    input:
      '{"scenario":{"title":"Causeway Bay chilled sandwiches","forecast":{"predictedBand":"55 to 70 sandwich packs","likelyWindow":"Breakfast-to-lunch surplus peak","patternBasis":"Typical weekday cafe batch from Causeway Bay donors","confidence":74}}}',
    output:
      '{"predictedBand":"55 to 70 sandwich packs","likelyWindow":"Breakfast-to-lunch surplus peak","patternBasis":"Typical weekday cafe batch from Causeway Bay donors","confidence":74}',
  },
];

const matchingExamples = [
  {
    title: "Known candidates only",
    input:
      '{"batchDraft":{"category":"Bakery surplus","quantity":"118","unit":"items","pickupDeadline":"Today, 2:45 PM","handlingPriority":"Low handling risk"},"allowedCandidateIds":["harbour-care-kitchen","wan-chai-community-pantry","north-point-meal-circle"]}',
    output:
      '{"candidates":[{"id":"harbour-care-kitchen","score":92,"factors":{"compatibility":96,"demand":91,"distance":94,"capacity":88,"urgencyFit":86},"reason":"Accepts bakery items, has a lunch pantry run today, and can collect before the donor deadline.","progressStatus":"Top recommendation"},{"id":"wan-chai-community-pantry","score":86,"factors":{"compatibility":93,"demand":83,"distance":88,"capacity":78,"urgencyFit":84},"reason":"Strong food fit and nearby collection, but lower remaining capacity than the top recipient.","progressStatus":"Available backup"}],"aiSummary":"Ranked known recipient partners for 118 items of bakery surplus.","ngoFitExplanation":"Bakery items match pantry demand, distance is short, and capacity is already open.","handlingNotes":"Packaging and pickup timing look operationally straightforward, pending human confirmation.","routePreview":"Likely pickup route will be generated after the recipient accepts the batch."}',
  },
  {
    title: "Short-window chilled batch",
    input:
      '{"batchDraft":{"category":"Chilled ready-to-eat","quantity":"64","unit":"packs","pickupDeadline":"Today, 1:20 PM","handlingPriority":"Short window"},"allowedCandidateIds":["tin-hau-supper-room","causeway-neighbour-table","eastern-harbour-lunch-club"]}',
    output:
      '{"candidates":[{"id":"tin-hau-supper-room","score":89,"factors":{"compatibility":91,"demand":94,"distance":96,"capacity":86,"urgencyFit":91},"reason":"Closest chilled-capable recipient with meal service inside the donor pickup window.","progressStatus":"Top recommendation"}],"aiSummary":"Prioritized cold-capable nearby recipients for a short-window batch.","ngoFitExplanation":"The top recipient has immediate meal demand and enough cold-bag capacity.","handlingNotes":"Pickup should be accepted by a nearby recipient with capacity inside the donor window.","routePreview":"Likely pickup route will be generated after acceptance."}',
  },
];

const communicationExamples = [
  {
    title: "Request more information",
    input:
      '{"action":"request-info","candidateName":"Harbour Care Kitchen","batchTitle":"Bakery surplus","context":["Quantity: 118 items","Pickup deadline: Today, 2:45 PM","Handling priority: Low handling risk"]}',
    output:
      '{"title":"Information request draft","intro":"FoodLoop prepared a donor-facing clarification note for the selected recipient.","message":"Please confirm the final count, pickup contact, and side-entrance handoff note before Harbour Care Kitchen accepts this batch.","nextSteps":["Send the request to the donor contact.","Keep the recipient place in queue while waiting.","Refresh the match recommendation after the donor replies."],"confidenceNote":"Use this as operational copy; a person should review before sending."}',
  },
  {
    title: "Decline and reroute",
    input:
      '{"action":"decline","candidateName":"Causeway Neighbour Table","batchTitle":"Chilled sandwiches","context":["Capacity below full quantity","Short pickup window"]}',
    output:
      '{"title":"Decline and reroute note","intro":"FoodLoop prepared concise recipient copy for releasing this batch to backups.","message":"Thank you for reviewing this opportunity. We cannot accept the full chilled batch inside the current pickup window, so FoodLoop should offer it to the next matched recipient.","nextSteps":["Record the decline reason for matching transparency.","Keep the batch visible to backup recipients.","Notify the donor only after a new recipient is selected."],"confidenceNote":"Operational copy only; recipient staff confirm before sending."}',
  },
];

const routeExamples = [
  {
    title: "Deterministic route explanation",
    input:
      '{"routePlan":{"donorName":"Sunrise Bakery","ngoName":"Harbour Care Kitchen","routeDistanceLabel":"1.4 km","etaLabel":"16 min","pickupWindow":"12:20 PM to 12:45 PM","slaStatus":"On track"},"batch":{"pickupDeadline":"Today, 2:45 PM"},"candidate":{"capacityLabel":"120 item capacity today","serviceWindow":"12:30 PM to 3:30 PM"}}',
    output:
      '{"agent":{"agentName":"FoodLoop Route AI","confidence":88,"etaLabel":"16 min","pickupWindow":"12:20 PM to 12:45 PM","statusLabel":"On track","summary":"The route keeps travel short, fits the recipient service window, and leaves donor-side buffer before the deadline.","reasons":["1.4 km route keeps the handoff close to the accepted NGO.","Pickup window leaves buffer before the donor deadline.","Recipient service window can receive the batch after pickup."]}}',
  },
  {
    title: "Short-window route wording",
    input:
      '{"routePlan":{"donorName":"Cedar Table Cafe","ngoName":"Tin Hau Supper Room","routeDistanceLabel":"1.1 km","etaLabel":"14 min","pickupWindow":"11:55 AM to 1:20 PM","slaStatus":"Tight window"},"batch":{"handlingPriority":"Short window"},"candidate":{"capacityLabel":"Cold bags for 70 packs","serviceWindow":"12:00 PM to 2:00 PM"}}',
    output:
      '{"agent":{"agentName":"FoodLoop Route AI","confidence":86,"etaLabel":"14 min","pickupWindow":"11:55 AM to 1:20 PM","statusLabel":"Tight window","summary":"The route prioritizes a nearby cold-capable recipient and keeps the pickup inside the donor window.","reasons":["Nearby route reduces time pressure.","Recipient has cold-bag capacity for the full batch.","NGO confirmation remains required after drop-off."]}}',
  },
];

const impactExamples = [
  {
    title: "Confirmed pickup impact",
    input:
      '{"batch":{"id":"FL-WC-0625-014","donorName":"Sunrise Bakery","itemDescription":"Assorted buns, rolls, croissants","quantityLabel":"118 items"},"candidate":{"name":"Harbour Care Kitchen"},"currentImpact":{"estimatedItems":118,"kgRescued":9.44,"mealEquivalents":118,"co2eAvoidedKg":23.6}}',
    output:
      '{"title":"FoodLoop impact summary","intro":"FoodLoop converted the confirmed handoff into a receipt-level story across rescue volume, community value, ESG reporting, and operational efficiency.","points":["This confirmed pickup adds 9.4 kg of rescued food to the demo portfolio.","Harbour Care Kitchen confirmation closes the loop before impact language appears.","The summary separates demo estimates from audited measurement claims."],"caveat":"All current-pickup impact values use deterministic demo formulas and are demo estimates."}',
  },
  {
    title: "Produce impact with caveat",
    input:
      '{"batch":{"id":"FL-TK-0625-031","donorName":"Tai Kok Tsui Market Stall 18","itemDescription":"Mixed apple, orange, and pear boxes","quantityLabel":"36 boxes"},"candidate":{"name":"Sham Shui Po Fresh Box"},"currentImpact":{"estimatedItems":36,"kgRescued":2.88,"mealEquivalents":36,"co2eAvoidedKg":7.2}}',
    output:
      '{"title":"FoodLoop impact summary","intro":"FoodLoop summarized the confirmed produce handoff for community and ESG storytelling.","points":["The receipt records a confirmed donor-to-NGO handoff before impact copy is shown.","Demo formulas estimate food rescued, meal equivalents, and CO2e avoided.","The wording stays suitable for pitch reporting without implying audited measurement."],"caveat":"All metrics are deterministic demo estimates, not audited impact measurement."}',
  },
];

const skillDefinitions: Record<SkillId, AISkillDefinition> = {
  intake: {
    id: "intake",
    label: "Intake Skill",
    version: skillVersion,
    status: "live",
    provider: "OpenRouter JSON mode with fallback demo data",
    purpose:
      "Convert a donor photo/scenario/text input into a structured, donor-editable surplus batch draft.",
    inputSummary: "Selected photo scenario, donor context, category hint, fallback draft, forecast, and sensor evidence.",
    outputSummary: "Batch draft, intake recommendation, forecast summary, and sensor evidence.",
    guardrailSummary:
      "Final labels are constrained to the approved handling priority set and remain donor-confirmed decision support.",
    humanConfirmationPoint:
      "The donor edits and confirms the draft before FoodLoop submits it for matching.",
    appearsIn: "Donor Intake page and /api/intake-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Intake Skill. Your job is to turn the selected donor photo scenario into a clean operational batch record that a donor can edit. Use the scenario data as the source of truth. If a value is uncertain, choose a conservative wording and place the confirmation in donorNotes or requiredConfirmation. The output must support downstream matching without inventing evidence. Handling language must describe review state and pickup urgency, not certify the food.`,
    userPromptTemplate:
      '{"skillId":"intake","task":"Create a donor-editable intake draft from this selected photo scenario.","input":{"scenario":"<PhotoScenario payload>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "intake",
        "Create a donor-editable intake draft from this selected photo scenario.",
        context,
      ),
    expectedOutputShape:
      '{"draft":BatchDraft,"recommendation":AgentRecommendation,"forecast":ForecastSummary,"sensorEvidence":SensorEvidence}',
    examples: intakeExamples,
    guardrails: [
      "Return exactly one draft object; do not add extra candidate, route, or impact objects.",
      "Use only one of: Low handling risk, Needs confirmation, Short window.",
      "Do not claim the batch is certified, approved for consumption, or finally safe.",
      "Keep donorNotes actionable and suitable for human review.",
    ],
    fallbackDescription:
      "Use the selected scenario's fallback draft, recommendation, forecast, and sensor evidence.",
  },
  "handling-risk": {
    id: "handling-risk",
    label: "Handling/Risk Skill",
    version: skillVersion,
    status: "simulated",
    provider: "Deterministic TypeScript guard layer",
    purpose:
      "Assign handling priority and missing-confirmation logic from donor evidence and batch timing.",
    inputSummary: "Draft category, pickup deadline, holding status, temperature text, and donor notes.",
    outputSummary: "Handling priority, required confirmations, and operational handling notes.",
    guardrailSummary:
      "Rules win over model language; final label must be Low handling risk, Needs confirmation, or Short window.",
    humanConfirmationPoint:
      "Donor and recipient review the flagged confirmations before acceptance or handoff.",
    appearsIn: "Intake, Match Queue, and /api/intake-agent plus /api/match-rank-agent guards.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Handling/Risk Skill. You do not certify food. You label operational review state from evidence: use Short window when time or cold-chain logistics dominate, Needs confirmation when quantity/quality/holding details must be checked, and Low handling risk only when packaging and timing look straightforward. If rule-derived evidence conflicts with generated wording, the rule-derived label wins.`,
    userPromptTemplate:
      '{"skillId":"handling-risk","task":"Classify handling priority and confirmations for this donor draft.","input":{"draft":"<BatchDraft payload>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "handling-risk",
        "Classify handling priority and confirmations for this donor draft.",
        context,
      ),
    expectedOutputShape:
      '{"handlingPriority":"Low handling risk|Needs confirmation|Short window","requiredConfirmation":string,"handlingNotes":string}',
    examples: handlingExamples,
    guardrails: [
      "Allowed labels are fixed and case-sensitive.",
      "If chilled or pickup timing is tight, prefer Short window.",
      "If quality/count/holding evidence is incomplete, prefer Needs confirmation.",
      "Never output a food-safety verdict.",
    ],
    fallbackDescription:
      "Infer the label from deterministic donor evidence and scenario fallback text.",
  },
  forecast: {
    id: "forecast",
    label: "Forecast Skill",
    version: skillVersion,
    status: "simulated",
    provider: "Scenario forecast data guarded by TypeScript normalization",
    purpose:
      "Predict the surplus quantity band and likely pickup window from the scenario pattern.",
    inputSummary: "Scenario id, donor context, category hint, historical/demo forecast values, and draft quantity.",
    outputSummary: "Predicted band, likely surplus window, pattern basis, and confidence score.",
    guardrailSummary:
      "The model may explain the forecast, but invalid bands/windows fall back to scenario data.",
    humanConfirmationPoint:
      "The donor confirms actual quantity and pickup deadline before matching.",
    appearsIn: "Donor Intake page and /api/intake-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Forecast Skill. Produce a compact surplus forecast for a pitch demo. Use scenario forecast data and donor pattern text as the anchor. Do not claim statistical certainty or audited prediction quality. If the supplied pattern has a forecast band, keep it consistent unless the user supplies a clear revised quantity.`,
    userPromptTemplate:
      '{"skillId":"forecast","task":"Summarize the likely surplus band and pickup timing for this scenario.","input":{"scenario":"<PhotoScenario payload>","draft":"<optional BatchDraft>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "forecast",
        "Summarize the likely surplus band and pickup timing for this scenario.",
        context,
      ),
    expectedOutputShape:
      '{"predictedBand":string,"likelyWindow":string,"patternBasis":string,"confidence":number}',
    examples: forecastExamples,
    guardrails: [
      "Confidence must be an integer from 0 to 100.",
      "Do not invent a donor history that is not in the scenario.",
      "Invalid or missing forecast values fall back to deterministic scenario data.",
      "Keep wording as a demo prediction, not a guarantee.",
    ],
    fallbackDescription:
      "Use the selected scenario's forecast object exactly.",
  },
  matching: {
    id: "matching",
    label: "Matching Skill",
    version: skillVersion,
    status: "live",
    provider: "OpenRouter JSON mode with candidate-pool guard",
    purpose:
      "Rank supplied NGO candidates and explain fit using compatibility, demand, distance, capacity, and urgency.",
    inputSummary: "Donor-confirmed draft, scenario summary, allowed candidate IDs, and candidate pool.",
    outputSummary: "Ranked known candidates, AI summary, fit explanation, handling notes, and route preview.",
    guardrailSummary:
      "Unknown candidate IDs are dropped and missing known candidates are appended from the supplied pool.",
    humanConfirmationPoint:
      "An NGO accepts, requests more info, or declines before routing begins.",
    appearsIn: "NGO Match Queue page and /api/match-rank-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Matching Skill. Rank only the NGO candidate IDs supplied in the user payload. You may adjust scores and explanations, but you may not create NGOs, invent service windows, invent capacities, or change the donor batch facts. Explain the top fit in operational terms that a donor or NGO can audit. Scores and factor values must be integers from 0 to 100.`,
    userPromptTemplate:
      '{"skillId":"matching","task":"Rank the known NGO candidates for this donor-confirmed batch.","input":{"batchDraft":"<BatchDraft>","scenario":"<scenario summary>","allowedCandidateIds":["<ids>"],"candidatePool":["<NGOCandidate objects>"]}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "matching",
        "Rank the known NGO candidates for this donor-confirmed batch.",
        context,
      ),
    expectedOutputShape:
      '{"candidates":NGOCandidate[],"aiSummary":string,"ngoFitExplanation":string,"handlingNotes":string,"routePreview":string}',
    examples: matchingExamples,
    guardrails: [
      "Only rank supplied candidate IDs.",
      "Do not invent NGOs, demand labels, service windows, route facts, or workflow states.",
      "All scores and factor values must be 0 to 100.",
      "Handling notes must use review language and the guarded handling label.",
    ],
    fallbackDescription:
      "Use the known candidate pool in scenario order with deterministic fit explanations.",
  },
  communication: {
    id: "communication",
    label: "Communication Skill",
    version: skillVersion,
    status: "live",
    provider: "OpenRouter JSON mode with modal-copy fallback",
    purpose:
      "Draft concise recipient action copy for request-info, decline, and reroute moments.",
    inputSummary: "Recipient action, active role, batch/candidate identifiers, handling priority, and context bullets.",
    outputSummary: "Modal title, intro, message, next steps, and confidence note.",
    guardrailSummary:
      "Copy stays operational, human-reviewed, and avoids certification or food-safety verdict wording.",
    humanConfirmationPoint:
      "The NGO staff member reviews and chooses whether to use the draft.",
    appearsIn: "Request More Info and Decline modals via /api/matching-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Communication Skill. Draft short, practical copy for recipient actions. Match the action exactly: request-info asks the donor for missing operational details; decline releases the batch to backups and records a transparent reason. Do not overpromise. Do not speak as a regulator, auditor, or food-safety certifier.`,
    userPromptTemplate:
      '{"skillId":"communication","task":"Draft an NGO-to-donor request or decline/reroute note.","input":{"action":"request-info|decline","payload":"<AIModalRequest>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "communication",
        "Draft an NGO-to-donor request or decline/reroute note.",
        context,
      ),
    expectedOutputShape:
      '{"title":string,"intro":string,"message":string,"nextSteps":string[],"confidenceNote":string}',
    examples: communicationExamples,
    guardrails: [
      "Use concise operational language.",
      "Do not create new donor facts or recipient promises.",
      "Next steps should be concrete and no more than three items.",
      "A person reviews before sending.",
    ],
    fallbackDescription:
      "Use action-specific demo modal copy for request-info or decline.",
  },
  route: {
    id: "route",
    label: "Route Skill",
    version: skillVersion,
    status: "live",
    provider: "OpenRouter JSON mode with deterministic route facts",
    purpose:
      "Explain a route recommendation while preserving deterministic ETA, distance, stops, windows, and geometry.",
    inputSummary: "Accepted match, deterministic SharedRoutePlan, batch facts, and candidate facts.",
    outputSummary: "Route agent summary, confidence, status label, and explanation reasons.",
    guardrailSummary:
      "ETA, distance, pickup window, stops, route geometry, and timeline remain deterministic.",
    humanConfirmationPoint:
      "Donor tracks pickup; NGO confirms receipt after drop-off.",
    appearsIn: "Shared Route page and /api/route-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Route Skill. Explain the accepted route using the deterministic routePlan supplied by the app. You may write a better summary and reasons, but you must not alter ETA, route distance, pickup window, stops, route geometry, timeline facts, driver/volunteer assignments, or donor/candidate names. Route facts come from FoodLoop data, not from you.`,
    userPromptTemplate:
      '{"skillId":"route","task":"Explain the deterministic route recommendation for this accepted donor-to-NGO match.","input":{"routePlan":"<SharedRoutePlan>","batch":"<MatchQueueBatch summary>","candidate":"<NGOCandidate summary>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "route",
        "Explain the deterministic route recommendation for this accepted donor-to-NGO match.",
        context,
      ),
    expectedOutputShape:
      '{"agent":{"agentName":string,"confidence":number,"etaLabel":string,"pickupWindow":string,"statusLabel":string,"summary":string,"reasons":string[]}}',
    examples: routeExamples,
    guardrails: [
      "Do not alter route geometry, stops, ETA, pickup window, distance, or timeline facts.",
      "Reasons must be derived from batch, candidate, and routePlan fields.",
      "Do not invent traffic feeds, drivers, map providers, or audited routing metrics.",
      "Keep receipt confirmation as a human/NGO action.",
    ],
    fallbackDescription:
      "Use the deterministic routePlan agent copy produced from the accepted match.",
  },
  impact: {
    id: "impact",
    label: "Impact Skill",
    version: skillVersion,
    status: "live",
    provider: "OpenRouter JSON mode with deterministic metric formulas",
    purpose:
      "Turn a confirmed rescue into community, ESG, and operations wording while preserving demo metric formulas.",
    inputSummary: "Confirmed batch, candidate, and current deterministic impact metrics.",
    outputSummary: "Impact title, intro, bullet points, and measurement caveat.",
    guardrailSummary:
      "Kg, meals, and CO2e values come from deterministic formulas and must be described as demo estimates.",
    humanConfirmationPoint:
      "Impact unlocks only after the NGO confirms receipt on the route page.",
    appearsIn: "Shared Impact page and /api/impact-agent.",
    systemPrompt: `${sharedDecisionSupportRules}

You are FoodLoop's Impact Skill. Summarize only confirmed handoffs. The kg, meal, and CO2e values are deterministic demo estimates supplied by the app. You may craft clear ESG/community wording, but you may not call the metrics audited, independently measured, verified, certified, or final. Keep the caveat explicit and reviewer-friendly.`,
    userPromptTemplate:
      '{"skillId":"impact","task":"Summarize the confirmed rescue handoff for a pitch demo impact panel.","input":{"batch":"<batch summary>","candidate":"<candidate summary>","currentImpact":"<formula outputs>"}}',
    buildUserPrompt: (context) =>
      formatJsonTask(
        "impact",
        "Summarize the confirmed rescue handoff for a pitch demo impact panel.",
        context,
      ),
    expectedOutputShape:
      '{"title":string,"intro":string,"points":string[],"caveat":string}',
    examples: impactExamples,
    guardrails: [
      "Only summarize after receipt confirmation.",
      "Do not alter currentImpact values.",
      "Always describe metrics as deterministic demo estimates.",
      "Do not imply audited ESG measurement.",
    ],
    fallbackDescription:
      "Use fallback demo impact copy and deterministic formula outputs.",
  },
};

export const skillFlow: SkillId[] = [
  "intake",
  "handling-risk",
  "forecast",
  "matching",
  "communication",
  "route",
  "impact",
];

export const aiSkillRegistry = skillDefinitions;

export const aiSkillList = skillFlow.map((skillId) => aiSkillRegistry[skillId]);

export const getSkillMetadata = (
  skillId: SkillId,
  supportingSkillIds: SkillId[] = [],
): AISkillResponseMetadata => {
  const skill = aiSkillRegistry[skillId];

  return {
    skillId: skill.id,
    skillName: skill.label,
    skillVersion: skill.version,
    guarded: true,
    supportingSkills: supportingSkillIds.map((supportingSkillId) => {
      const supportingSkill = aiSkillRegistry[supportingSkillId];

      return {
        skillId: supportingSkill.id,
        skillName: supportingSkill.label,
        skillVersion: supportingSkill.version,
        guarded: true,
      };
    }),
  };
};

export const getFlatSkillMetadata = (skillId: SkillId): AISkillMetadata => {
  const skill = aiSkillRegistry[skillId];

  return {
    skillId: skill.id,
    skillName: skill.label,
    skillVersion: skill.version,
    guarded: true,
  };
};

const formatExamples = (definition: AISkillDefinition) =>
  definition.examples
    .map(
      (example, index) =>
        `Example ${index + 1}: ${example.title}\nInput:\n${example.input}\nOutput:\n${example.output}`,
    )
    .join("\n\n");

export const getRuntimeSystemPrompt = (
  skillId: SkillId,
  supportingSkillIds: SkillId[] = [],
) => {
  const definitions = [skillId, ...supportingSkillIds].map(
    (id) => aiSkillRegistry[id],
  );

  return definitions
    .map(
      (definition) =>
        `# ${definition.label} (${definition.id}, ${definition.version})\n${definition.systemPrompt}\n\nExpected JSON:\n${definition.expectedOutputShape}\n\nFew-shot examples:\n${formatExamples(definition)}\n\nGuardrails:\n${definition.guardrails.map((item) => `- ${item}`).join("\n")}\nFallback:\n${definition.fallbackDescription}`,
    )
    .join("\n\n---\n\n");
};

export const buildSkillMessages = ({
  skillId,
  context,
  supportingSkillIds = [],
}: {
  skillId: SkillId;
  context: unknown;
  supportingSkillIds?: SkillId[];
}): Array<{ role: "system" | "user"; content: string }> => [
  {
    role: "system",
    content: getRuntimeSystemPrompt(skillId, supportingSkillIds),
  },
  {
    role: "user",
    content: aiSkillRegistry[skillId].buildUserPrompt(context),
  },
];

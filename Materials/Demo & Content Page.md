# FoodLoop Demo Page & Content Plan

## Goal
Create a workable **Donor + NGO demo** for FoodLoop RescueCore based on the Materials: a role-switchable product demo where embedded AI agents help intake, match, route, and report surplus food rescue.

## Current State
Verified from [Materials/Content.md](</Users/jasonfung/Documents/Github project/Foodloop/Materials/Content.md>), [Materials/handoff.md](</Users/jasonfung/Documents/Github project/Foodloop/Materials/handoff.md>), [Materials/colour token.md](</Users/jasonfung/Documents/Github project/Foodloop/Materials/colour token.md>), and the PDFs:
- Product should be a pitch-demo dashboard, not a public marketing site.
- Core story: donor uploads surplus food → AI structures it → NGO is matched → shared route is shown → impact is recorded.
- AI must be positioned as **decision support**, not food-safety certification.
- Visual style: light ESG SaaS dashboard, green for FoodLoop/impact, blue for AI/logistics, amber/red for urgency/review states.

## Resolved Decisions
- Format: clickable/workable product demo.
- Roles: **Donor and NGO only**.
- Role separation: visible **role switcher**.
- Each main page includes a compact **opposite-side preview panel**.
- AI agents: embedded inside workflow pages.
- Agent authority: agents recommend; Donor/NGO confirms.
- Language: English only.
- Architecture: real in-app page.
- Forecasting: small module, not a standalone page.

## Pages And Content

### 1. Donor Intake
Primary role: Donor  
Opposite preview: NGO sees incoming batch summary as “pending match”.

Content:
- Upload/photo area with sample surplus food image.
- AI Intake Agent panel: extracted food category, quantity, packaging, prepared time, pickup deadline, confidence.
- Forecast mini-module: predicted surplus band for today, based on historical pattern.
- Sensor/evidence row: storage location, temperature status, optional “sensor attached”.
- Editable batch form.
- CTA: `Submit for Matching`.
- Copy emphasis: “AI drafts the record; donor confirms.”

### 2. NGO Match Queue
Primary role: NGO  
Opposite preview: Donor sees “FoodLoop is finding the best recipient”.

Content:
- Available matched batch cards.
- Batch summary: food type, quantity, pickup deadline, handling priority.
- AI Matching Agent panel: ranked match explanation using demand, distance, capacity, food compatibility, urgency.
- NGO capacity/demand indicators.
- Risk/handling badge: use “Low handling risk”, “Short window”, or “Needs confirmation”, never “safe/unsafe”.
- Actions: `Accept Batch`, `Request More Info`, `Decline`.
- Copy emphasis: “NGO receives prioritized, explainable opportunities instead of manual calls.”

### 3. Shared Match & Route
Primary role: role-switchable Donor/NGO  
Opposite preview: always shows the counterpart’s current status.

Content:
- Accepted pairing summary: donor location, NGO location, batch ID, food details.
- Shared route/map-style panel with pickup and drop-off pins.
- AI Route Agent panel: ETA, pickup window, route status, reason for route recommendation.
- Status timeline: submitted → matched → accepted → pickup scheduled → received.
- Donor action: track pickup / view NGO confirmation.
- NGO action: confirm pickup plan / confirm received.
- Copy emphasis: “Both sides see the same pairing route and operational status.”

### 4. Shared Impact
Primary role: role-switchable Donor/NGO  
Opposite preview: compact view of counterpart’s impact framing.

Content:
- KPI cards: kg rescued, meals delivered, CO2e avoided, pickup success rate.
- Donor view: ESG proof, monthly report draft, export summary.
- NGO view: meals/community impact, accepted batches, delivery reliability.
- AI Impact Agent panel: generated rescue summary and report-ready wording.
- Simple charts: weekly rescued food trend, donation status breakdown, route time saved.
- Copy emphasis: “Every completed pickup becomes measurable impact.”

### 5. Architecture & AI Agents
Primary role: neutral technical overview  
Opposite preview: not needed; this page explains the system.

Content:
- System flow diagram: Donor Intake → Intake Agent → Risk/Rules Layer → Matching Agent → Route Agent → Impact Agent.
- Agent cards:
  - Intake Agent: photo/text to structured batch.
  - Forecast Agent: predicts likely surplus band.
  - Matching Agent: ranks NGO fit.
  - Route Agent: recommends ETA and route.
  - Impact Agent: generates ESG/community summary.
- Human confirmation checkpoints.
- “MVP vs Future” section:
  - MVP: mock data, role switcher, transparent scoring, no backend.
  - Future: real accounts, POS/CSV import, live routing, real sensors, audit logs.
- Copy emphasis: “AI coordinates the workflow; humans confirm key decisions.”

## Key Interfaces For Implementation
- `activeRole`: `donor | ngo`.
- `batch`: food type, quantity, packaging, prepared time, pickup deadline, storage evidence, status.
- `agentRecommendation`: agent name, confidence, explanation, suggested action, required confirmation.
- `match`: NGO name, score, demand, capacity, distance, compatibility, explanation.
- `route`: pickup, drop-off, ETA, window, status, route notes.
- `impact`: kg rescued, meals delivered, CO2e avoided, success rate, generated summary.

## Test Plan
- Walkthrough test: Donor submits batch → switch to NGO → accept batch → view shared route → confirm received → impact updates.
- Role test: each page changes primary actions and copy when switching Donor/NGO.
- Agent test: every agent panel shows recommendation, confidence/explanation, and a human confirmation path.
- Safety copy test: no page says AI certifies food safety.
- Presentation test: pages are screenshot-ready at desktop pitch size.

## Assumptions
- This remains frontend-only with mock data.
- No real authentication; role switcher simulates user perspective.
- No real AI, map API, or backend required for v1.
- The demo prioritizes pitch clarity and believability over production completeness.

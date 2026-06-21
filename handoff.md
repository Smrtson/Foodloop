# Handoff For Coding Agent

## Next-Session Focus

Build a polished, frontend-first demo prototype for **FoodLoop RescueCore**, an AI-powered surplus food rescue platform for Hong Kong.

The user is responsible for the slide-deck section covering:

1. **Product Demo Screens**
2. **Product Architecture**
3. **AI / Technical Approach**

The coding agent should help turn these sections into a realistic clickable/demoable product interface that can be screenshotted for the competition slide deck and shown in a short intro video.

The goal is **not** to build a full production backend. The goal is to build a visually credible prototype that helps judges believe the product is feasible.

## User’s Need

The user needs a coding agent to understand that this is for a **case competition / pitch deck**, not a normal software product launch.

The prototype should support the story:

> Donor uploads surplus food → AI understands the food → system risk-scores it → system matches it to the best NGO → route is optimized → impact is recorded.

The prototype must make the user’s assigned section look strong for judging criteria:

* Technical feasibility
* Innovation
* Business value / social impact
* Presentation quality

## Recommended Coding Deliverable

Create a simple web-based prototype with four main demo screens and one optional architecture/technical page.

Preferred format:

* Frontend-only React / Next.js / Vite app
* Mock data only
* No real authentication needed
* No real backend needed
* Clean dashboard-style UI
* Suitable for screenshots in slides
* Suitable for screen recording in a 5-minute pitch video

If using a component library, prioritize a clean SaaS-dashboard style.

## Core Demo Screens To Build

### Screen 1: Donor Surplus Upload

Purpose:

Show that donors can list surplus food quickly with minimal manual work.

Main UI elements:

* Page title: “New Surplus Entry”
* Food photo upload area
* Uploaded sample image preview
* Auto-filled form fields:

  * Food category
  * Estimated quantity
  * Packaging condition
  * Prepared time
  * Pickup deadline
* AI suggestion badge:

  * “AI draft generated”
* CTA button:

  * “Submit for Matching”

Suggested sample data:

* Food type: Bakery / bread box
* Quantity: 24 items
* Packaging: Sealed
* Prepared time: 10:15 AM
* Pickup before: 1:00 PM

Important UX message:

> The donor only takes a photo. The system auto-generates the listing, and the staff member only confirms it.

Implementation note:

No real image AI is required. Simulate the upload result with mock auto-filled fields after clicking an “Analyze Photo” or “Generate AI Draft” button.

---

### Screen 2: AI Risk + NGO Matching Results

Purpose:

Show the core intelligence of the system.

Main UI elements:

* Food batch summary card
* Risk badge:

  * Low Risk / Medium Risk / Urgent
* Risk explanation:

  * “Stable time window”
  * “Packaged food”
  * “Pickup recommended within 2 hours”
* Ranked NGO cards:

  * NGO name
  * Distance
  * Current demand level
  * Food compatibility
  * Match score
* Explainability box:

  * “Why this NGO?”

Suggested NGO examples:

1. Feeding Hong Kong

   * Distance: 1.8 km
   * Demand: High
   * Match score: 92
   * Reason: close distance, accepts bakery items, high demand today

2. Community Kitchen A

   * Distance: 2.6 km
   * Demand: Medium
   * Match score: 84

3. Shelter Support Hub

   * Distance: 3.4 km
   * Demand: Medium
   * Match score: 78

Important UX message:

> The system does not just list NGOs. It ranks them based on urgency, distance, demand, and food compatibility.

Implementation note:

Use a mock scoring formula. It does not need to be mathematically perfect, but should be transparent and believable.

Example matching score logic:

```text
match_score =
  food_compatibility * 0.35 +
  demand_score * 0.25 +
  distance_score * 0.25 +
  urgency_fit * 0.15
```

---

### Screen 3: Smart Dispatch & Route Optimization

Purpose:

Show operational value and logistics feasibility.

Main UI elements:

* Map-style panel
* Pickup route:

  * Donor A → NGO / Food bank
* Route ETA
* Pickup time window
* Driver / volunteer assignment
* Route optimization summary:

  * “12 min faster than manual route”
  * “Pickup SLA: on track”
* Button:

  * “Recalculate Route”

Suggested UI design:

A real map API is optional. A mock map-style visual is acceptable. Use cards, route lines, pins, and ETA labels.

Suggested sample route:

* Pickup: Happy Bakery, Mong Kok
* Drop-off: Feeding Hong Kong partner hub
* ETA: 18 minutes
* Pickup window: 12:15 PM – 12:45 PM
* Priority: Medium
* Status: Assigned

Important UX message:

> FoodLoop reduces manual dispatch coordination by automatically creating a route based on urgency, time windows, and distance.

Implementation note:

No real vehicle routing solver is required. Simulate route optimization using mock data and show an explainable result.

Optional simple heuristic:

```text
Sort pickups by:
1. urgency level
2. pickup deadline
3. distance to NGO
```

---

### Screen 4: Impact Dashboard

Purpose:

Show why companies and NGOs care about the system.

Main UI elements:

Top KPI cards:

* Food rescued: 680 kg
* Meals delivered: 1,240
* CO₂e avoided: 1.8 tonnes
* Pickup success rate: 94%

Charts:

* Weekly food rescued trend
* Donation status breakdown
* Route time saved

ESG section:

* “Generate Monthly ESG Report”
* “Export Impact Summary”

Important UX message:

> Every successful pickup becomes measurable social and ESG impact.

Implementation note:

Use mock metrics and simple charts. The goal is pitch clarity, not perfect analytics.

## Optional Screen 5: Product Architecture / Technical Overview

Build either a page or a visual component that can be screenshotted for the architecture slide.

Suggested architecture flow:

```text
Donor App / POS / CSV
        ↓
AI Intake Layer
        ↓
Risk Scoring Engine
        ↓
NGO Matching Engine
        ↓
Route Optimization
        ↓
Impact Dashboard
```

Show the system in layers:

1. Input Layer

   * Donor app
   * POS / CSV upload
   * Optional IoT sensors

2. Intelligence Layer

   * Photo-based food classification
   * Rule-based risk scoring
   * Surplus forecasting
   * Matching engine

3. Optimization Layer

   * Pickup scheduling
   * Route optimization
   * Exception handling

4. Output Layer

   * NGO dashboard
   * Driver route view
   * ESG impact dashboard

## AI / Technical Approach To Represent In Prototype

Do not overclaim that AI can determine whether food is edible.

Use this principle:

> FoodLoop uses AI for decision support, not final food safety certification.

Represent the AI as a hybrid system:

1. Vision-language intake

   * Converts food photos into structured surplus records.
   * Simulated in prototype with mock auto-fill.

2. Rule-based risk scoring

   * Uses food type, prepared time, packaging condition, and pickup deadline.
   * Produces Low / Medium / Urgent risk labels.

3. Matching engine

   * Ranks NGOs based on demand, distance, food compatibility, and urgency.

4. Route optimization

   * Creates efficient pickup routes based on time windows and priority.

5. Impact analytics

   * Converts completed pickups into kg rescued, meals delivered, and CO₂e avoided.

6. Optional forecasting

   * Can be shown as a future/premium module.
   * Predicts likely surplus before closing time using historical sales, day-of-week, weather, and events.

## Important Product Positioning

The prototype should feel like:

* A SaaS dashboard
* A food rescue operations system
* A sustainability / ESG reporting tool
* A logistics coordination platform

It should not feel like:

* A pure charity listing app
* A simple food marketplace
* A generic chatbot
* A risky “AI decides food safety” product

## Visual Style Direction

Recommended style:

* Clean ESG / sustainability SaaS
* White or light background
* Green accent color
* Soft cards
* Rounded corners
* Clear KPI badges
* Simple icons
* Minimal but professional

Suggested color meaning:

* Green: safe / rescued / sustainability
* Yellow: caution / urgent pickup
* Red: high risk / failed pickup
* Blue: routing / logistics / system intelligence

## Demo Flow For Video Or Live Presentation

The clickable demo should follow this sequence:

1. Start on Donor Surplus Upload.
2. Upload/analyze food image.
3. Auto-filled food record appears.
4. Submit for matching.
5. Matching screen shows risk score and ranked NGOs.
6. Select top NGO.
7. Dispatch route screen appears.
8. Route is assigned and optimized.
9. Complete pickup.
10. Impact dashboard updates.

The full demo should be explainable in 60–90 seconds.

## Acceptance Criteria

The coding agent should complete enough that the user can:

* Take screenshots for Slide 9: Product Demo Screens.
* Take a screenshot or diagram for Slide 10: Product Architecture.
* Explain the simulated AI logic for Slide 11: AI / Technical Approach.
* Record a short demo video showing the product flow.
* Present the prototype without needing real backend integration.

Minimum acceptable output:

* Four polished screens
* Mock data
* Clickable or sequential flow
* Clear AI labels / explanations
* Responsive enough for laptop presentation
* README explaining how to run and what each screen demonstrates

## Suggested File Structure

```text
foodloop-demo/
  README.md
  package.json
  src/
    App.tsx
    data/
      mockFoodBatch.ts
      mockNgos.ts
      mockImpactMetrics.ts
    components/
      Layout.tsx
      KpiCard.tsx
      RiskBadge.tsx
      MatchCard.tsx
      RouteMapMock.tsx
      ArchitectureDiagram.tsx
    pages/
      DonorUpload.tsx
      MatchingResults.tsx
      DispatchRoute.tsx
      ImpactDashboard.tsx
      Architecture.tsx
    utils/
      riskScoring.ts
      matchingScore.ts
      routeHeuristic.ts
```

## Suggested Mock Logic

### Risk Scoring

Use a simple transparent score.

Inputs:

* Food category
* Hours since prepared
* Packaging condition
* Pickup deadline
* Temperature status if included

Example:

```text
risk_score =
  time_risk * 0.4 +
  packaging_risk * 0.2 +
  food_category_risk * 0.25 +
  pickup_window_risk * 0.15
```

Output:

* 0–35: Low Risk
* 36–70: Medium Risk
* 71–100: Urgent / High Risk

### Matching Score

Inputs:

* NGO demand
* Distance
* Food type compatibility
* Available capacity
* Urgency fit

Example:

```text
match_score =
  compatibility * 0.35 +
  demand * 0.25 +
  distance * 0.2 +
  capacity * 0.1 +
  urgency_fit * 0.1
```

### Route Heuristic

For MVP:

```text
Sort route by:
1. earliest pickup deadline
2. highest urgency
3. shortest distance
```

Do not implement a complex VRP unless time allows.

## Competition Context

This project is for the CTBE HKUST NOVA competition. The deck can have up to 15 slides, and this prototype supports the product demo, architecture, and technical approach section.

The judging criteria value:

* Innovation
* Feasibility
* Impact
* Problem definition
* Presentation

So prioritize clarity and believability over technical over-complexity.

## Current Known Artifacts

Existing local files that may help:

```text
/mnt/data/Competition-basic-info.txt
/mnt/data/Deep Research for CTBE HKUST NOVA Track Selection.pdf
/mnt/data/Pasted text.txt
```

Use these as context only. Do not copy large sections into the app.

## Important Assumptions

* The user wants a demo for a pitch, not production deployment.
* The user likely needs screenshots and talking points.
* Code is optional bonus for the competition, so the prototype should be polished enough to show but does not need full backend reliability.
* The MVP can be software-first.
* Sensor/IoT integration should be shown as optional or future enhancement, not core dependency.

## Open Questions For User

Ask only if needed:

1. Should the prototype be mobile-first, desktop dashboard, or both?
2. Does the team prefer Figma-style static mockups or an actual clickable web app?
3. What design tool or stack should be used?
4. Should the demo use Hong Kong district names and real-looking NGO/donor examples?
5. Should the app be in English only, or bilingual English/Traditional Chinese?

## Suggested Skills

* `product-design/get-context`: Use to clarify target prototype style, screen format, and interaction depth.
* `product-design/prototype`: Use to build a clickable prototype from the defined flow.
* `build-web-apps/frontend-app-builder`: Use if building a React/Next.js frontend app in Codex.
* `build-web-apps/shadcn`: Use if the prototype uses shadcn/ui components for fast dashboard-quality UI.
* `data-analytics/visualize-data`: Use if improving the impact dashboard charts and KPI visuals.
* `creative-production/generative-polish`: Use if generating stronger visual direction for slide/demo screenshots.

## Next Steps For Coding Agent

1. Create a frontend-only prototype project.
2. Implement four main screens:

   * Donor Surplus Upload
   * AI Risk + NGO Matching
   * Smart Dispatch & Route Optimization
   * Impact Dashboard
3. Add one architecture/technical overview screen if possible.
4. Use mock data and transparent scoring functions.
5. Make the UI polished enough for screenshots.
6. Add a README explaining:

   * how to run the demo,
   * what each screen shows,
   * what AI is simulated,
   * what is MVP vs future enhancement.
7. Provide screenshot guidance for the user’s slides.

## Redactions

No API keys, passwords, private tokens, credentials, cookies, private keys, or other secrets were observed.

No sensitive personal information is needed for continuation.

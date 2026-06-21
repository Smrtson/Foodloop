# FoodLoop RescueCore Prototype

Clickable React and Vite prototype for a FoodLoop RescueCore pitch demo. The app is desktop-first, uses Hong Kong-context mock data, and supports a 60-90 second walkthrough from donor upload to impact reporting.

## Runbook

```bash
cd foodloop-demo
npm install
npm run dev
```

Useful scripts:

```bash
npm run check
npm run build
npm run preview
```

## Demo Flow

1. Open Intake and click `Analyze photo`.
2. Click `Submit batch` to move into Matching.
3. Review ranked NGOs and click `Confirm NGO`.
4. In Dispatch, click `Recalculate`.
5. Click `Complete pickup`.
6. Open Impact for updated metrics, then Architecture for the technical overview.

The top-right guided CTA advances the same flow for a fast recording.

## What Is Simulated

- Photo analysis and AI draft extraction use deterministic local state.
- `calculateRiskScore(batch)` scores shelf window, storage, packaging, confidence, and allergens.
- `rankNgoMatches(batch, ngos, risk)` ranks NGO candidates by category, capacity, response, route, risk fit, and reliability.
- `buildRoutePlan(batch, selectedNgo)` creates ETA, pickup window, SLA status, stops, and optimization notes.
- Charts and ESG numbers are mock metrics for pitch communication.

The prototype labels AI as decision support. It does not certify food safety.

## MVP vs Future

MVP prototype:

- React/Vite frontend only.
- Local mock data and local decision utilities.
- No auth, database, external map, live dispatch, or real AI inference.

Future production path:

- Authenticated donor and NGO accounts.
- Coordinator review queues and audit logs.
- Food safety workflow integration.
- Live route provider and dispatch notifications.
- Real analytics warehouse for impact reporting.

## Slide And Video Notes

- Slide 9 product demo: capture Intake, Matching, and Dispatch at 1440x900.
- Slide 10 impact proof: capture Impact after `Complete pickup`.
- Slide 11 technical moat: capture Architecture with the full four-layer diagram.
- For video, use the guided CTA and keep each screen on camera for 8-12 seconds.
- Use desktop viewport first. Mobile is responsive for review, but desktop is the presentation target.

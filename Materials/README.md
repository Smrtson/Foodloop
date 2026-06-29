# FoodLoop RescueCore Prototype

Clickable React and Vite prototype for a FoodLoop RescueCore pitch demo. The app is desktop-first, uses Hong Kong-context mock data, and supports a 60-90 second walkthrough from donor upload to impact reporting. In local dev, the agent flows can call OpenRouter through Vite middleware while preserving fallback demo data.

## Runbook

```bash
cd foodloop-demo
npm install
npm run dev
```

Live local AI setup:

1. Keep secrets in `foodloop-demo/.env`. The file is ignored by git.
2. Set `OPENROUTER_API_KEY` to a valid OpenRouter key.
3. Optionally set `OPENROUTER_MODEL`; the default placeholder is `openai/gpt-4o-mini`.
4. Run the demo with `npm run dev`. The live AI routes are Vite dev-server middleware and are not available from a static hosted build.

Useful scripts:

```bash
npm run check
npm run build
npm run preview
```

`foodloop-demo/.env.example` is a safe placeholder template only. Never commit the real `.env`.

## Demo Flow

1. Open Intake and click `Analyze Photo`.
2. Review the FoodLoop AI draft, then continue to the confirm step.
3. Click `Submit for Matching` to move into the NGO Match Queue.
4. Switch to the NGO role, review ranked NGOs, and use `Request More Info`, `Decline`, or `Accept Batch`.
5. After acceptance, open Shared Route and confirm receipt.
6. Open Shared Impact for the receipt-level summary and demo metrics.

## Live AI And Fallbacks

- `/api/intake-agent`, `/api/match-rank-agent`, `/api/matching-agent`, and `/api/impact-agent` are local Vite dev middleware routes.
- When `OPENROUTER_API_KEY` is present, those routes call OpenRouter and return `source: "openrouter"` plus the configured `model`.
- If the key is missing, the network request fails, or the model returns an invalid shape, the same routes return `source: "fallback"` with deterministic demo data.
- The UI shows product-facing labels: `Live FoodLoop AI` for live responses and `Fallback demo data` for fallback responses. Provider/model details stay in secondary notes or tooltips.
- Charts, route estimates, ESG numbers, and partner records remain mock metrics for pitch communication.

The prototype labels AI as decision support. It does not certify food safety.

## MVP vs Future

MVP prototype:

- React/Vite frontend with local Vite middleware for live demo AI.
- Local mock partner, route, and impact data with deterministic fallbacks.
- No auth, database, production API service, external dispatch, or hosted live AI proxy.

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

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";

declare const process: {
  cwd: () => string;
};

const openRouterChatEndpoint = "https://openrouter.ai/api/v1/chat/completions";
const defaultOpenRouterModel = "openai/gpt-4o-mini";

type AgentAction = "request-info" | "decline";

interface MatchingAgentRequest {
  action?: AgentAction;
  role?: "donor" | "ngo";
  batchId?: string;
  batchTitle?: string;
  candidateName?: string;
  handlingPriority?: string;
  context?: string[];
}

interface MatchingAgentResponse {
  title: string;
  intro: string;
  message: string;
  nextSteps: string[];
  confidenceNote: string;
  source: "openrouter" | "fallback";
  model?: string;
}

interface ReadableRequestBody {
  on: (
    eventName: "data" | "end" | "error",
    listener: (value?: unknown) => void,
  ) => void;
}

interface DevRequest extends ReadableRequestBody {
  method?: string;
}

interface DevResponse {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
}

const fallbackModalCopy: Record<
  AgentAction,
  Omit<MatchingAgentResponse, "source">
> = {
  "request-info": {
    title: "Information request draft",
    intro: "Fallback demo copy generated without a live AI response.",
    message:
      "Please confirm the final count, pickup contact, holding location, and any packaging notes before the recipient accepts this batch.",
    nextSteps: [
      "Send the request to the donor contact.",
      "Keep the recipient place in queue while waiting.",
      "Refresh the match recommendation after the donor replies.",
    ],
    confidenceNote:
      "This text is canned for the local demo. Add OPENROUTER_API_KEY for live generated wording.",
  },
  decline: {
    title: "Decline and reroute note",
    intro: "Fallback demo copy generated without a live AI response.",
    message:
      "Thank you for reviewing this opportunity. We cannot accept the current batch window, so FoodLoop should offer it to the next matched recipient.",
    nextSteps: [
      "Record the decline reason for matching transparency.",
      "Keep the batch visible to backup recipients.",
      "Notify the donor only after a new recipient is selected.",
    ],
    confidenceNote:
      "This text is canned for the local demo. Add OPENROUTER_API_KEY for live generated wording.",
  },
};

const fallbackResponse = (
  action: AgentAction = "request-info",
  detail?: string,
): MatchingAgentResponse => ({
  ...fallbackModalCopy[action],
  confidenceNote: detail
    ? `${fallbackModalCopy[action].confidenceNote} ${detail}`
    : fallbackModalCopy[action].confidenceNote,
  source: "fallback",
});

const readRequestBody = (request: ReadableRequestBody) =>
  new Promise<string>((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const sendJson = (
  response: DevResponse,
  statusCode: number,
  payload: MatchingAgentResponse | { error: string },
) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const parseAgentContent = (
  content: unknown,
  action: AgentAction,
  model: string,
): MatchingAgentResponse | null => {
  const contentText =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .map((part) =>
              typeof part === "object" && part && "text" in part
                ? String(part.text)
                : "",
            )
            .join("")
        : "";
  const trimmed = contentText.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : (trimmed.match(/\{[\s\S]*\}/)?.[0] ?? "");

  if (!jsonText) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonText) as Partial<MatchingAgentResponse>;
    const fallback = fallbackResponse(action);

    return {
      title: parsed.title || fallback.title,
      intro: parsed.intro || fallback.intro,
      message: parsed.message || fallback.message,
      nextSteps:
        Array.isArray(parsed.nextSteps) && parsed.nextSteps.length > 0
          ? parsed.nextSteps.filter(Boolean).slice(0, 3)
          : fallback.nextSteps,
      confidenceNote: parsed.confidenceNote || fallback.confidenceNote,
      source: "openrouter",
      model,
    };
  } catch {
    return null;
  }
};

const createMatchingAgentPlugin = (mode: string): Plugin => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.OPENROUTER_API_KEY;
  const model = env.OPENROUTER_MODEL || defaultOpenRouterModel;

  return {
    name: "foodloop-matching-agent",
    configureServer(server) {
      server.middlewares.use("/api/matching-agent", async (request, response) => {
        const devRequest = request as DevRequest;
        const devResponse = response as DevResponse;

        if (devRequest.method !== "POST") {
          devResponse.statusCode = 405;
          devResponse.setHeader("Allow", "POST");
          devResponse.end("Method Not Allowed");
          return;
        }

        let payload: MatchingAgentRequest;

        try {
          payload = JSON.parse(await readRequestBody(devRequest));
        } catch {
          sendJson(devResponse, 400, { error: "Invalid JSON body" });
          return;
        }

        const action = payload.action === "decline" ? "decline" : "request-info";

        if (!apiKey) {
          sendJson(
            devResponse,
            200,
            fallbackResponse(action, "No local API key was configured."),
          );
          return;
        }

        try {
          const openRouterResponse = await fetch(openRouterChatEndpoint, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "FoodLoop RescueCore Demo",
            },
            body: JSON.stringify({
              model,
              temperature: 0.25,
              messages: [
                {
                  role: "system",
                  content:
                    "You are FoodLoop's Matching Agent for a pitch demo. Return only valid JSON with title, intro, message, nextSteps, and confidenceNote. Keep wording concise, operational, and human-confirmed. Use handling and review language, not certification verdict wording.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    task:
                      action === "request-info"
                        ? "Draft an NGO-to-donor information request."
                        : "Draft an NGO decline and reroute note.",
                    payload,
                  }),
                },
              ],
            }),
          });

          if (!openRouterResponse.ok) {
            sendJson(
              devResponse,
              200,
              fallbackResponse(
                action,
                `OpenRouter returned ${openRouterResponse.status}.`,
              ),
            );
            return;
          }

          const data = (await openRouterResponse.json()) as {
            choices?: Array<{ message?: { content?: unknown } }>;
          };
          const content = data.choices?.[0]?.message?.content;
          const parsed = parseAgentContent(content, action, model);

          sendJson(
            devResponse,
            200,
            parsed ??
              fallbackResponse(action, "OpenRouter response could not be parsed."),
          );
        } catch {
          sendJson(
            devResponse,
            200,
            fallbackResponse(action, "OpenRouter request failed."),
          );
        }
      });
    },
  };
};

export default defineConfig(({ mode }) => ({
  plugins: [react(), createMatchingAgentPlugin(mode)],
}));

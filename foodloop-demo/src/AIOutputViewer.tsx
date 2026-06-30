import { Bot, Braces, Check, CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AIModelOutput, AISource } from "./types";
import type { AISkillTaggedResponse } from "./ai/skillTypes";
import type { AIOutputDisplay } from "./ai/outputDisplay";

type CopyState = "idle" | "copied" | "failed";

const copyResetMs = 1600;

function writeClipboardFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export function AIOutputViewer({
  source,
  modelOutput,
  className,
  label = "FoodLoop AI recommendation",
  skillMetadata,
  displayData,
}: {
  source?: AISource | null;
  modelOutput?: AIModelOutput;
  className?: string;
  label?: string;
  skillMetadata?: AISkillTaggedResponse | null;
  displayData?: AIOutputDisplay;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimeoutRef = useRef<number | null>(null);
  const formattedOutput = useMemo(
    () =>
      source === "openrouter" && modelOutput
        ? JSON.stringify(modelOutput, null, 2)
        : "",
    [modelOutput, source],
  );
  const hasModelJson = Boolean(formattedOutput);
  const hasSkillMetadata = Boolean(skillMetadata?.skillId);
  const metadataChips = [
    source === "openrouter"
      ? "OpenRouter"
      : source === "fallback"
        ? "Fallback demo"
        : undefined,
    skillMetadata?.skillName,
    skillMetadata?.skillVersion,
    skillMetadata?.guarded ? "Guarded output" : undefined,
    ...(skillMetadata?.supportingSkills?.map((skill) => skill.skillName) ?? []),
  ].filter((value): value is string => Boolean(value));
  const friendlyOutput: AIOutputDisplay = displayData ?? {
    title: label,
    summary: hasModelJson
      ? "FoodLoop AI returned a structured response. The technical JSON is available below."
      : "No FoodLoop AI recommendation is available yet.",
    bullets: [],
  };

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const setTemporaryCopyState = (nextState: CopyState) => {
    setCopyState(nextState);

    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimeoutRef.current = null;
    }, copyResetMs);
  };

  const handleCopy = async () => {
    if (!formattedOutput) {
      return;
    }

    try {
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(formattedOutput);
          setTemporaryCopyState("copied");
          return;
        } catch {
          // Try the DOM fallback before surfacing a copy failure.
        }
      }

      if (!writeClipboardFallback(formattedOutput)) {
        throw new Error("Clipboard copy failed");
      }

      setTemporaryCopyState("copied");
    } catch {
      setTemporaryCopyState("failed");
    }
  };

  const classNames = ["ai-output-viewer", className].filter(Boolean).join(" ");
  const copyLabel =
    copyState === "copied"
      ? "Copied"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy JSON";

  return (
    <article className={classNames} aria-label={label}>
      <div className="ai-output-card-header">
        <div className="ai-output-card-icon" aria-hidden="true">
          <Bot size={18} />
        </div>
        <div className="ai-output-card-title">
          <span>{label}</span>
          <h3>{friendlyOutput.title}</h3>
        </div>
      </div>

      {metadataChips.length > 0 ? (
        <div className="ai-skill-metadata" aria-label="AI output metadata">
          {metadataChips.map((chip, index) => (
            <span key={`${chip}-${index}`}>{chip}</span>
          ))}
        </div>
      ) : null}

      <div className="ai-output-message">
        <p>{friendlyOutput.summary}</p>

        {friendlyOutput.bullets.length > 0 ? (
          <ul className="ai-output-bullets">
            {friendlyOutput.bullets.map((bullet) => (
              <li key={bullet}>
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {friendlyOutput.highlights?.length ? (
        <dl className="ai-output-highlights" aria-label="AI output highlights">
          {friendlyOutput.highlights.map((highlight) => (
            <div key={`${highlight.label}-${highlight.value}`}>
              <dt>{highlight.label}</dt>
              <dd>{highlight.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {friendlyOutput.footerNote ? (
        <div className="ai-output-footer-note">
          <Sparkles size={14} aria-hidden="true" />
          <p>{friendlyOutput.footerNote}</p>
        </div>
      ) : null}

      {hasModelJson ? (
        <details className="ai-output-technical">
          <summary>
            <span className="ai-output-technical-title">
              <Braces size={15} aria-hidden="true" />
              <span>Technical JSON</span>
            </span>
            <span className="ai-output-summary-state">JSON available</span>
          </summary>

          <div className="ai-output-technical-body">
            {hasSkillMetadata ? (
              <div className="ai-output-technical-note">
                <span>{skillMetadata?.skillId}</span>
                <span>Normalized and guarded</span>
              </div>
            ) : null}

            <div className="ai-output-toolbar">
              <span>Model JSON</span>
              <button
                type="button"
                className="ai-output-copy-button"
                onClick={handleCopy}
              >
                {copyState === "copied" ? (
                  <Check size={14} aria-hidden="true" />
                ) : (
                  <Copy size={14} aria-hidden="true" />
                )}
                {copyLabel}
              </button>
            </div>
            <pre className="ai-output-code" tabIndex={0}>
              <code>{formattedOutput}</code>
            </pre>
          </div>
        </details>
      ) : null}
    </article>
  );
}

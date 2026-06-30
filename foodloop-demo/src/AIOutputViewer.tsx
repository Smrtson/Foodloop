import { Braces, Check, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AIModelOutput, AISource } from "./types";
import type { AISkillTaggedResponse } from "./ai/skillTypes";

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
}: {
  source?: AISource | null;
  modelOutput?: AIModelOutput;
  className?: string;
  label?: string;
  skillMetadata?: AISkillTaggedResponse | null;
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
    <details className={classNames}>
      <summary>
        <span className="ai-output-summary-title">
          <Braces size={16} aria-hidden="true" />
          <span>{label}</span>
        </span>
        <span className="ai-output-summary-state">
          {hasSkillMetadata
            ? skillMetadata?.skillName
            : hasModelJson
              ? "JSON available"
              : "No live output"}
        </span>
      </summary>

      <div className="ai-output-body">
        {hasSkillMetadata ? (
          <div className="ai-skill-metadata" aria-label="AI skill metadata">
            <span>{skillMetadata?.skillId}</span>
            <span>{skillMetadata?.skillVersion}</span>
            {skillMetadata?.guarded ? <span>Guarded output</span> : null}
            {skillMetadata?.supportingSkills?.map((skill) => (
              <span key={skill.skillId}>{skill.skillName}</span>
            ))}
          </div>
        ) : null}

        {hasModelJson ? (
          <>
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
          </>
        ) : (
          <p className="ai-output-empty">No FoodLoop AI recommendation available.</p>
        )}
      </div>
    </details>
  );
}

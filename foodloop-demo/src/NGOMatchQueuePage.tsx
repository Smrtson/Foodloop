import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  MessageSquareText,
  PackageCheck,
  Route as RouteIcon,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackAIModalCopy, matchQueueBatches } from "./data";
import type {
  AIModalAction,
  AIModalRequest,
  AIModalResponse,
  MatchActionState,
  MatchFactorKey,
  MatchQueueBatch,
  NGOCandidate,
  Role,
} from "./types";

const factorDefinitions: Array<{ key: MatchFactorKey; label: string }> = [
  { key: "compatibility", label: "Compatibility" },
  { key: "demand", label: "Demand" },
  { key: "distance", label: "Distance" },
  { key: "capacity", label: "Capacity" },
  { key: "urgencyFit", label: "Urgency fit" },
];

type ModalState =
  | {
      action: AIModalAction;
      batch: MatchQueueBatch;
      candidate: NGOCandidate;
      status: "loading";
    }
  | {
      action: AIModalAction;
      batch: MatchQueueBatch;
      candidate: NGOCandidate;
      status: "ready";
      response: AIModalResponse;
    };

function getSelectedCandidate(batch: MatchQueueBatch) {
  return (
    batch.candidates.find((candidate) => candidate.id === batch.selectedCandidateId) ??
    batch.candidates[0]
  );
}

function getFallbackResponse(action: AIModalAction): AIModalResponse {
  return {
    ...fallbackAIModalCopy[action],
    source: "fallback",
  };
}

function getActionStateLabel(state: MatchActionState) {
  switch (state) {
    case "accepted":
      return "Accepted. Route can be scheduled.";
    case "info-requested":
      return "More information requested from donor.";
    case "declined":
      return "Declined. FoodLoop should reroute.";
    default:
      return "Awaiting NGO action.";
  }
}

function getHandlingTone(priority: MatchQueueBatch["handlingPriority"]) {
  if (priority === "Low handling risk") {
    return "low";
  }

  if (priority === "Short window") {
    return "medium";
  }

  return "review";
}

function buildModalRequest(
  action: AIModalAction,
  role: Role,
  batch: MatchQueueBatch,
  candidate: NGOCandidate,
): AIModalRequest {
  return {
    action,
    role,
    batchId: batch.id,
    batchTitle: batch.title,
    candidateName: candidate.name,
    handlingPriority: batch.handlingPriority,
    context: [
      `Donor: ${batch.donorName}`,
      `Location: ${batch.donorLocation}`,
      `Items: ${batch.quantityLabel} of ${batch.itemDescription}`,
      `Pickup deadline: ${batch.pickupDeadline}`,
      `Handling priority: ${batch.handlingPriority}`,
      `Candidate: ${candidate.name}, ${candidate.district}`,
      `Demand: ${candidate.demandLabel}`,
      `Capacity: ${candidate.capacityLabel}`,
      `Reason: ${candidate.reason}`,
    ],
  };
}

function normaliseModalResponse(
  value: Partial<AIModalResponse>,
  action: AIModalAction,
): AIModalResponse {
  const fallback = getFallbackResponse(action);

  return {
    title: value.title || fallback.title,
    intro: value.intro || fallback.intro,
    message: value.message || fallback.message,
    nextSteps:
      Array.isArray(value.nextSteps) && value.nextSteps.length > 0
        ? value.nextSteps.filter(Boolean)
        : fallback.nextSteps,
    confidenceNote: value.confidenceNote || fallback.confidenceNote,
    source: value.source === "openrouter" ? "openrouter" : "fallback",
    model: value.model,
  };
}

async function requestAgentCopy(
  action: AIModalAction,
  role: Role,
  batch: MatchQueueBatch,
  candidate: NGOCandidate,
) {
  const payload = buildModalRequest(action, role, batch, candidate);
  const response = await fetch("/api/matching-agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Matching agent returned ${response.status}`);
  }

  return (await response.json()) as Partial<AIModalResponse>;
}

export function NGOMatchQueuePage({ activeRole }: { activeRole: Role }) {
  const [selectedBatchId, setSelectedBatchId] = useState(matchQueueBatches[0].id);
  const [actionStates, setActionStates] = useState<
    Record<string, MatchActionState>
  >({});
  const [modal, setModal] = useState<ModalState | null>(null);

  const selectedBatch =
    matchQueueBatches.find((batch) => batch.id === selectedBatchId) ??
    matchQueueBatches[0];
  const selectedCandidate = getSelectedCandidate(selectedBatch);
  const actionState = actionStates[selectedBatch.id] ?? "idle";

  const acceptedCount = useMemo(
    () =>
      Object.values(actionStates).filter((state) => state === "accepted").length,
    [actionStates],
  );

  const updateActionState = (
    batchId: string,
    nextState: MatchActionState,
  ) => {
    setActionStates((current) => ({
      ...current,
      [batchId]: nextState,
    }));
  };

  const handleAccept = () => {
    updateActionState(selectedBatch.id, "accepted");
  };

  const openAgentModal = async (action: AIModalAction) => {
    const batch = selectedBatch;
    const candidate = selectedCandidate;
    updateActionState(
      batch.id,
      action === "request-info" ? "info-requested" : "declined",
    );
    setModal({ action, batch, candidate, status: "loading" });

    try {
      const aiResponse = await requestAgentCopy(action, activeRole, batch, candidate);
      setModal({
        action,
        batch,
        candidate,
        status: "ready",
        response: normaliseModalResponse(aiResponse, action),
      });
    } catch {
      setModal({
        action,
        batch,
        candidate,
        status: "ready",
        response: getFallbackResponse(action),
      });
    }
  };

  return (
    <section className="page-stack match-page" aria-labelledby="matching-title">
      <div className="page-heading match-heading">
        <div>
          <p className="page-kicker">
            {activeRole === "ngo" ? "NGO opportunity queue" : "Donor match status"}
          </p>
          <h1 id="matching-title">NGO Match Queue</h1>
          <p>
            {activeRole === "ngo"
              ? "Review explainable batch opportunities and choose the right recipient action."
              : "Track how FoodLoop ranks recipients after your surplus batch is submitted."}
          </p>
        </div>

        <div className="heading-meta" aria-label="Match queue summary">
          <span>{activeRole === "ngo" ? "NGO view" : "Donor view"}</span>
          <span>{acceptedCount} accepted</span>
        </div>
      </div>

      <div className="match-overview-strip" aria-label="Queue overview">
        <OverviewMetric
          icon={PackageCheck}
          label="Open batches"
          value={`${matchQueueBatches.length}`}
          note="Ready for review"
        />
        <OverviewMetric
          icon={Users}
          label="Candidate NGOs"
          value="9"
          note="Fictional demo partners"
        />
        <OverviewMetric
          icon={Bot}
          label="Matching Agent"
          value="Explainable"
          note="Demand, distance, capacity"
        />
      </div>

      <div className="match-workspace-grid">
        <BatchQueue
          activeRole={activeRole}
          selectedBatchId={selectedBatch.id}
          actionStates={actionStates}
          onSelectBatch={setSelectedBatchId}
        />

        <div className="match-main-column">
          {activeRole === "ngo" ? (
            <NGOBatchDetail batch={selectedBatch} candidate={selectedCandidate} />
          ) : (
            <DonorBatchDetail
              batch={selectedBatch}
              actionState={actionState}
              candidate={selectedCandidate}
            />
          )}

          <MatchingAgentPanel batch={selectedBatch} candidate={selectedCandidate} />
        </div>

        {activeRole === "ngo" ? (
          <NGOActionPanel
            batch={selectedBatch}
            candidate={selectedCandidate}
            actionState={actionState}
            onAccept={handleAccept}
            onRequestInfo={() => openAgentModal("request-info")}
            onDecline={() => openAgentModal("decline")}
          />
        ) : (
          <DonorStatusPanel batch={selectedBatch} actionState={actionState} />
        )}
      </div>

      {modal ? (
        <AIAgentModal modal={modal} onClose={() => setModal(null)} />
      ) : null}
    </section>
  );
}

function OverviewMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="panel overview-metric">
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  );
}

function BatchQueue({
  activeRole,
  selectedBatchId,
  actionStates,
  onSelectBatch,
}: {
  activeRole: Role;
  selectedBatchId: string;
  actionStates: Record<string, MatchActionState>;
  onSelectBatch: (batchId: string) => void;
}) {
  return (
    <aside className="panel match-queue-panel" aria-label="Match batch queue">
      <div className="match-panel-heading">
        <div>
          <h2>{activeRole === "ngo" ? "Available batches" : "Submitted batches"}</h2>
          <p>
            {activeRole === "ngo"
              ? "Prioritized opportunities for recipient review."
              : "Your submitted records and their recipient progress."}
          </p>
        </div>
        <span>{matchQueueBatches.length} live</span>
      </div>

      <div className="match-card-list">
        {matchQueueBatches.map((batch) => {
          const isSelected = selectedBatchId === batch.id;
          const state = actionStates[batch.id] ?? "idle";

          return (
            <button
              key={batch.id}
              type="button"
              className={isSelected ? "match-card match-card-active" : "match-card"}
              aria-pressed={isSelected}
              onClick={() => onSelectBatch(batch.id)}
            >
              <span className="match-card-topline">
                <strong>{batch.title}</strong>
                <HandlingBadge priority={batch.handlingPriority} />
              </span>
              <span className="match-card-body">
                {batch.quantityLabel} from {batch.donorName}
              </span>
              <span className="match-card-meta">
                <Clock3 size={14} aria-hidden="true" />
                {batch.pickupDeadline}
              </span>
              <span className="match-card-state">{getActionStateLabel(state)}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function NGOBatchDetail({
  batch,
  candidate,
}: {
  batch: MatchQueueBatch;
  candidate: NGOCandidate;
}) {
  return (
    <section className="panel match-detail-panel" aria-labelledby="batch-detail-title">
      <div className="match-panel-heading">
        <div>
          <h2 id="batch-detail-title">{batch.title}</h2>
          <p>{batch.aiSummary}</p>
        </div>
        <HandlingBadge priority={batch.handlingPriority} />
      </div>

      <div className="batch-summary-grid">
        <SummaryTile label="Batch ID" value={batch.id} />
        <SummaryTile label="Quantity" value={batch.quantityLabel} />
        <SummaryTile label="Pickup" value={batch.pickupDeadline} />
        <SummaryTile label="Packaging" value={batch.packaging} />
        <SummaryTile label="Donor" value={batch.donorName} />
        <SummaryTile label="Location" value={batch.donorLocation} />
      </div>

      <div className="handling-note">
        <Info size={17} aria-hidden="true" />
        <p>{batch.handlingNotes}</p>
      </div>

      <div className="recipient-snapshot">
        <div>
          <span>Recommended recipient</span>
          <strong>{candidate.name}</strong>
          <p>{candidate.reason}</p>
        </div>
        <div className="score-lockup" aria-label={`${candidate.score} match score`}>
          <strong>{candidate.score}</strong>
          <span>score</span>
        </div>
      </div>
    </section>
  );
}

function DonorBatchDetail({
  batch,
  actionState,
  candidate,
}: {
  batch: MatchQueueBatch;
  actionState: MatchActionState;
  candidate: NGOCandidate;
}) {
  return (
    <section className="panel match-detail-panel" aria-labelledby="donor-match-title">
      <div className="match-panel-heading">
        <div>
          <h2 id="donor-match-title">Recipient ranking in progress</h2>
          <p>{batch.donorStatus}</p>
        </div>
        <HandlingBadge priority={batch.handlingPriority} />
      </div>

      <div className="donor-status-callout">
        <TrendingUp size={18} aria-hidden="true" />
        <div>
          <strong>{getActionStateLabel(actionState)}</strong>
          <span>{batch.routePreview}</span>
        </div>
      </div>

      <div className="candidate-rank-list" aria-label="Ranked NGO recommendations">
        {batch.candidates.map((candidateItem, index) => (
          <article
            key={candidateItem.id}
            className={
              candidateItem.id === candidate.id
                ? "candidate-row candidate-row-featured"
                : "candidate-row"
            }
          >
            <span className="candidate-rank">{index + 1}</span>
            <div>
              <strong>{candidateItem.name}</strong>
              <span>
                {candidateItem.district} - {candidateItem.distanceKm.toFixed(1)} km
              </span>
            </div>
            <div className="candidate-row-score">
              <strong>{candidateItem.score}</strong>
              <span>{candidateItem.progressStatus}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MatchingAgentPanel({
  batch,
  candidate,
}: {
  batch: MatchQueueBatch;
  candidate: NGOCandidate;
}) {
  return (
    <section className="panel matching-agent-panel" aria-labelledby="agent-panel-title">
      <div className="match-panel-heading">
        <div>
          <h2 id="agent-panel-title">AI Matching Agent</h2>
          <p>{batch.ngoFitExplanation}</p>
        </div>
        <span className="agent-score">{candidate.score}% fit</span>
      </div>

      <div className="factor-grid" aria-label="Match scoring factors">
        {factorDefinitions.map((factor) => (
          <FactorSignal
            key={factor.key}
            label={factor.label}
            value={candidate.factors[factor.key]}
          />
        ))}
      </div>

      <div className="capacity-grid" aria-label="NGO demand and capacity">
        <CapacityChip
          icon={Users}
          label="Demand"
          value={candidate.demandLabel}
        />
        <CapacityChip
          icon={Building2}
          label="Capacity"
          value={candidate.capacityLabel}
        />
        <CapacityChip
          icon={MapPin}
          label="Distance"
          value={`${candidate.distanceKm.toFixed(1)} km`}
        />
        <CapacityChip
          icon={Clock3}
          label="Window"
          value={candidate.serviceWindow}
        />
      </div>
    </section>
  );
}

function NGOActionPanel({
  batch,
  candidate,
  actionState,
  onAccept,
  onRequestInfo,
  onDecline,
}: {
  batch: MatchQueueBatch;
  candidate: NGOCandidate;
  actionState: MatchActionState;
  onAccept: () => void;
  onRequestInfo: () => void;
  onDecline: () => void;
}) {
  const isAccepted = actionState === "accepted";

  return (
    <aside className="panel match-action-panel" aria-label="NGO batch actions">
      <div className="match-panel-heading">
        <div>
          <h2>Recipient action</h2>
          <p>Confirm, ask for donor details, or release the batch to backups.</p>
        </div>
      </div>

      <div className="action-context">
        <span>Selected NGO</span>
        <strong>{candidate.name}</strong>
        <p>{candidate.reason}</p>
      </div>

      <div className="action-state-box">
        {isAccepted ? (
          <CheckCircle2 size={18} aria-hidden="true" />
        ) : actionState === "declined" ? (
          <XCircle size={18} aria-hidden="true" />
        ) : actionState === "info-requested" ? (
          <MessageSquareText size={18} aria-hidden="true" />
        ) : (
          <AlertTriangle size={18} aria-hidden="true" />
        )}
        <span>{getActionStateLabel(actionState)}</span>
      </div>

      <div className="match-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={onAccept}
        >
          <Check size={17} aria-hidden="true" />
          Accept Batch
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onRequestInfo}
        >
          <MessageSquareText size={17} aria-hidden="true" />
          Request More Info
        </button>
        <button
          type="button"
          className="button button-danger"
          onClick={onDecline}
        >
          <XCircle size={17} aria-hidden="true" />
          Decline
        </button>
      </div>

      {isAccepted ? (
        <Link to="/route" className="button button-secondary route-cta">
          <RouteIcon size={17} aria-hidden="true" />
          View Route
        </Link>
      ) : null}

      <div className="batch-mini-record">
        <span>{batch.id}</span>
        <strong>{batch.quantityLabel}</strong>
        <p>{batch.storageEvidence}</p>
      </div>
    </aside>
  );
}

function DonorStatusPanel({
  batch,
  actionState,
}: {
  batch: MatchQueueBatch;
  actionState: MatchActionState;
}) {
  return (
    <aside className="panel match-action-panel donor-progress-panel" aria-label="Donor recipient progress">
      <div className="match-panel-heading">
        <div>
          <h2>Recipient progress</h2>
          <p>{getActionStateLabel(actionState)}</p>
        </div>
      </div>

      <ol className="progress-list">
        {batch.recipientProgress.map((step) => (
          <li key={step.label} className={`progress-step progress-step-${step.status}`}>
            <span aria-hidden="true" />
            <strong>{step.label}</strong>
          </li>
        ))}
      </ol>

      <div className="donor-transparency-box">
        <Bot size={18} aria-hidden="true" />
        <div>
          <strong>Matching transparency</strong>
          <p>
            FoodLoop ranks recipients by compatibility, demand, distance,
            capacity, and urgency fit. Humans confirm the decision.
          </p>
        </div>
      </div>

      {actionState === "accepted" ? (
        <Link to="/route" className="button button-primary route-cta">
          <RouteIcon size={17} aria-hidden="true" />
          View Route
        </Link>
      ) : null}
    </aside>
  );
}

function FactorSignal({ label, value }: { label: string; value: number }) {
  const filledCount = Math.max(1, Math.round(value / 20));

  return (
    <div className="factor-signal">
      <div className="factor-signal-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div
        className="factor-segments"
        aria-label={`${label} score ${value} out of 100`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={`${label}-${index}`}
            className={index < filledCount ? "factor-segment-filled" : ""}
          />
        ))}
      </div>
    </div>
  );
}

function CapacityChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="capacity-chip">
      <Icon size={16} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HandlingBadge({
  priority,
}: {
  priority: MatchQueueBatch["handlingPriority"];
}) {
  return (
    <span className={`badge badge-${getHandlingTone(priority)}`}>{priority}</span>
  );
}

function AIAgentModal({
  modal,
  onClose,
}: {
  modal: ModalState;
  onClose: () => void;
}) {
  const response = modal.status === "ready" ? modal.response : null;
  const actionLabel =
    modal.action === "request-info" ? "Request More Info" : "Decline";

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="ai-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        <div className="ai-modal-header">
          <div>
            <span className="modal-action-label">{actionLabel}</span>
            <h2 id="ai-modal-title">
              {response ? response.title : "Generating AI draft"}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close modal"
            onClick={onClose}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="ai-modal-context">
          <span>{modal.batch.title}</span>
          <strong>{modal.candidate.name}</strong>
          <HandlingBadge priority={modal.batch.handlingPriority} />
        </div>

        {!response ? (
          <div className="modal-loading" role="status" aria-live="polite">
            <Sparkles size={18} aria-hidden="true" />
            <div>
              <strong>Calling the Matching Agent</strong>
              <span>Preparing structured modal copy for this action.</span>
            </div>
          </div>
        ) : (
          <>
            <div className="ai-modal-copy">
              <p>{response.intro}</p>
              <blockquote>{response.message}</blockquote>
            </div>

            <div className="modal-next-steps">
              <h3>Next steps</h3>
              <ul>
                {response.nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div className="modal-source-note">
              <Bot size={16} aria-hidden="true" />
              <span>
                {response.source === "openrouter"
                  ? `Generated with OpenRouter${response.model ? ` (${response.model})` : ""}.`
                  : "Using fallback demo copy."}{" "}
                {response.confidenceNote}
              </span>
            </div>
          </>
        )}

        <div className="ai-modal-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Close
          </button>
          {response ? (
            <button type="button" className="button button-primary" onClick={onClose}>
              <Send size={17} aria-hidden="true" />
              Use Draft
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

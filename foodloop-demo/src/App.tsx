import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  CalendarClock,
  Check,
  ClipboardCheck,
  Cpu,
  FileText,
  Gauge,
  Layers,
  Leaf,
  PackageCheck,
  Route as RouteIcon,
  Send,
  Sparkles,
  Thermometer,
  UploadCloud,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import bakeryPhoto from "./assets/wan-chai-bakery-surplus.png";
import {
  agentRecommendation,
  analyzedDraft,
  emptyDraft,
  forecastSummary,
  matchQueueBatches,
  pageMeta,
  sensorEvidence,
  stubContent,
} from "./data";
import { NGOMatchQueuePage } from "./NGOMatchQueuePage";
import { SharedImpactPage } from "./SharedImpactPage";
import { SharedRoutePage } from "./SharedRoutePage";
import type {
  AcceptedRouteMatch,
  BatchDraft,
  DemoPageId,
  IntakeStatus,
  MatchActionState,
  Role,
} from "./types";

type IntakeStage = "capture" | "review" | "confirm";

const pageIcons: Record<DemoPageId, LucideIcon> = {
  intake: ClipboardCheck,
  matching: Users,
  route: RouteIcon,
  impact: Gauge,
  architecture: Cpu,
};

const intakeStages: Array<{
  id: IntakeStage;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "capture",
    label: "Capture",
    description: "Photo and donor context",
    icon: UploadCloud,
  },
  {
    id: "review",
    label: "Review",
    description: "Editable AI draft",
    icon: Bot,
  },
  {
    id: "confirm",
    label: "Confirm",
    description: "Locked final check",
    icon: FileText,
  },
];

const getIntakeStageIndex = (stage: IntakeStage) =>
  intakeStages.findIndex((item) => item.id === stage);

const analysisDurationMs = 5000;

const analysisPhrases = [
  "FoodLoop is identifying food",
  "FoodLoop is estimating quantity",
  "FoodLoop is checking packaging",
  "FoodLoop is organising data",
  "FoodLoop is preparing your review draft",
];

const customItemOption = "Other / custom";

const bakeryItemPresets = [
  "Assorted buns, rolls, croissants",
  "Bread boxes",
  "Pastries and muffins",
  "Sandwiches and savouries",
  "Cakes and slices",
  "Mixed bakery surplus",
  customItemOption,
];

const datetimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const isSameLocalDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const formatPickupDeadline = (value: string) => {
  if (!value) {
    return "";
  }

  if (!datetimeLocalPattern.test(value)) {
    return value;
  }

  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) {
    return value;
  }

  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(deadline);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameLocalDate(deadline, today)) {
    return `Today, ${timeLabel}`;
  }

  if (isSameLocalDate(deadline, tomorrow)) {
    return `Tomorrow, ${timeLabel}`;
  }

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(deadline);

  return `${dateLabel}, ${timeLabel}`;
};

function App() {
  const [activeRole, setActiveRole] = useState<Role>("donor");
  const [selectedBatchId, setSelectedBatchId] = useState(matchQueueBatches[0].id);
  const [matchActionStates, setMatchActionStates] = useState<
    Record<string, MatchActionState>
  >({});
  const [receiptConfirmedByBatchId, setReceiptConfirmedByBatchId] = useState<
    Record<string, boolean>
  >({});

  const selectedBatch =
    matchQueueBatches.find((batch) => batch.id === selectedBatchId) ??
    matchQueueBatches[0];
  const selectedCandidate =
    selectedBatch.candidates.find(
      (candidate) => candidate.id === selectedBatch.selectedCandidateId,
    ) ?? selectedBatch.candidates[0];
  const acceptedRouteMatch: AcceptedRouteMatch | null =
    matchActionStates[selectedBatch.id] === "accepted"
      ? { batch: selectedBatch, candidate: selectedCandidate }
      : null;
  const isReceiptConfirmed = acceptedRouteMatch
    ? Boolean(receiptConfirmedByBatchId[acceptedRouteMatch.batch.id])
    : false;

  const updateMatchActionState = (
    batchId: string,
    nextState: MatchActionState,
  ) => {
    setMatchActionStates((current) => ({
      ...current,
      [batchId]: nextState,
    }));
  };

  const confirmReceiptForBatch = (batchId: string) => {
    setReceiptConfirmedByBatchId((current) => ({
      ...current,
      [batchId]: true,
    }));
  };

  return (
    <AppShell activeRole={activeRole} onRoleChange={setActiveRole}>
      <Routes>
        <Route path="/" element={<Navigate to="/intake" replace />} />
        <Route path="/intake" element={<DonorIntakePage activeRole={activeRole} />} />
        <Route
          path="/matching"
          element={
            <NGOMatchQueuePage
              activeRole={activeRole}
              selectedBatchId={selectedBatchId}
              actionStates={matchActionStates}
              onSelectBatch={setSelectedBatchId}
              onActionStateChange={updateMatchActionState}
            />
          }
        />
        <Route
          path="/route"
          element={
            <SharedRoutePage
              activeRole={activeRole}
              acceptedRouteMatch={acceptedRouteMatch}
              isReceiptConfirmed={isReceiptConfirmed}
              onReceiptConfirmed={confirmReceiptForBatch}
            />
          }
        />
        <Route
          path="/impact"
          element={
            <SharedImpactPage
              activeRole={activeRole}
              acceptedRouteMatch={acceptedRouteMatch}
              isReceiptConfirmed={isReceiptConfirmed}
            />
          }
        />
        <Route
          path="/architecture"
          element={<StubPage pageId="architecture" activeRole={activeRole} />}
        />
        <Route path="*" element={<Navigate to="/intake" replace />} />
      </Routes>
    </AppShell>
  );
}

function AppShell({
  activeRole,
  onRoleChange,
  children,
}: {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
  children: ReactNode;
}) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar />
      <div className="workspace">
        <TopBar activeRole={activeRole} onRoleChange={onRoleChange} />
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Demo navigation">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <Leaf size={22} />
        </div>
        <div>
          <span className="brand-name">FoodLoop</span>
          <span className="brand-product">RescueCore</span>
        </div>
      </div>

      <nav className="side-nav" aria-label="Primary demo pages">
        {pageMeta.map((page) => {
          const Icon = pageIcons[page.id];

          return (
            <NavLink
              key={page.id}
              to={page.path}
              className={({ isActive }) =>
                isActive ? "nav-item nav-item-active" : "nav-item"
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{page.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-note">
        <Bot size={18} aria-hidden="true" />
        <p>AI is decision support only; humans confirm key decisions.</p>
      </div>
    </aside>
  );
}

function TopBar({
  activeRole,
  onRoleChange,
}: {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
}) {
  const location = useLocation();
  const currentPage = useMemo(
    () =>
      pageMeta.find((page) => location.pathname.startsWith(page.path)) ??
      pageMeta[0],
    [location.pathname],
  );

  useEffect(() => {
    document.title = `FoodLoop RescueCore - ${currentPage.label}`;
  }, [currentPage.label]);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>FoodLoop RescueCore</span>
        <span>{currentPage.label}</span>
      </div>

      <div className="topbar-actions" aria-label="Demo controls">
        <div className="role-switcher" aria-label="Role switcher">
          {(["donor", "ngo"] as const).map((role) => (
            <button
              key={role}
              type="button"
              className={activeRole === role ? "role-active" : ""}
              aria-pressed={activeRole === role}
              onClick={() => onRoleChange(role)}
            >
              {role === "donor" ? "Donor" : "NGO"}
            </button>
          ))}
        </div>

        <div className="demo-status" aria-label="Current demo status">
          <Gauge size={16} aria-hidden="true" />
          <span>{currentPage.status}</span>
        </div>
      </div>
    </header>
  );
}

function DonorIntakePage({ activeRole }: { activeRole: Role }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<BatchDraft>(emptyDraft);
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("");
  const [activeStage, setActiveStage] = useState<IntakeStage>("capture");
  const [highestStageIndex, setHighestStageIndex] = useState(0);
  const [analysisPhraseIndex, setAnalysisPhraseIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const batchId = "FL-WC-0625-014";

  const isAnalyzing = status === "analyzing";
  const isDrafted = status === "drafted" || status === "submitted";
  const isSubmitted = status === "submitted";

  const unlockStage = (stage: IntakeStage) => {
    setHighestStageIndex((current) =>
      Math.max(current, getIntakeStageIndex(stage)),
    );
  };

  useEffect(() => {
    if (status !== "analyzing") {
      return undefined;
    }

    const startedAt = window.performance.now();
    const intervalId = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const nextProgress = Math.min(100, (elapsed / analysisDurationMs) * 100);
      const nextPhraseIndex = Math.min(
        analysisPhrases.length - 1,
        Math.floor((elapsed / analysisDurationMs) * analysisPhrases.length),
      );

      setAnalysisProgress(nextProgress);
      setAnalysisPhraseIndex(nextPhraseIndex);
    }, 100);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setDraft(analyzedDraft);
      setStatus("drafted");
      setLastAnalyzed(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
      );
      setAnalysisProgress(100);
      setAnalysisPhraseIndex(analysisPhrases.length - 1);
      setActiveStage("review");
      setHighestStageIndex((current) =>
        Math.max(current, getIntakeStageIndex("review")),
      );
    }, analysisDurationMs);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [status]);

  const handleAnalyze = () => {
    setDraft({ ...emptyDraft });
    setStatus("analyzing");
    setLastAnalyzed("");
    setAnalysisPhraseIndex(0);
    setAnalysisProgress(0);
    setActiveStage("capture");
    setHighestStageIndex(getIntakeStageIndex("capture"));
  };

  const handleContinueToConfirm = () => {
    setActiveStage("confirm");
    unlockStage("confirm");
  };

  const handleDraftValueChange = (field: keyof BatchDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (status === "idle" || status === "analyzing") {
      setStatus("drafted");
      unlockStage("review");
    }
  };

  const handleFieldChange =
    (field: keyof BatchDraft) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      handleDraftValueChange(field, event.target.value);
    };

  const handleReturnToEdit = () => {
    setActiveStage("review");
  };

  const handleSubmit = () => {
    if (!draft.category) {
      setDraft(analyzedDraft);
    }
    setStatus("submitted");
    navigate("/matching");
  };

  const handleStageSelect = (stage: IntakeStage) => {
    if (!isAnalyzing && getIntakeStageIndex(stage) <= highestStageIndex) {
      setActiveStage(stage);
    }
  };

  const renderStagePanel = () => {
    switch (activeStage) {
      case "capture":
        return (
          <CaptureStagePanel
            isDrafted={isDrafted}
            isAnalyzing={isAnalyzing}
            lastAnalyzed={lastAnalyzed}
            analysisPhrase={analysisPhrases[analysisPhraseIndex]}
            analysisPhraseIndex={analysisPhraseIndex}
            analysisProgress={analysisProgress}
            onAnalyze={handleAnalyze}
          />
        );
      case "review":
        return (
          <ReviewStagePanel
            draft={draft}
            isDrafted={isDrafted}
            onFieldChange={handleFieldChange}
            onValueChange={handleDraftValueChange}
            onContinue={handleContinueToConfirm}
          />
        );
      case "confirm":
        return (
          <ConfirmStagePanel
            draft={draft}
            status={status}
            onReturnToEdit={handleReturnToEdit}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="page-stack" aria-labelledby="intake-title">
      <div className="page-heading">
        <div>
          <p className="page-kicker">Wan Chai donor workflow</p>
          <h1 id="intake-title">Donor Intake</h1>
          <p>
            Capture bakery surplus, review the AI draft, and submit a confirmed
            batch for matching.
          </p>
        </div>

        <div className="heading-meta" aria-label="Current role context">
          <span>{activeRole === "donor" ? "Donor view" : "NGO role active"}</span>
          <span>Sunrise Bakery</span>
        </div>
      </div>

      <div className="intake-shell">
        <IntakeProgressRail
          activeStage={activeStage}
          highestStageIndex={highestStageIndex}
          isLocked={isAnalyzing}
          onStageSelect={handleStageSelect}
        />

        <div className="intake-stage-layout">
          <div className="intake-stage-main">{renderStagePanel()}</div>
          <IntakeReceipt
            activeStage={activeStage}
            status={status}
            batchId={batchId}
            draft={draft}
            lastAnalyzed={lastAnalyzed}
            isSubmitted={isSubmitted}
          />
        </div>
      </div>
    </section>
  );
}

function IntakeProgressRail({
  activeStage,
  highestStageIndex,
  isLocked,
  onStageSelect,
}: {
  activeStage: IntakeStage;
  highestStageIndex: number;
  isLocked: boolean;
  onStageSelect: (stage: IntakeStage) => void;
}) {
  return (
    <nav className="intake-progress" aria-label="Donor intake progress">
      {intakeStages.map((stage, index) => {
        const Icon = stage.icon;
        const isActive = activeStage === stage.id;
        const isComplete = index < highestStageIndex;
        const isAvailable = !isLocked && index <= highestStageIndex;
        const stateText =
          isLocked && isActive
            ? "Analyzing"
            : isLocked
              ? "Locked"
              : isActive
                ? "Current"
                : isComplete
                  ? "Complete"
                  : isAvailable
                    ? "Available"
                    : "Locked";

        return (
          <button
            key={stage.id}
            type="button"
            className={[
              "stage-tab",
              isActive ? "stage-tab-active" : "",
              isComplete ? "stage-tab-complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={!isAvailable}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onStageSelect(stage.id)}
          >
            <span className="stage-tab-icon" aria-hidden="true">
              <Icon size={17} />
            </span>
            <span className="stage-tab-copy">
              <strong>{stage.label}</strong>
              <small>{stage.description}</small>
            </span>
            <span className="stage-tab-state">
              {isComplete ? <Check size={15} aria-hidden="true" /> : stateText}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function CaptureStagePanel({
  isDrafted,
  isAnalyzing,
  lastAnalyzed,
  analysisPhrase,
  analysisPhraseIndex,
  analysisProgress,
  onAnalyze,
}: {
  isDrafted: boolean;
  isAnalyzing: boolean;
  lastAnalyzed: string;
  analysisPhrase: string;
  analysisPhraseIndex: number;
  analysisProgress: number;
  onAnalyze: () => void;
}) {
  return (
    <section className="panel stage-panel capture-stage" aria-labelledby="photo-panel-title">
      <PanelTitle
        id="photo-panel-title"
        icon={UploadCloud}
        title="Capture surplus photo"
        actionText={
          isAnalyzing
            ? "Analyzing photo"
            : isDrafted
              ? `Analyzed ${lastAnalyzed}`
              : "Start here"
        }
      />
      <div className="capture-grid">
        <div>
          <div
            className={[
              "photo-frame",
              "capture-photo",
              isAnalyzing ? "analysis-photo-frame" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <img
              src={bakeryPhoto}
              alt="Sealed bakery surplus in green crates at a Wan Chai bakery counter"
            />
            {isAnalyzing ? (
              <div className="scanner-overlay" aria-hidden="true">
                <span className="scanner-grid" />
                <span className="scanner-line" />
              </div>
            ) : null}
          </div>
          <div className="photo-meta">
            <span>Wan Chai bakery photo</span>
            <span>JPG, 2.4 MB</span>
          </div>
        </div>

        <div className="capture-copy">
          {isAnalyzing ? (
            <AnalysisLoadingPanel
              phrase={analysisPhrase}
              phraseIndex={analysisPhraseIndex}
              progress={analysisProgress}
            />
          ) : (
            <>
              <h3>Photo intake for Sunrise Bakery</h3>
              <p>
                Use the supplied photo to draft category, items, quantity, and
                pickup timing.
              </p>
            </>
          )}
          <dl className="context-list">
            <div>
              <dt>Donor</dt>
              <dd>{emptyDraft.donorName}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{emptyDraft.location}</dd>
            </div>
            <div>
              <dt>Holding</dt>
              <dd>{emptyDraft.holdingStatus}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="button button-primary button-workflow"
            disabled={isAnalyzing}
            onClick={onAnalyze}
          >
            <Sparkles size={17} aria-hidden="true" />
            {isAnalyzing ? "Analyzing Photo" : "Analyze Photo"}
          </button>
          <p className="helper-copy">
            FoodLoop prepares a draft for donor review before matching begins.
          </p>
        </div>
      </div>
    </section>
  );
}

function AnalysisLoadingPanel({
  phrase,
  phraseIndex,
  progress,
}: {
  phrase: string;
  phraseIndex: number;
  progress: number;
}) {
  const visibleProgress = Math.max(4, progress);

  return (
    <div className="analysis-card" role="status" aria-live="polite">
      <div className="analysis-card-heading">
        <span className="analysis-icon" aria-hidden="true">
          <Bot size={18} />
        </span>
        <div>
          <h3>Preparing review draft</h3>
          <p>{phrase}</p>
        </div>
      </div>

      <div className="analysis-progress" aria-label={`${Math.round(progress)}% complete`}>
        <span style={{ width: `${visibleProgress}%` }} />
      </div>

      <div className="analysis-steps" aria-label="Analysis progress steps">
        {analysisPhrases.map((step, index) => (
          <span
            key={step}
            className={index <= phraseIndex ? "analysis-step-active" : ""}
            aria-label={step}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewStagePanel({
  isDrafted,
  draft,
  onFieldChange,
  onValueChange,
  onContinue,
}: {
  isDrafted: boolean;
  draft: BatchDraft;
  onFieldChange: (
    field: keyof BatchDraft,
  ) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onValueChange: (field: keyof BatchDraft, value: string) => void;
  onContinue: () => void;
}) {
  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <form
      className="panel stage-panel batch-form review-stage"
      aria-labelledby="review-form-title"
      onSubmit={handleReviewSubmit}
    >
      <div className="form-header">
        <PanelTitle
          id="review-form-title"
          icon={Bot}
          title="Edit AI intake draft"
          actionText={
            isDrafted
              ? `${agentRecommendation.confidence}% draft confidence`
              : "Awaiting photo"
          }
        />
        <Badge tone="review">Editable review</Badge>
      </div>

      <div className="agent-copy">
        <p>
          {isDrafted
            ? agentRecommendation.summary
            : "Analyze the photo to prepare a donor-editable review draft."}
        </p>
      </div>

      <div className="evidence-chip-grid" aria-label="Forecast and evidence">
        <EvidenceChip
          icon={CalendarClock}
          label="Forecast"
          value={forecastSummary.predictedBand}
          supporting={`${forecastSummary.confidence}% confidence`}
        />
        <EvidenceChip
          icon={Building2}
          label="Storage"
          value={draft.storageLocation || sensorEvidence.storageLocation}
          supporting={forecastSummary.likelyWindow}
        />
        <EvidenceChip
          icon={Thermometer}
          label="Temperature"
          value={draft.temperatureStatus || sensorEvidence.temperature}
          supporting={sensorEvidence.lastReadingAt}
        />
        <EvidenceChip
          icon={Layers}
          label="Sensor"
          value={draft.sensorAttachment || sensorEvidence.sensorAttachment}
          supporting={sensorEvidence.holdingStatus}
        />
      </div>
      <div className="agent-footer">
        <Badge tone={isDrafted ? "low" : "review"}>
          {isDrafted ? draft.handlingPriority : "Needs confirmation"}
        </Badge>
        <span>{agentRecommendation.requiredConfirmation}</span>
      </div>

      <div className="form-grid">
        <Field
          id="category"
          label="Food category"
          helper="Use the operational category NGOs will see."
          value={draft.category}
          onChange={onFieldChange("category")}
        />
        <SpecificItemsField
          id="itemDescription"
          label="Specific items"
          helper="Summarize visible items in the batch."
          value={draft.itemDescription}
          onValueChange={(value) => onValueChange("itemDescription", value)}
        />
        <NumberField
          id="quantity"
          label="Quantity"
          helper="Editable estimate from the photo draft."
          value={draft.quantity}
          onChange={onFieldChange("quantity")}
        />
        <SelectField
          id="unit"
          label="Unit"
          helper="Measurement shown to NGO partners."
          value={draft.unit}
          onChange={onFieldChange("unit")}
          options={["items", "kg", "trays", "boxes"]}
        />
        <DateTimeField
          id="pickupDeadline"
          label="Pickup deadline"
          helper="Latest preferred collection time."
          value={draft.pickupDeadline}
          onChange={onFieldChange("pickupDeadline")}
        />
        <Field
          id="storageLocation"
          label="Storage location"
          helper="Pickup team handoff location."
          value={draft.storageLocation}
          onChange={onFieldChange("storageLocation")}
        />
        <TextAreaField
          id="donorNotes"
          label="Donor notes for NGOs"
          helper="Keep pickup details concise."
          value={draft.donorNotes}
          onChange={onFieldChange("donorNotes")}
        />
      </div>

      <details className="secondary-details">
        <summary>Operational details</summary>
        <div className="form-grid secondary-form-grid">
          <Field
            id="packaging"
            label="Packaging"
            helper="Visible packaging or container state."
            value={draft.packaging}
            onChange={onFieldChange("packaging")}
          />
          <Field
            id="preparedTime"
            label="Prepared time"
            helper="When the batch was packed or prepared."
            value={draft.preparedTime}
            onChange={onFieldChange("preparedTime")}
          />
          <Field
            id="temperatureStatus"
            label="Temperature and holding"
            helper="Evidence visible to matching partners."
            value={draft.temperatureStatus}
            onChange={onFieldChange("temperatureStatus")}
          />
          <Field
            id="sensorAttachment"
            label="Sensor attachment"
            helper="Optional device or photo evidence."
            value={draft.sensorAttachment}
            onChange={onFieldChange("sensorAttachment")}
          />
          <SelectField
            id="handlingPriority"
            label="Handling priority"
            helper="Review state, not a verdict."
            value={draft.handlingPriority}
            onChange={onFieldChange("handlingPriority")}
            options={["Low handling risk", "Needs confirmation", "Short window"]}
          />
        </div>
      </details>

      <div className="form-footer review-form-footer">
        <p>Adjust any draft fields before the final locked checkpoint.</p>
        <button
          type="submit"
          className="button button-primary button-workflow"
          disabled={!isDrafted}
        >
          <ArrowRight size={17} aria-hidden="true" />
          Continue to Confirm
        </button>
      </div>
    </form>
  );
}

function EvidenceChip({
  icon: Icon,
  label,
  value,
  supporting,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  supporting: string;
}) {
  return (
    <div className="evidence-chip">
      <Icon size={17} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{supporting}</small>
      </div>
    </div>
  );
}

function ConfirmStagePanel({
  draft,
  status,
  onReturnToEdit,
  onSubmit,
}: {
  draft: BatchDraft;
  status: IntakeStatus;
  onReturnToEdit: () => void;
  onSubmit: () => void;
}) {
  const quantityLabel = draft.quantity
    ? `${draft.quantity} ${draft.unit}`
    : "Not provided";

  return (
    <section
      className="panel stage-panel confirm-summary"
      aria-labelledby="confirm-summary-title"
    >
      <div className="form-header">
        <PanelTitle
          id="confirm-summary-title"
          icon={FileText}
          title="Confirm locked batch"
          actionText="Final checkpoint"
        />
        <Badge tone={status === "submitted" ? "routing" : "review"}>
          {status === "submitted" ? "Pending match" : "Ready to submit"}
        </Badge>
      </div>

      <div className="locked-note">
        <Check size={17} aria-hidden="true" />
        <p>Final donor record locked for the matching handoff.</p>
      </div>

      <section className="summary-section" aria-labelledby="core-summary-title">
        <h3 id="core-summary-title">Core details</h3>
        <dl className="summary-grid">
          <ReadOnlySummaryItem label="Donor" value={draft.donorName} />
          <ReadOnlySummaryItem label="Location" value={draft.location} />
          <ReadOnlySummaryItem label="Food category" value={draft.category} />
          <ReadOnlySummaryItem
            label="Specific items"
            value={draft.itemDescription}
          />
          <ReadOnlySummaryItem label="Quantity" value={quantityLabel} />
          <ReadOnlySummaryItem
            label="Pickup deadline"
            value={formatPickupDeadline(draft.pickupDeadline)}
          />
          <ReadOnlySummaryItem
            label="Storage location"
            value={draft.storageLocation}
          />
          <ReadOnlySummaryItem
            label="Donor notes for NGOs"
            value={draft.donorNotes}
            wide
          />
        </dl>
      </section>

      <section
        className="summary-section"
        aria-labelledby="operations-summary-title"
      >
        <h3 id="operations-summary-title">Operational details</h3>
        <dl className="summary-grid">
          <ReadOnlySummaryItem label="Packaging" value={draft.packaging} />
          <ReadOnlySummaryItem label="Prepared time" value={draft.preparedTime} />
          <ReadOnlySummaryItem
            label="Temperature and holding"
            value={draft.temperatureStatus}
          />
          <ReadOnlySummaryItem
            label="Sensor attachment"
            value={draft.sensorAttachment}
          />
          <ReadOnlySummaryItem
            label="Handling priority"
            value={draft.handlingPriority}
            wide
          />
        </dl>
      </section>

      <div className="confirm-actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onReturnToEdit}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Return to Edit
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={onSubmit}
        >
          <Send size={17} aria-hidden="true" />
          Confirm & Submit
        </button>
      </div>
    </section>
  );
}

function ReadOnlySummaryItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "summary-item summary-item-wide" : "summary-item"}>
      <dt>{label}</dt>
      <dd>{value || "Not provided"}</dd>
    </div>
  );
}

function IntakeReceipt({
  activeStage,
  status,
  batchId,
  draft,
  lastAnalyzed,
  isSubmitted,
}: {
  activeStage: IntakeStage;
  status: IntakeStatus;
  batchId: string;
  draft: BatchDraft;
  lastAnalyzed: string;
  isSubmitted: boolean;
}) {
  const activeStageLabel =
    intakeStages.find((stage) => stage.id === activeStage)?.label ?? "Capture";
  const statusLabel =
    status === "submitted"
      ? "Submitted"
      : status === "analyzing"
        ? "Analyzing photo"
      : status === "drafted"
        ? "Draft ready"
        : "Awaiting photo";
  const nextAction =
    activeStage === "capture"
      ? status === "analyzing"
        ? "Preparing review draft"
        : "Analyze the photo"
      : activeStage === "review"
        ? "Continue to Confirm"
        : "Confirm & Submit";

  return (
    <aside className="panel intake-receipt" aria-label="Intake receipt">
      <PanelTitle
        icon={PackageCheck}
        title="Batch receipt"
        actionText={activeStageLabel}
      />
      <div className="receipt-status">
        <Badge tone={isSubmitted ? "routing" : "review"}>{statusLabel}</Badge>
        {status === "analyzing" ? (
          <span>Analyzing now</span>
        ) : lastAnalyzed ? (
          <span>Analyzed {lastAnalyzed}</span>
        ) : (
          <span>Not analyzed</span>
        )}
      </div>
      <dl className="receipt-list">
        <div>
          <dt>Batch ID</dt>
          <dd>{batchId}</dd>
        </div>
        <div>
          <dt>Donor</dt>
          <dd>{draft.donorName}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{draft.category || "Awaiting analysis"}</dd>
        </div>
        <div>
          <dt>Items</dt>
          <dd>{draft.itemDescription || "Awaiting analysis"}</dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>{draft.quantity ? `${draft.quantity} ${draft.unit}` : "Awaiting analysis"}</dd>
        </div>
        <div>
          <dt>Pickup</dt>
          <dd>
            {formatPickupDeadline(draft.pickupDeadline) ||
              "Awaiting confirmation"}
          </dd>
        </div>
      </dl>
      <div className="receipt-next">
        <span>Next action</span>
        <strong>{nextAction}</strong>
      </div>
    </aside>
  );
}

function Field({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={value} onChange={onChange} />
      <small>{helper}</small>
    </div>
  );
}

function SpecificItemsField({
  id,
  label,
  helper,
  value,
  onValueChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const presetMatch = bakeryItemPresets.includes(value);
  const selectedValue = presetMatch ? value : customItemOption;
  const isCustom = selectedValue === customItemOption;
  const helperId = `${id}-helper`;

  return (
    <div className="field specific-items-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={selectedValue}
        aria-describedby={helperId}
        onChange={(event) =>
          onValueChange(
            event.target.value === customItemOption ? "" : event.target.value,
          )
        }
      >
        {bakeryItemPresets.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {isCustom ? (
        <input
          className="custom-item-input"
          value={presetMatch ? "" : value}
          aria-label="Custom specific items"
          aria-describedby={helperId}
          placeholder="Enter custom items"
          onChange={(event) => onValueChange(event.target.value)}
        />
      ) : null}
      <small id={helperId}>{helper}</small>
    </div>
  );
}

function NumberField({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        value={value}
        onChange={onChange}
      />
      <small>{helper}</small>
    </div>
  );
}

function DateTimeField({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="field date-time-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="datetime-local" value={value} onChange={onChange} />
      <small>{helper}</small>
    </div>
  );
}

function SelectField({
  id,
  label,
  helper,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <small>{helper}</small>
    </div>
  );
}

function TextAreaField({
  id,
  label,
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="field field-wide">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={3} value={value} onChange={onChange} />
      <small>{helper}</small>
    </div>
  );
}

function StubPage({
  pageId,
  activeRole,
}: {
  pageId: Exclude<DemoPageId, "intake">;
  activeRole: Role;
}) {
  const content = stubContent[pageId];
  const Icon = pageIcons[pageId];

  return (
    <section className="page-stack" aria-labelledby={`${pageId}-title`}>
      <div className="page-heading stub-heading">
        <div>
          <p className="page-kicker">Develop later</p>
          <h1 id={`${pageId}-title`}>{content.title}</h1>
          <p>{content.summary}</p>
        </div>
        <div className="heading-meta">
          <span>{activeRole === "donor" ? "Donor role" : "NGO role"}</span>
          <span>Wan Chai demo data</span>
        </div>
      </div>

      <div className="stub-grid">
        <section className="panel stub-hero" aria-label={`${content.title} plan`}>
          <Icon size={42} aria-hidden="true" />
          <div>
            <h2>Polished stub ready for the next pass</h2>
            <p>
              The navigation, role switcher, and page route are live. This page is
              intentionally reserved while Donor Intake gets the full workflow.
            </p>
          </div>
          <Link to="/intake" className="button button-secondary">
            <ClipboardCheck size={17} aria-hidden="true" />
            Back to Intake
          </Link>
        </section>

        <div className="stub-card-grid">
          {content.cards.map((card) => (
            <article key={card.label} className="panel stub-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PanelTitle({
  id,
  icon: Icon,
  title,
  actionText,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  actionText: string;
}) {
  return (
    <div className="panel-title">
      <div>
        <Icon size={18} aria-hidden="true" />
        <h2 id={id}>{title}</h2>
      </div>
      <span>{actionText}</span>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "low" | "medium" | "urgent" | "review" | "routing";
  children: ReactNode;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export default App;

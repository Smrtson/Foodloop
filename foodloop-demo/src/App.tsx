import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
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
import {
  buildFallbackMatchRankResponse,
  buildGeneratedBatchFromDraft,
  getCandidatePoolForScenario,
  getPhotoScenario,
  matchQueueBatches,
  pageMeta,
  photoScenarios,
} from "./data";
import { AIOutputViewer } from "./AIOutputViewer";
import {
  aiSkillList,
  aiSkillRegistry,
  getSkillMetadata,
  skillFlow,
} from "./ai/skillRegistry";
import { NGOMatchQueuePage } from "./NGOMatchQueuePage";
import { SharedImpactPage } from "./SharedImpactPage";
import { SharedRoutePage } from "./SharedRoutePage";
import type {
  AcceptedRouteMatch,
  AgentRecommendation,
  AISource,
  BatchDraft,
  DemoPageId,
  ForecastSummary,
  ImpactAgentSummary,
  IntakeAgentResponse,
  IntakeStatus,
  MatchActionState,
  MatchQueueBatch,
  MatchRankAgentResponse,
  PhotoScenario,
  Role,
  ScenarioId,
  SensorEvidence,
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

const itemDescriptionPresets = [
  "Assorted buns, rolls, croissants",
  "Bread boxes",
  "Pastries and muffins",
  "Sandwiches and savouries",
  "Wrapped egg, tuna, and salad sandwiches",
  "Chilled ready-to-eat packs",
  "Cakes and slices",
  "Mixed apple, orange, and pear boxes",
  "Stacked cardboard fruit boxes",
  "Mixed bakery surplus",
  customItemOption,
];

const minimumAgentDelayMs = 650;
const liveAgentRequestAttempts = 3;
const liveAgentRetryDelayMs = 900;

const wait = (durationMs: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });

const sourceLabel = (source?: AISource | null) =>
  source === "openrouter" ? "FoodLoop AI recommendation" : "Fallback demo data";

const getScenarioFallbackIntake = (
  scenario: PhotoScenario,
  detail?: string,
): IntakeAgentResponse => ({
  draft: scenario.fallbackDraft,
  recommendation: {
    ...scenario.fallbackRecommendation,
    summary: detail
      ? `${scenario.fallbackRecommendation.summary} ${detail}`
      : scenario.fallbackRecommendation.summary,
  },
  forecast: scenario.forecast,
  sensorEvidence: scenario.sensorEvidence,
  source: "fallback",
  ...getSkillMetadata("intake", ["handling-risk", "forecast"]),
});

const normaliseIntakeResponse = (
  value: Partial<IntakeAgentResponse>,
  scenario: PhotoScenario,
): IntakeAgentResponse => {
  const source = value.source === "openrouter" ? "openrouter" : "fallback";

  return {
    draft: {
      ...scenario.fallbackDraft,
      ...value.draft,
      handlingPriority:
        value.draft?.handlingPriority ?? scenario.fallbackDraft.handlingPriority,
    },
    recommendation: {
      ...scenario.fallbackRecommendation,
      ...value.recommendation,
      handlingPriority:
        value.recommendation?.handlingPriority ??
        value.draft?.handlingPriority ??
        scenario.fallbackRecommendation.handlingPriority,
    },
    forecast: {
      ...scenario.forecast,
      ...value.forecast,
    },
    sensorEvidence: {
      ...scenario.sensorEvidence,
      ...value.sensorEvidence,
    },
    source,
    model: value.model,
    modelOutput: source === "openrouter" ? value.modelOutput : undefined,
    skillId: value.skillId,
    skillName: value.skillName,
    skillVersion: value.skillVersion,
    guarded: value.guarded,
    supportingSkills: value.supportingSkills,
  };
};

async function requestIntakeDraft(
  scenario: PhotoScenario,
): Promise<IntakeAgentResponse> {
  let fallbackResult: IntakeAgentResponse | null = null;

  for (let attempt = 0; attempt < liveAgentRequestAttempts; attempt += 1) {
    const response = await fetch("/api/intake-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario }),
    });

    if (!response.ok) {
      throw new Error(`Intake agent returned ${response.status}`);
    }

    const result = normaliseIntakeResponse(
      (await response.json()) as Partial<IntakeAgentResponse>,
      scenario,
    );

    if (result.source === "openrouter") {
      return result;
    }

    fallbackResult = result;

    if (attempt < liveAgentRequestAttempts - 1) {
      await wait(liveAgentRetryDelayMs);
    }
  }

  return fallbackResult ?? getScenarioFallbackIntake(scenario);
}

async function requestMatchRanking(
  scenario: PhotoScenario,
  draft: BatchDraft,
): Promise<MatchRankAgentResponse> {
  const fallback = buildFallbackMatchRankResponse(scenario.id, draft);
  let fallbackResult: MatchRankAgentResponse | null = null;

  for (let attempt = 0; attempt < liveAgentRequestAttempts; attempt += 1) {
    const response = await fetch("/api/match-rank-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scenario,
        batchDraft: draft,
        candidatePool: getCandidatePoolForScenario(scenario.id),
      }),
    });

    if (!response.ok) {
      throw new Error(`Match ranking agent returned ${response.status}`);
    }

    const value = (await response.json()) as Partial<MatchRankAgentResponse>;
    const source = value.source === "openrouter" ? "openrouter" : "fallback";
    const result: MatchRankAgentResponse = {
      candidates:
        Array.isArray(value.candidates) && value.candidates.length > 0
          ? value.candidates
          : fallback.candidates,
      aiSummary: value.aiSummary || fallback.aiSummary,
      ngoFitExplanation: value.ngoFitExplanation || fallback.ngoFitExplanation,
      handlingNotes: value.handlingNotes || fallback.handlingNotes,
      routePreview: value.routePreview || fallback.routePreview,
      source,
      model: value.model,
      modelOutput: source === "openrouter" ? value.modelOutput : undefined,
      skillId: value.skillId,
      skillName: value.skillName,
      skillVersion: value.skillVersion,
      guarded: value.guarded,
      supportingSkills: value.supportingSkills,
    };

    if (result.source === "openrouter") {
      return result;
    }

    fallbackResult = result;

    if (attempt < liveAgentRequestAttempts - 1) {
      await wait(liveAgentRetryDelayMs);
    }
  }

  return fallbackResult ?? fallback;
}

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
  const [queueBatches, setQueueBatches] =
    useState<MatchQueueBatch[]>(matchQueueBatches);
  const [nextGeneratedSequence, setNextGeneratedSequence] = useState(1);
  const [selectedBatchId, setSelectedBatchId] = useState(matchQueueBatches[0].id);
  const [matchActionStates, setMatchActionStates] = useState<
    Record<string, MatchActionState>
  >({});
  const [receiptConfirmedByBatchId, setReceiptConfirmedByBatchId] = useState<
    Record<string, boolean>
  >({});
  const [impactSummariesByBatchId, setImpactSummariesByBatchId] = useState<
    Record<string, ImpactAgentSummary>
  >({});

  const selectedBatch =
    queueBatches.find((batch) => batch.id === selectedBatchId) ?? queueBatches[0];
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

  const appendGeneratedBatch = (
    scenario: PhotoScenario,
    draft: BatchDraft,
    matchResponse: MatchRankAgentResponse,
  ) => {
    const nextBatch = buildGeneratedBatchFromDraft({
      scenario,
      draft,
      matchResponse,
      sequence: nextGeneratedSequence,
    });

    setNextGeneratedSequence((current) => current + 1);
    setQueueBatches((current) => [...current, nextBatch]);
    setSelectedBatchId(nextBatch.id);
    setMatchActionStates((current) => ({
      ...current,
      [nextBatch.id]: "idle",
    }));

    return nextBatch.id;
  };

  const cacheImpactSummary = (batchId: string, summary: ImpactAgentSummary) => {
    setImpactSummariesByBatchId((current) => ({
      ...current,
      [batchId]: summary,
    }));
  };

  return (
    <AppShell activeRole={activeRole} onRoleChange={setActiveRole}>
      <Routes>
        <Route path="/" element={<Navigate to="/intake" replace />} />
        <Route
          path="/intake"
          element={
            <DonorIntakePage
              activeRole={activeRole}
              onGeneratedBatchSubmit={appendGeneratedBatch}
            />
          }
        />
        <Route
          path="/matching"
          element={
            <NGOMatchQueuePage
              activeRole={activeRole}
              batches={queueBatches}
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
              impactSummary={
                acceptedRouteMatch
                  ? impactSummariesByBatchId[acceptedRouteMatch.batch.id]
                  : undefined
              }
              onImpactSummaryResolved={cacheImpactSummary}
            />
          }
        />
        <Route
          path="/architecture"
          element={<AISkillsPage activeRole={activeRole} />}
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

function DonorIntakePage({
  activeRole,
  onGeneratedBatchSubmit,
}: {
  activeRole: Role;
  onGeneratedBatchSubmit: (
    scenario: PhotoScenario,
    draft: BatchDraft,
    matchResponse: MatchRankAgentResponse,
  ) => string;
}) {
  const navigate = useNavigate();
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<ScenarioId>("bakery");
  const selectedScenario = getPhotoScenario(selectedScenarioId);
  const [draft, setDraft] = useState<BatchDraft>(selectedScenario.emptyDraft);
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("");
  const [activeStage, setActiveStage] = useState<IntakeStage>("capture");
  const [highestStageIndex, setHighestStageIndex] = useState(0);
  const [analysisPhraseIndex, setAnalysisPhraseIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [intakeResult, setIntakeResult] = useState<IntakeAgentResponse | null>(
    null,
  );
  const [matchSource, setMatchSource] = useState<AISource | null>(null);
  const [matchModel, setMatchModel] = useState<string | undefined>();
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  const isAnalyzing = status === "analyzing";
  const isDrafted = status === "drafted" || status === "submitted";
  const isSubmitted = status === "submitted";
  const currentRecommendation =
    intakeResult?.recommendation ?? selectedScenario.fallbackRecommendation;
  const currentForecast = intakeResult?.forecast ?? selectedScenario.forecast;
  const currentSensorEvidence =
    intakeResult?.sensorEvidence ?? selectedScenario.sensorEvidence;
  const intakeSource = intakeResult?.source ?? null;
  const intakeModel = intakeResult?.model;

  const unlockStage = (stage: IntakeStage) => {
    setHighestStageIndex((current) =>
      Math.max(current, getIntakeStageIndex(stage)),
    );
  };

  useEffect(() => {
    setDraft(selectedScenario.emptyDraft);
    setStatus("idle");
    setLastAnalyzed("");
    setActiveStage("capture");
    setHighestStageIndex(getIntakeStageIndex("capture"));
    setAnalysisPhraseIndex(0);
    setAnalysisProgress(0);
    setIntakeResult(null);
    setMatchSource(null);
    setMatchModel(undefined);
    setIsSubmittingMatch(false);
  }, [selectedScenario]);

  useEffect(() => {
    if (status !== "analyzing") {
      return undefined;
    }

    const startedAt = window.performance.now();
    const intervalId = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const nextProgress = Math.min(94, (elapsed / analysisDurationMs) * 100);
      const nextPhraseIndex = Math.min(
        analysisPhrases.length - 1,
        Math.floor((elapsed / analysisDurationMs) * analysisPhrases.length),
      );

      setAnalysisProgress(nextProgress);
      setAnalysisPhraseIndex(nextPhraseIndex);
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [status]);

  const finishAnalyze = (result: IntakeAgentResponse) => {
    setDraft(result.draft);
    setIntakeResult(result);
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
  };

  const handleScenarioSelect = (scenarioId: ScenarioId) => {
    if (!isAnalyzing && !isSubmittingMatch) {
      setSelectedScenarioId(scenarioId);
    }
  };

  const handleAnalyze = async () => {
    const scenario = selectedScenario;

    setDraft({ ...scenario.emptyDraft });
    setStatus("analyzing");
    setLastAnalyzed("");
    setAnalysisPhraseIndex(0);
    setAnalysisProgress(0);
    setIntakeResult(null);
    setMatchSource(null);
    setMatchModel(undefined);
    setActiveStage("capture");
    setHighestStageIndex(getIntakeStageIndex("capture"));

    try {
      const [result] = await Promise.all([
        requestIntakeDraft(scenario),
        wait(minimumAgentDelayMs),
      ]);
      finishAnalyze(result);
    } catch {
      await wait(minimumAgentDelayMs);
      finishAnalyze(
        getScenarioFallbackIntake(
          scenario,
          "Fallback demo data prepared this draft because a FoodLoop AI recommendation was unavailable.",
        ),
      );
    }
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

  const handleSubmit = async () => {
    const scenario = selectedScenario;
    const submittedDraft = draft.category ? draft : scenario.fallbackDraft;

    setIsSubmittingMatch(true);

    try {
      const matchResponse = await requestMatchRanking(scenario, submittedDraft);
      onGeneratedBatchSubmit(scenario, submittedDraft, matchResponse);
      setMatchSource(matchResponse.source);
      setMatchModel(matchResponse.model);
    } catch {
      const fallbackMatchResponse = buildFallbackMatchRankResponse(
        scenario.id,
        submittedDraft,
      );
      onGeneratedBatchSubmit(scenario, submittedDraft, fallbackMatchResponse);
      setMatchSource("fallback");
      setMatchModel(undefined);
    } finally {
      setStatus("submitted");
      setIsSubmittingMatch(false);
      navigate("/matching");
    }
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
            scenarios={photoScenarios}
            selectedScenario={selectedScenario}
            intakeSource={intakeSource}
            intakeModel={intakeModel}
            isDrafted={isDrafted}
            isAnalyzing={isAnalyzing}
            lastAnalyzed={lastAnalyzed}
            analysisPhrase={analysisPhrases[analysisPhraseIndex]}
            analysisPhraseIndex={analysisPhraseIndex}
            analysisProgress={analysisProgress}
            onScenarioSelect={handleScenarioSelect}
            onAnalyze={handleAnalyze}
          />
        );
      case "review":
        return (
          <ReviewStagePanel
            draft={draft}
            isDrafted={isDrafted}
            recommendation={currentRecommendation}
            forecast={currentForecast}
            sensorEvidence={currentSensorEvidence}
            intakeSource={intakeSource}
            intakeModel={intakeModel}
            modelOutput={intakeResult?.modelOutput}
            skillMetadata={intakeResult}
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
            isSubmittingMatch={isSubmittingMatch}
            matchSource={matchSource}
            matchModel={matchModel}
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
            Choose a surplus photo, review the FoodLoop AI draft, and submit a confirmed
            batch for matching.
          </p>
        </div>

        <div className="heading-meta" aria-label="Current role context">
          <span>{activeRole === "donor" ? "Donor view" : "NGO role active"}</span>
          <span>{selectedScenario.donorName}</span>
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
            batchId={`FL-${selectedScenario.batchPrefix}-AI`}
            draft={draft}
            lastAnalyzed={lastAnalyzed}
            isSubmitted={isSubmitted}
            intakeSource={intakeSource}
            intakeModel={intakeModel}
            matchSource={matchSource}
            matchModel={matchModel}
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
  scenarios,
  selectedScenario,
  intakeSource,
  intakeModel,
  isDrafted,
  isAnalyzing,
  lastAnalyzed,
  analysisPhrase,
  analysisPhraseIndex,
  analysisProgress,
  onScenarioSelect,
  onAnalyze,
}: {
  scenarios: PhotoScenario[];
  selectedScenario: PhotoScenario;
  intakeSource: AISource | null;
  intakeModel?: string;
  isDrafted: boolean;
  isAnalyzing: boolean;
  lastAnalyzed: string;
  analysisPhrase: string;
  analysisPhraseIndex: number;
  analysisProgress: number;
  onScenarioSelect: (scenarioId: ScenarioId) => void;
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
      <div className="scenario-card-grid" aria-label="Photo scenarios">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenario.id;

          return (
            <button
              key={scenario.id}
              type="button"
              className={
                isSelected
                  ? "scenario-card scenario-card-active"
                  : "scenario-card"
              }
              aria-pressed={isSelected}
              disabled={isAnalyzing}
              onClick={() => onScenarioSelect(scenario.id)}
            >
              <img src={scenario.imageSrc} alt="" aria-hidden="true" />
              <span>
                <strong>{scenario.cardTitle}</strong>
                <small>{scenario.donorName}</small>
              </span>
            </button>
          );
        })}
      </div>
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
              src={selectedScenario.imageSrc}
              alt={selectedScenario.imageAlt}
            />
            {isAnalyzing ? (
              <div className="scanner-overlay" aria-hidden="true">
                <span className="scanner-grid" />
                <span className="scanner-line" />
              </div>
            ) : null}
          </div>
          <div className="photo-meta">
            <span>{selectedScenario.photoLabel}</span>
            <span>{selectedScenario.fileMeta}</span>
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
              <div className="capture-title-row">
                <h3>Photo intake for {selectedScenario.donorName}</h3>
                {intakeSource ? (
                  <SourceBadge source={intakeSource} model={intakeModel} />
                ) : null}
              </div>
              <p>
                Use the supplied photo to draft category, items, quantity, and
                pickup timing.
              </p>
            </>
          )}
          <dl className="context-list">
            <div>
              <dt>Donor</dt>
              <dd>{selectedScenario.donorName}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{selectedScenario.location}</dd>
            </div>
            <div>
              <dt>Holding</dt>
              <dd>{selectedScenario.emptyDraft.holdingStatus}</dd>
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
  recommendation,
  forecast,
  sensorEvidence: scenarioSensorEvidence,
  intakeSource,
  intakeModel,
  modelOutput,
  skillMetadata,
  onFieldChange,
  onValueChange,
  onContinue,
}: {
  isDrafted: boolean;
  draft: BatchDraft;
  recommendation: AgentRecommendation;
  forecast: ForecastSummary;
  sensorEvidence: SensorEvidence;
  intakeSource: AISource | null;
  intakeModel?: string;
  modelOutput?: IntakeAgentResponse["modelOutput"];
  skillMetadata?: IntakeAgentResponse | null;
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
          title="Edit FoodLoop AI draft"
          actionText={
            isDrafted
              ? `${recommendation.confidence}% draft confidence`
              : "Awaiting photo"
          }
        />
        {intakeSource ? (
          <SourceBadge source={intakeSource} model={intakeModel} />
        ) : (
          <Badge tone="review">Editable review</Badge>
        )}
      </div>

      <div className="agent-copy">
        <p>
          {isDrafted
            ? recommendation.summary
            : "Analyze the photo to prepare a donor-editable review draft."}
        </p>
      </div>
      {intakeSource ? (
        <AIOutputViewer
          source={intakeSource}
          modelOutput={modelOutput}
          skillMetadata={skillMetadata}
        />
      ) : null}

      <div className="evidence-chip-grid" aria-label="Forecast and evidence">
        <EvidenceChip
          icon={CalendarClock}
          label="Forecast"
          value={forecast.predictedBand}
          supporting={`${forecast.confidence}% confidence`}
        />
        <EvidenceChip
          icon={Building2}
          label="Storage"
          value={draft.storageLocation || scenarioSensorEvidence.storageLocation}
          supporting={forecast.likelyWindow}
        />
        <EvidenceChip
          icon={Thermometer}
          label="Temperature"
          value={draft.temperatureStatus || scenarioSensorEvidence.temperature}
          supporting={scenarioSensorEvidence.lastReadingAt}
        />
        <EvidenceChip
          icon={Layers}
          label="Sensor"
          value={draft.sensorAttachment || scenarioSensorEvidence.sensorAttachment}
          supporting={scenarioSensorEvidence.holdingStatus}
        />
      </div>
      <div className="agent-footer">
        <Badge tone={isDrafted ? "low" : "review"}>
          {isDrafted ? draft.handlingPriority : "Needs confirmation"}
        </Badge>
        <span>{recommendation.requiredConfirmation}</span>
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
  isSubmittingMatch,
  matchSource,
  matchModel,
  onReturnToEdit,
  onSubmit,
}: {
  draft: BatchDraft;
  status: IntakeStatus;
  isSubmittingMatch: boolean;
  matchSource: AISource | null;
  matchModel?: string;
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
          actionText={isSubmittingMatch ? "Ranking matches" : "Final checkpoint"}
        />
        {matchSource ? (
          <SourceBadge source={matchSource} model={matchModel} />
        ) : (
          <Badge tone={status === "submitted" ? "routing" : "review"}>
            {isSubmittingMatch
              ? "Ranking NGOs"
              : status === "submitted"
                ? "Pending match"
                : "Ready to submit"}
          </Badge>
        )}
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
          disabled={isSubmittingMatch}
          onClick={onSubmit}
        >
          <Send size={17} aria-hidden="true" />
          {isSubmittingMatch ? "Ranking Matches" : "Submit for Matching"}
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
  intakeSource,
  intakeModel,
  matchSource,
  matchModel,
}: {
  activeStage: IntakeStage;
  status: IntakeStatus;
  batchId: string;
  draft: BatchDraft;
  lastAnalyzed: string;
  isSubmitted: boolean;
  intakeSource: AISource | null;
  intakeModel?: string;
  matchSource: AISource | null;
  matchModel?: string;
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
        {matchSource ? (
          <SourceBadge source={matchSource} model={matchModel} />
        ) : intakeSource ? (
          <SourceBadge source={intakeSource} model={intakeModel} />
        ) : (
          <Badge tone={isSubmitted ? "routing" : "review"}>{statusLabel}</Badge>
        )}
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
  const presetMatch = itemDescriptionPresets.includes(value);
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
        {itemDescriptionPresets.map((option) => (
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

function AISkillsPage({ activeRole }: { activeRole: Role }) {
  return (
    <section className="page-stack ai-skills-page" aria-labelledby="ai-skills-title">
      <div className="page-heading ai-skills-heading">
        <div>
          <p className="page-kicker">Runtime prompt showcase</p>
          <h1 id="ai-skills-title">AI Skills</h1>
          <p>
            Seven named runtime skills power FoodLoop AI outputs, with typed
            normalizers and deterministic rules guarding handling labels, route
            facts, candidate IDs, and demo impact metrics.
          </p>
        </div>
        <div className="heading-meta" aria-label="AI skill page summary">
          <span>{activeRole === "donor" ? "Donor role" : "NGO role"}</span>
          <span>{aiSkillList.length} skills</span>
          <span>OpenRouter v1</span>
        </div>
      </div>

      <section className="panel skill-flow-panel" aria-labelledby="skill-flow-title">
        <div>
          <h2 id="skill-flow-title">Skill flow</h2>
          <p>
            Rules and app data guard the operational facts; model text stays in
            explainable, human-confirmed decision support.
          </p>
        </div>
        <ol className="skill-flow-list" aria-label="FoodLoop AI skill flow">
          {skillFlow.map((skillId, index) => {
            const skill = aiSkillRegistry[skillId];

            return (
              <li key={skill.id}>
                <span>{index + 1}</span>
                <strong>{skill.label.replace(" Skill", "")}</strong>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="skill-card-grid">
        {aiSkillList.map((skill) => (
          <article key={skill.id} className="panel skill-card">
            <div className="skill-card-heading">
              <div>
                <span className="skill-id">{skill.id}</span>
                <h2>{skill.label}</h2>
              </div>
              <span
                className={
                  skill.status === "live"
                    ? "source-badge source-badge-live"
                    : "source-badge"
                }
              >
                {skill.status === "live" ? "Live" : "Simulated"}
              </span>
            </div>

            <p className="skill-purpose">{skill.purpose}</p>

            <dl className="skill-fact-grid">
              <div>
                <dt>Input</dt>
                <dd>{skill.inputSummary}</dd>
              </div>
              <div>
                <dt>Output</dt>
                <dd>{skill.outputSummary}</dd>
              </div>
              <div>
                <dt>Guardrail</dt>
                <dd>{skill.guardrailSummary}</dd>
              </div>
              <div>
                <dt>Human check</dt>
                <dd>{skill.humanConfirmationPoint}</dd>
              </div>
            </dl>

            <div className="skill-provider-row">
              <Badge tone={skill.status === "live" ? "routing" : "review"}>
                {skill.provider}
              </Badge>
              <span>{skill.version}</span>
            </div>

            <div className="skill-details-stack">
              <SkillPromptDetails
                title="System prompt"
                content={skill.systemPrompt}
              />
              <SkillPromptDetails
                title="User prompt template"
                content={skill.userPromptTemplate}
              />
              <details className="skill-prompt-details">
                <summary>Few-shot examples</summary>
                <div className="skill-examples">
                  {skill.examples.map((example) => (
                    <section key={example.title}>
                      <h3>{example.title}</h3>
                      <pre tabIndex={0}>
                        <code>{`Input:\n${example.input}\n\nOutput:\n${example.output}`}</code>
                      </pre>
                    </section>
                  ))}
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>

      <section className="panel skill-review-note" aria-labelledby="skill-review-title">
        <CheckCircle2 size={20} aria-hidden="true" />
        <div>
          <h2 id="skill-review-title">Competition review posture</h2>
          <p>
            Prompt definitions, runtime API calls, and the submission dossier use
            the same skill registry content. Models may propose language, but
            TypeScript guards preserve candidate pools, route facts, handling
            labels, and deterministic demo estimates.
          </p>
        </div>
      </section>
    </section>
  );
}

function SkillPromptDetails({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <details className="skill-prompt-details">
      <summary>{title}</summary>
      <pre tabIndex={0}>
        <code>{content}</code>
      </pre>
    </details>
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

function SourceBadge({
  source,
  model,
}: {
  source?: AISource | null;
  model?: string;
}) {
  const isLive = source === "openrouter";

  return (
    <span
      className={isLive ? "source-badge source-badge-live" : "source-badge"}
      title={
        isLive && model
          ? `FoodLoop AI recommendation via OpenRouter (${model})`
          : undefined
      }
    >
      {sourceLabel(source)}
    </span>
  );
}

export default App;

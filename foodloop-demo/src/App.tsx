import { useEffect, useMemo, useState } from "react";
import { AppShell } from "./components/AppShell";
import { completedImpactMetrics, baseImpactMetrics, demoBatch, ngoCandidates } from "./data/mockData";
import { ArchitectureScreen } from "./screens/ArchitectureScreen";
import { DispatchScreen } from "./screens/DispatchScreen";
import { ImpactScreen } from "./screens/ImpactScreen";
import { IntakeScreen } from "./screens/IntakeScreen";
import { MatchingScreen } from "./screens/MatchingScreen";
import type { ScreenId } from "./types";
import { buildRoutePlan, calculateRiskScore, rankNgoMatches } from "./utils/decision";

type AnalysisStatus = "idle" | "analyzing" | "ready";
type RouteStatus = "draft" | "recalculating" | "optimized" | "complete";

function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("intake");
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [batchSubmitted, setBatchSubmitted] = useState(false);
  const [selectedNgoId, setSelectedNgoId] = useState("");
  const [ngoConfirmed, setNgoConfirmed] = useState(false);
  const [routeStatus, setRouteStatus] = useState<RouteStatus>("draft");
  const [pickupCompleted, setPickupCompleted] = useState(false);

  const risk = useMemo(() => calculateRiskScore(demoBatch), []);
  const rankedCandidates = useMemo(() => rankNgoMatches(demoBatch, ngoCandidates, risk), [risk]);
  const selectedNgo = rankedCandidates.find((candidate) => candidate.id === selectedNgoId) ?? rankedCandidates[0];
  const routePlan = useMemo(() => buildRoutePlan(demoBatch, selectedNgo), [selectedNgo]);
  const shellRoutePlan = useMemo(
    () =>
      routeStatus === "optimized" || routeStatus === "complete"
        ? { ...routePlan, etaMinutes: routePlan.etaMinutes - 3 }
        : routePlan,
    [routePlan, routeStatus],
  );
  const impactMetrics = pickupCompleted ? completedImpactMetrics : baseImpactMetrics;

  useEffect(() => {
    if (!selectedNgoId && rankedCandidates.length > 0) {
      setSelectedNgoId(rankedCandidates[0].id);
    }
  }, [rankedCandidates, selectedNgoId]);

  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [activeScreen]);

  const analyzePhoto = () => {
    if (analysisStatus === "analyzing") return;
    setAnalysisStatus("analyzing");
    window.setTimeout(() => {
      setAnalysisStatus("ready");
    }, 850);
  };

  const submitBatch = () => {
    if (analysisStatus !== "ready") return;
    setBatchSubmitted(true);
    setActiveScreen("matching");
  };

  const selectNgo = (ngoId: string) => {
    setSelectedNgoId(ngoId);
    setNgoConfirmed(false);
    setRouteStatus("draft");
  };

  const confirmNgo = () => {
    setNgoConfirmed(true);
    setActiveScreen("dispatch");
    setRouteStatus("draft");
  };

  const recalculateRoute = () => {
    if (routeStatus === "recalculating" || pickupCompleted) return;
    setRouteStatus("recalculating");
    window.setTimeout(() => {
      setRouteStatus("optimized");
    }, 900);
  };

  const completePickup = () => {
    if (routeStatus === "recalculating") return;
    setPickupCompleted(true);
    setRouteStatus("complete");
    setActiveScreen("impact");
  };

  const restartDemo = () => {
    setActiveScreen("intake");
    setAnalysisStatus("idle");
    setBatchSubmitted(false);
    setSelectedNgoId(rankedCandidates[0]?.id ?? "");
    setNgoConfirmed(false);
    setRouteStatus("draft");
    setPickupCompleted(false);
  };

  const guidedState = getGuidedState({
    activeScreen,
    analysisStatus,
    batchSubmitted,
    ngoConfirmed,
    routeStatus,
    pickupCompleted,
  });

  const handleGuidedAction = () => {
    if (analysisStatus === "analyzing" || routeStatus === "recalculating") return;

    switch (guidedState.action) {
      case "analyze":
        setActiveScreen("intake");
        analyzePhoto();
        break;
      case "submit":
        submitBatch();
        break;
      case "confirm":
        setActiveScreen("matching");
        confirmNgo();
        break;
      case "recalculate":
        setActiveScreen("dispatch");
        recalculateRoute();
        break;
      case "complete":
        completePickup();
        break;
      case "architecture":
        setActiveScreen("architecture");
        break;
      case "restart":
        restartDemo();
        break;
    }
  };

  return (
    <AppShell
      activeScreen={activeScreen}
      batch={demoBatch}
      risk={risk}
      selectedNgo={selectedNgo}
      routePlan={shellRoutePlan}
      pickupCompleted={pickupCompleted}
      guidedLabel={guidedState.label}
      guidedDisabled={analysisStatus === "analyzing" || routeStatus === "recalculating"}
      onGuidedAction={handleGuidedAction}
      onNavigate={setActiveScreen}
    >
      {activeScreen === "intake" ? (
        <IntakeScreen
          batch={demoBatch}
          risk={risk}
          analysisStatus={analysisStatus}
          batchSubmitted={batchSubmitted}
          onAnalyze={analyzePhoto}
          onSubmit={submitBatch}
        />
      ) : null}

      {activeScreen === "matching" ? (
        <MatchingScreen
          batch={demoBatch}
          risk={risk}
          candidates={rankedCandidates}
          selectedNgoId={selectedNgo.id}
          ngoConfirmed={ngoConfirmed}
          onSelectNgo={selectNgo}
          onConfirmNgo={confirmNgo}
        />
      ) : null}

      {activeScreen === "dispatch" ? (
        <DispatchScreen
          batch={demoBatch}
          selectedNgo={selectedNgo}
          routePlan={routePlan}
          routeStatus={routeStatus}
          pickupCompleted={pickupCompleted}
          onRecalculate={recalculateRoute}
          onCompletePickup={completePickup}
        />
      ) : null}

      {activeScreen === "impact" ? <ImpactScreen metrics={impactMetrics} pickupCompleted={pickupCompleted} /> : null}

      {activeScreen === "architecture" ? <ArchitectureScreen /> : null}
    </AppShell>
  );
}

interface GuidedStateInput {
  activeScreen: ScreenId;
  analysisStatus: AnalysisStatus;
  batchSubmitted: boolean;
  ngoConfirmed: boolean;
  routeStatus: RouteStatus;
  pickupCompleted: boolean;
}

function getGuidedState({
  activeScreen,
  analysisStatus,
  batchSubmitted,
  ngoConfirmed,
  routeStatus,
  pickupCompleted,
}: GuidedStateInput): { label: string; action: "analyze" | "submit" | "confirm" | "recalculate" | "complete" | "architecture" | "restart" } {
  if (pickupCompleted) {
    return activeScreen === "architecture"
      ? { label: "Restart demo", action: "restart" }
      : { label: "Open Architecture", action: "architecture" };
  }

  if (analysisStatus !== "ready") {
    return { label: analysisStatus === "analyzing" ? "Analyzing" : "Analyze photo", action: "analyze" };
  }

  if (!batchSubmitted) {
    return { label: "Submit batch", action: "submit" };
  }

  if (!ngoConfirmed) {
    return { label: "Confirm NGO", action: "confirm" };
  }

  if (routeStatus === "draft") {
    return { label: "Recalculate", action: "recalculate" };
  }

  return { label: "Complete pickup", action: "complete" };
}

export default App;

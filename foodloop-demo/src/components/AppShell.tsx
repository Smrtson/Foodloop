import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Camera,
  ChartLineUp,
  Cpu,
  ListChecks,
  MapTrifold,
  ShieldCheck,
  Sparkle,
  Timer,
  Truck,
  UsersThree,
} from "@phosphor-icons/react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { FoodBatch, NgoCandidate, RiskResult, RoutePlan, ScreenId } from "../types";

type IconComponent = ComponentType<{ size?: number; weight?: "regular" | "fill" | "duotone" | "bold"; "aria-hidden"?: boolean }>;

interface NavItem {
  id: ScreenId;
  label: string;
  description: string;
  icon: IconComponent;
}

const navItems: NavItem[] = [
  { id: "intake", label: "Intake", description: "Donor upload", icon: Camera },
  { id: "matching", label: "Matching", description: "NGO scoring", icon: UsersThree },
  { id: "dispatch", label: "Dispatch", description: "Route plan", icon: Truck },
  { id: "impact", label: "Impact", description: "ESG report", icon: ChartLineUp },
  { id: "architecture", label: "Architecture", description: "Technical view", icon: Cpu },
];

interface AppShellProps {
  activeScreen: ScreenId;
  batch: FoodBatch;
  risk: RiskResult;
  selectedNgo?: NgoCandidate;
  routePlan?: RoutePlan;
  pickupCompleted: boolean;
  guidedLabel: string;
  guidedDisabled?: boolean;
  onGuidedAction: () => void;
  onNavigate: (screen: ScreenId) => void;
  children: ReactNode;
}

export function AppShell({
  activeScreen,
  batch,
  risk,
  selectedNgo,
  routePlan,
  pickupCompleted,
  guidedLabel,
  guidedDisabled = false,
  onGuidedAction,
  onNavigate,
  children,
}: AppShellProps) {
  const activeItem = navItems.find((item) => item.id === activeScreen) ?? navItems[0];
  const riskTone = risk.label === "High" ? "danger" : risk.label === "Medium" ? "warning" : "success";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="FoodLoop RescueCore sections">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            FL
          </div>
          <div>
            <strong>FoodLoop</strong>
            <span>RescueCore</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeScreen;
            return (
              <button
                className={`nav-item ${isActive ? "is-active" : ""}`}
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={20} weight={isActive ? "fill" : "regular"} aria-hidden />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-panel">
          <div className="sidebar-panel-title">
            <ShieldCheck size={18} weight="fill" aria-hidden />
            <span>Decision support</span>
          </div>
          <p>AI scoring assists coordinators. It does not certify food safety.</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="screen-kicker">{activeItem.description}</span>
            <h1>{activeItem.label}</h1>
          </div>
          <div className="topbar-actions">
            <Badge tone={pickupCompleted ? "success" : riskTone} icon={<Sparkle size={14} weight="fill" aria-hidden />}>
              {pickupCompleted ? "Pickup completed" : `${risk.label} risk`}
            </Badge>
            <Button
              variant="primary"
              onClick={onGuidedAction}
              disabled={guidedDisabled}
              trailingIcon={<ArrowRight size={16} weight="bold" aria-hidden />}
            >
              {guidedLabel}
            </Button>
          </div>
        </header>

        <section className="kpi-strip" aria-label="Demo summary metrics">
          <div>
            <span>Batch</span>
            <strong>{batch.quantityKg} kg</strong>
            <small>{batch.servings} servings</small>
          </div>
          <div>
            <span>Risk score</span>
            <strong>{risk.score}/100</strong>
            <small>{risk.decision}</small>
          </div>
          <div>
            <span>Top match</span>
            <strong>{selectedNgo ? `${selectedNgo.score ?? 0}%` : "Pending"}</strong>
            <small>{selectedNgo?.district ?? "Run matching"}</small>
          </div>
          <div>
            <span>Route</span>
            <strong>{routePlan ? `${routePlan.etaMinutes} min` : "Pending"}</strong>
            <small>{routePlan?.slaStatus ?? "Awaiting NGO"}</small>
          </div>
        </section>

        <main id="main-content" className="content-frame" tabIndex={-1}>
          {children}
        </main>

        <footer className="demo-footer">
          <ListChecks size={16} aria-hidden />
          <span>Demo flow: donor upload, AI decision support, NGO matching, dispatch routing, impact reporting.</span>
          <Timer size={16} aria-hidden />
          <span>Designed for a 60-90 second walkthrough.</span>
          <MapTrifold size={16} aria-hidden />
          <span>Hong Kong mock data only.</span>
        </footer>
      </div>
    </div>
  );
}

import {
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
import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import bakeryPhoto from "./assets/wan-chai-bakery-surplus.png";
import {
  agentRecommendation,
  analyzedDraft,
  emptyDraft,
  forecastSummary,
  ngoPreviewRows,
  pageMeta,
  sensorEvidence,
  stubContent,
} from "./data";
import type { BatchDraft, DemoPageId, IntakeStatus, Role } from "./types";

const pageIcons: Record<DemoPageId, LucideIcon> = {
  intake: ClipboardCheck,
  matching: Users,
  route: RouteIcon,
  impact: Gauge,
  architecture: Cpu,
};

function App() {
  const [activeRole, setActiveRole] = useState<Role>("donor");

  return (
    <AppShell activeRole={activeRole} onRoleChange={setActiveRole}>
      <Routes>
        <Route path="/" element={<Navigate to="/intake" replace />} />
        <Route path="/intake" element={<DonorIntakePage activeRole={activeRole} />} />
        <Route
          path="/matching"
          element={<StubPage pageId="matching" activeRole={activeRole} />}
        />
        <Route
          path="/route"
          element={<StubPage pageId="route" activeRole={activeRole} />}
        />
        <Route
          path="/impact"
          element={<StubPage pageId="impact" activeRole={activeRole} />}
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
  const [draft, setDraft] = useState<BatchDraft>(emptyDraft);
  const [status, setStatus] = useState<IntakeStatus>("idle");
  const [lastAnalyzed, setLastAnalyzed] = useState<string>("");
  const batchId = "FL-WC-0625-014";

  const isDrafted = status !== "idle";
  const isSubmitted = status === "submitted";

  const handleAnalyze = () => {
    setDraft(analyzedDraft);
    setStatus((current) => (current === "submitted" ? "submitted" : "drafted"));
    setLastAnalyzed("10:24 AM");
  };

  const handleFieldChange =
    (field: keyof BatchDraft) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      const { value } = event.target;
      setDraft((current) => ({ ...current, [field]: value }));
      if (status === "idle") {
        setStatus("drafted");
      }
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.category) {
      setDraft(analyzedDraft);
    }
    setStatus("submitted");
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

      {isSubmitted ? <SubmittedBanner batchId={batchId} /> : null}

      <div className="intake-layout">
        <div className="intake-primary">
          <div className="intake-top-grid">
            <PhotoAnalysisPanel
              isDrafted={isDrafted}
              lastAnalyzed={lastAnalyzed}
              onAnalyze={handleAnalyze}
            />
            <AgentPanel isDrafted={isDrafted} draft={draft} />
          </div>

          <ForecastAndEvidence />

          <BatchForm
            draft={draft}
            status={status}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
          />
        </div>

        <aside className="intake-aside" aria-label="NGO preview and evidence">
          <NgoPreview status={status} batchId={batchId} draft={draft} />
          <IntakeSummary status={status} draft={draft} />
        </aside>
      </div>
    </section>
  );
}

function SubmittedBanner({ batchId }: { batchId: string }) {
  return (
    <div className="submit-banner" role="status">
      <div className="banner-icon" aria-hidden="true">
        <Check size={18} />
      </div>
      <div>
        <strong>Batch {batchId} submitted for matching.</strong>
        <span> Pending match status is visible to NGO partners.</span>
      </div>
      <Link to="/matching" className="inline-link">
        Open Match Queue <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

function PhotoAnalysisPanel({
  isDrafted,
  lastAnalyzed,
  onAnalyze,
}: {
  isDrafted: boolean;
  lastAnalyzed: string;
  onAnalyze: () => void;
}) {
  return (
    <section className="panel photo-panel" aria-labelledby="photo-panel-title">
      <PanelTitle
        id="photo-panel-title"
        icon={UploadCloud}
        title="Upload and photo analysis"
        actionText={isDrafted ? `Analyzed ${lastAnalyzed}` : "Ready"}
      />
      <div className="photo-frame">
        <img
          src={bakeryPhoto}
          alt="Sealed bakery surplus in green crates at a Wan Chai bakery counter"
        />
      </div>
      <div className="photo-meta">
        <span>Wan Chai bakery photo</span>
        <span>JPG, 2.4 MB</span>
      </div>
      <button type="button" className="button button-logistics" onClick={onAnalyze}>
        <Sparkles size={17} aria-hidden="true" />
        Analyze Photo
      </button>
      <p className="helper-copy">
        AI drafts the record; donor confirms before matching.
      </p>
    </section>
  );
}

function AgentPanel({
  isDrafted,
  draft,
}: {
  isDrafted: boolean;
  draft: BatchDraft;
}) {
  const rows = isDrafted
    ? [
        ["Category", draft.category],
        ["Quantity", `${draft.quantity} ${draft.unit}`],
        ["Packaging", draft.packaging],
        ["Prepared time", draft.preparedTime],
        ["Pickup deadline", draft.pickupDeadline],
      ]
    : [
        ["Category", "Needs confirmation"],
        ["Quantity", "Needs confirmation"],
        ["Packaging", "Needs confirmation"],
        ["Prepared time", "Needs confirmation"],
        ["Pickup deadline", "Needs confirmation"],
      ];

  return (
    <section className="panel agent-panel" aria-labelledby="agent-panel-title">
      <PanelTitle
        id="agent-panel-title"
        icon={Bot}
        title="AI Intake Agent"
        actionText={isDrafted ? `${agentRecommendation.confidence}% confidence` : "Awaiting photo"}
      />
      <div className="agent-copy">
        <p>{isDrafted ? agentRecommendation.summary : "Analyze the photo to fill the editable donor draft."}</p>
      </div>
      <dl className="agent-table">
        {rows.map(([label, value]) => (
          <div key={label} className="agent-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="agent-footer">
        <Badge tone={isDrafted ? "low" : "review"}>
          {isDrafted ? draft.handlingPriority : "Needs confirmation"}
        </Badge>
        <span>{agentRecommendation.requiredConfirmation}</span>
      </div>
    </section>
  );
}

function ForecastAndEvidence() {
  return (
    <section className="forecast-evidence" aria-labelledby="forecast-title">
      <div className="panel forecast-panel">
        <PanelTitle
          id="forecast-title"
          icon={CalendarClock}
          title="Forecast"
          actionText={`${forecastSummary.confidence}% confidence`}
        />
        <div className="forecast-body">
          <div>
            <span className="metric-value">{forecastSummary.predictedBand}</span>
            <span className="metric-label">Predicted surplus band</span>
          </div>
          <Badge tone="medium">Short window</Badge>
        </div>
        <p>{forecastSummary.patternBasis}</p>
      </div>

      <div className="evidence-strip" aria-label="Sensor and evidence summary">
        <EvidenceItem
          icon={Building2}
          label="Storage location"
          value={sensorEvidence.storageLocation}
        />
        <EvidenceItem
          icon={Thermometer}
          label="Temperature"
          value={sensorEvidence.temperature}
        />
        <EvidenceItem
          icon={PackageCheck}
          label="Holding status"
          value={sensorEvidence.holdingStatus}
        />
        <EvidenceItem
          icon={Layers}
          label="Sensor attached"
          value={sensorEvidence.sensorAttachment}
        />
      </div>
    </section>
  );
}

function EvidenceItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="evidence-item">
      <Icon size={17} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BatchForm({
  draft,
  status,
  onFieldChange,
  onSubmit,
}: {
  draft: BatchDraft;
  status: IntakeStatus;
  onFieldChange: (
    field: keyof BatchDraft,
  ) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="panel batch-form" aria-labelledby="batch-form-title" onSubmit={onSubmit}>
      <div className="form-header">
        <PanelTitle
          id="batch-form-title"
          icon={FileText}
          title="Editable batch draft"
          actionText="Donor confirms"
        />
        <Badge tone={status === "submitted" ? "routing" : "review"}>
          {status === "submitted" ? "Pending match" : "Needs confirmation"}
        </Badge>
      </div>

      <div className="form-grid">
        <Field
          id="category"
          label="Food category"
          helper="Use the operational category NGOs will see."
          value={draft.category}
          onChange={onFieldChange("category")}
        />
        <Field
          id="itemDescription"
          label="Specific items"
          helper="Summarize visible items in the batch."
          value={draft.itemDescription}
          onChange={onFieldChange("itemDescription")}
        />
        <Field
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
        <Field
          id="preparedTime"
          label="Prepared time"
          helper="When the batch was packed or prepared."
          value={draft.preparedTime}
          onChange={onFieldChange("preparedTime")}
        />
        <Field
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
        <SelectField
          id="handlingPriority"
          label="Handling priority"
          helper="Review state, not a verdict."
          value={draft.handlingPriority}
          onChange={onFieldChange("handlingPriority")}
          options={["Low handling risk", "Needs confirmation", "Short window"]}
        />
        <Field
          id="packaging"
          label="Packaging"
          helper="Visible packaging or container state."
          value={draft.packaging}
          onChange={onFieldChange("packaging")}
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
        <TextAreaField
          id="donorNotes"
          label="Donor notes for NGOs"
          helper="Keep pickup details concise."
          value={draft.donorNotes}
          onChange={onFieldChange("donorNotes")}
        />
      </div>

      <div className="form-footer">
        <label className="confirm-row">
          <input type="checkbox" defaultChecked />
          <span>I confirm this donor record is ready for matching.</span>
        </label>
        <button type="submit" className="button button-primary">
          <Send size={17} aria-hidden="true" />
          Submit for Matching
        </button>
      </div>
    </form>
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

function NgoPreview({
  status,
  batchId,
  draft,
}: {
  status: IntakeStatus;
  batchId: string;
  draft: BatchDraft;
}) {
  const pendingText =
    status === "submitted" ? "Pending match" : "Pending match preview";

  return (
    <section className="panel aside-panel" aria-labelledby="ngo-preview-title">
      <PanelTitle id="ngo-preview-title" icon={Users} title="NGO preview" actionText={pendingText} />
      <div className="incoming-batch">
        <span>{batchId}</span>
        <strong>{draft.category || "Bakery surplus draft"}</strong>
        <p>{draft.quantity ? `${draft.quantity} ${draft.unit}` : "Awaiting donor confirmation"}</p>
        <Badge tone={status === "submitted" ? "routing" : "review"}>{pendingText}</Badge>
      </div>

      <div className="preview-list" aria-label="Candidate NGO preview">
        {ngoPreviewRows.map((row) => (
          <div key={row.name} className="preview-row">
            <div>
              <strong>{row.name}</strong>
              <span>{row.distance}</span>
            </div>
            <div>
              <Badge tone={row.fit === "Review" ? "review" : "low"}>{row.fit}</Badge>
              <span>{row.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      <Link to="/matching" className="inline-link">
        View Match Queue <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}

function IntakeSummary({
  status,
  draft,
}: {
  status: IntakeStatus;
  draft: BatchDraft;
}) {
  return (
    <section className="panel aside-panel" aria-labelledby="evidence-title">
      <PanelTitle
        id="evidence-title"
        icon={PackageCheck}
        title="Evidence"
        actionText={status === "submitted" ? "Shared" : "Draft"}
      />
      <dl className="summary-list">
        <div>
          <dt>Location</dt>
          <dd>{draft.location}</dd>
        </div>
        <div>
          <dt>Storage</dt>
          <dd>{draft.storageLocation}</dd>
        </div>
        <div>
          <dt>Holding</dt>
          <dd>{draft.holdingStatus}</dd>
        </div>
        <div>
          <dt>Sensor</dt>
          <dd>{draft.sensorAttachment}</dd>
        </div>
        <div>
          <dt>Last reading</dt>
          <dd>{sensorEvidence.lastReadingAt}</dd>
        </div>
      </dl>
    </section>
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

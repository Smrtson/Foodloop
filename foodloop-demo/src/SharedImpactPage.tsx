import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Gauge,
  Leaf,
  Lock,
  PackageCheck,
  Route as RouteIcon,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  impactAgentSummary,
  impactDonationStatusBreakdown,
  impactOverallTotals,
  impactRouteTimeSaved,
  impactWeeklyRescueTrend,
} from "./data";
import type { AcceptedRouteMatch, ImpactSeriesDatum, Role } from "./types";

interface SharedImpactPageProps {
  activeRole: Role;
  acceptedRouteMatch: AcceptedRouteMatch | null;
  isReceiptConfirmed: boolean;
}

interface CurrentPickupImpact {
  estimatedItems: number;
  kgRescued: number;
  mealEquivalents: number;
  co2eAvoidedKg: number;
}

const numberFormatter = new Intl.NumberFormat("en-US");

function parseQuantityItems(quantityLabel: string) {
  const match = quantityLabel.replace(/,/g, "").match(/\d+(\.\d+)?/);

  if (!match) {
    return 0;
  }

  return Number(match[0]);
}

function buildCurrentPickupImpact(quantityLabel: string): CurrentPickupImpact {
  const estimatedItems = parseQuantityItems(quantityLabel);
  const kgRescued = estimatedItems * 0.08;
  const mealEquivalents = Math.round(estimatedItems);
  const co2eAvoidedKg = kgRescued * 2.5;

  return {
    estimatedItems,
    kgRescued,
    mealEquivalents,
    co2eAvoidedKg,
  };
}

function formatWholeNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

function formatOneDecimal(value: number) {
  return value.toFixed(1);
}

export function SharedImpactPage({
  activeRole,
  acceptedRouteMatch,
  isReceiptConfirmed,
}: SharedImpactPageProps) {
  const currentImpact = useMemo(
    () =>
      acceptedRouteMatch
        ? buildCurrentPickupImpact(acceptedRouteMatch.batch.quantityLabel)
        : null,
    [acceptedRouteMatch],
  );

  if (!acceptedRouteMatch || !currentImpact) {
    return (
      <ImpactLockedState
        title="Accept a batch to unlock impact"
        description="Shared Impact follows the selected accepted batch. Accept a recommended NGO match before FoodLoop prepares the impact summary."
        actionPath="/matching"
        actionLabel="Go to Matching"
        actionIcon={Users}
        meta="No accepted batch selected"
      />
    );
  }

  const { batch, candidate } = acceptedRouteMatch;

  if (!isReceiptConfirmed) {
    return (
      <ImpactLockedState
        title="Receipt confirmation required"
        description={`${candidate.name} needs to confirm receipt on the Shared Route page before this impact summary unlocks.`}
        actionPath="/route"
        actionLabel="Open Shared Route"
        actionIcon={RouteIcon}
        meta={batch.id}
      />
    );
  }

  return (
    <section className="page-stack impact-page" aria-labelledby="impact-title">
      <div className="page-heading impact-heading">
        <div>
          <p className="page-kicker">AI-led impact summary</p>
          <h1 id="impact-title">Shared Impact</h1>
          <p>
            FoodLoop summarizes the confirmed pickup and the wider demo portfolio
            across food recovery, community value, ESG value, and operations.
          </p>
        </div>

        <div className="heading-meta" aria-label="Impact summary status">
          <span>{batch.id}</span>
          <span>Receipt confirmed</span>
          <span>Demo estimates</span>
        </div>
      </div>

      <div className="impact-top-grid">
        <section className="panel impact-ai-panel" aria-labelledby="impact-agent-title">
          <ImpactPanelHeading
            id="impact-agent-title"
            icon={Bot}
            title={impactAgentSummary.title}
            meta="Executive summary"
          />

          <div className="impact-agent-callout">
            <Sparkles size={18} aria-hidden="true" />
            <p>{impactAgentSummary.intro}</p>
          </div>

          <ul className="impact-agent-points">
            {impactAgentSummary.points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="impact-agent-caveat">
            <span>Measurement note</span>
            <p>{impactAgentSummary.caveat}</p>
          </div>
        </section>

        <section
          className="panel impact-receipt-panel"
          aria-labelledby="impact-receipt-title"
        >
          <ImpactPanelHeading
            id="impact-receipt-title"
            icon={FileText}
            title="Impact receipt"
            meta="Confirmed handoff"
          />

          <div className="impact-receipt-card" aria-label="Confirmed impact receipt">
            <div className="impact-receipt-stamp">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <span>Received confirmed</span>
                <strong>Receipt ID IMPACT-{batch.id}</strong>
              </div>
            </div>

            <dl className="impact-receipt-list">
              <ReceiptMetric label="Donor" value={batch.donorName} />
              <ReceiptMetric label="NGO" value={candidate.name} />
              <ReceiptMetric label="Batch" value={batch.itemDescription} />
              <ReceiptMetric label="Quantity source" value={batch.quantityLabel} />
              <ReceiptMetric
                label="Current kg rescued"
                value={`${formatOneDecimal(currentImpact.kgRescued)} kg`}
              />
              <ReceiptMetric
                label="Meal equivalents"
                value={formatWholeNumber(currentImpact.mealEquivalents)}
              />
              <ReceiptMetric
                label="CO2e avoided"
                value={`${formatOneDecimal(currentImpact.co2eAvoidedKg)} kg CO2e`}
              />
              <ReceiptMetric label="Formula" value="Items x 0.08 kg, kg x 2.5 CO2e" />
            </dl>
          </div>
        </section>
      </div>

      <section className="impact-kpi-strip" aria-label="Impact category metrics">
        <ImpactKpiCard
          icon={PackageCheck}
          label="Food recovery"
          value={`${formatWholeNumber(impactOverallTotals.foodRescuedKg)} kg`}
          note={`+${formatOneDecimal(currentImpact.kgRescued)} kg from this pickup`}
          tone="green"
        />
        <ImpactKpiCard
          icon={Users}
          label="Social impact"
          value={`${formatWholeNumber(impactOverallTotals.mealEquivalents)} meals`}
          note={`+${formatWholeNumber(currentImpact.mealEquivalents)} meal equivalents`}
          tone="blue"
        />
        <ImpactKpiCard
          icon={Leaf}
          label="ESG impact"
          value={`${formatOneDecimal(impactOverallTotals.co2eAvoidedTonnes)} t CO2e`}
          note={`+${formatOneDecimal(currentImpact.co2eAvoidedKg)} kg CO2e avoided`}
          tone="green"
        />
        <ImpactKpiCard
          icon={Gauge}
          label="Operational impact"
          value={`${impactOverallTotals.pickupSuccessRate}% success`}
          note="Completed pickup network total"
          tone="amber"
        />
      </section>

      <div className="impact-dashboard-grid" aria-label="Impact charts">
        <ImpactTrendPanel data={impactWeeklyRescueTrend} />
        <ImpactStatusPanel data={impactDonationStatusBreakdown} />
        <ImpactTimeSavedPanel data={impactRouteTimeSaved} />
      </div>

      <ImpactRolePanel
        activeRole={activeRole}
        batchId={batch.id}
        donorName={batch.donorName}
        ngoName={candidate.name}
        currentImpact={currentImpact}
      />
    </section>
  );
}

function ImpactLockedState({
  title,
  description,
  actionPath,
  actionLabel,
  actionIcon: ActionIcon,
  meta,
}: {
  title: string;
  description: string;
  actionPath: string;
  actionLabel: string;
  actionIcon: LucideIcon;
  meta: string;
}) {
  return (
    <section className="page-stack impact-page" aria-labelledby="impact-title">
      <div className="page-heading impact-heading">
        <div>
          <p className="page-kicker">AI-led impact summary</p>
          <h1 id="impact-title">Shared Impact</h1>
          <p>
            Impact unlocks only after an accepted recipient confirms receipt on
            the Shared Route page.
          </p>
        </div>

        <div className="heading-meta" aria-label="Impact lock status">
          <span>{meta}</span>
          <span>Locked</span>
        </div>
      </div>

      <section className="panel impact-lock-state" aria-labelledby="impact-lock-title">
        <div className="impact-lock-icon" aria-hidden="true">
          <Lock size={28} />
        </div>
        <div>
          <h2 id="impact-lock-title">{title}</h2>
          <p>{description}</p>
        </div>
        <Link to={actionPath} className="button button-primary">
          <ActionIcon size={17} aria-hidden="true" />
          {actionLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </section>
  );
}

function ImpactPanelHeading({
  id,
  icon: Icon,
  title,
  meta,
}: {
  id?: string;
  icon: LucideIcon;
  title: string;
  meta: string;
}) {
  return (
    <div className="impact-panel-heading">
      <div>
        <Icon size={18} aria-hidden="true" />
        <h2 id={id}>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  );
}

function ReceiptMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ImpactKpiCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: ImpactSeriesDatum["tone"];
}) {
  return (
    <article className={`panel impact-kpi-card impact-tone-${tone}`}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function ImpactTrendPanel({ data }: { data: ImpactSeriesDatum[] }) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <section className="panel impact-chart-panel" aria-labelledby="impact-trend-title">
      <ImpactPanelHeading
        id="impact-trend-title"
        icon={TrendingUp}
        title="Weekly rescued trend"
        meta="kg rescued"
      />
      <div className="impact-column-chart" aria-label="Weekly rescued food in kg">
        {data.map((item) => (
          <div key={item.label} className="impact-column">
            <span
              className={`impact-column-bar impact-tone-${item.tone}`}
              style={{ height: `${Math.max(18, (item.value / maxValue) * 100)}%` }}
              aria-hidden="true"
            />
            <strong>{item.value}</strong>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactStatusPanel({ data }: { data: ImpactSeriesDatum[] }) {
  return (
    <section className="panel impact-chart-panel" aria-labelledby="impact-status-title">
      <ImpactPanelHeading
        id="impact-status-title"
        icon={BarChart3}
        title="Donation status"
        meta="mock split"
      />
      <div className="impact-horizontal-chart" aria-label="Donation status breakdown">
        {data.map((item) => (
          <BarRow key={item.label} item={item} suffix="%" />
        ))}
      </div>
    </section>
  );
}

function ImpactTimeSavedPanel({ data }: { data: ImpactSeriesDatum[] }) {
  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="panel impact-chart-panel" aria-labelledby="impact-time-title">
      <ImpactPanelHeading
        id="impact-time-title"
        icon={Clock3}
        title="Route time saved"
        meta={`${totalMinutes} min`}
      />
      <div className="impact-horizontal-chart" aria-label="Operations time saved">
        {data.map((item) => (
          <BarRow key={item.label} item={item} suffix=" min" maxValue={totalMinutes} />
        ))}
      </div>
    </section>
  );
}

function BarRow({
  item,
  suffix,
  maxValue = 100,
}: {
  item: ImpactSeriesDatum;
  suffix: string;
  maxValue?: number;
}) {
  return (
    <div className="impact-bar-row">
      <div className="impact-bar-label">
        <span>{item.label}</span>
        <strong>
          {item.value}
          {suffix}
        </strong>
      </div>
      <div className="impact-bar-track" aria-hidden="true">
        <span
          className={`impact-bar-fill impact-tone-${item.tone}`}
          style={{ width: `${Math.max(6, (item.value / maxValue) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function ImpactRolePanel({
  activeRole,
  batchId,
  donorName,
  ngoName,
  currentImpact,
}: {
  activeRole: Role;
  batchId: string;
  donorName: string;
  ngoName: string;
  currentImpact: CurrentPickupImpact;
}) {
  const isDonor = activeRole === "donor";
  const Icon = isDonor ? Building2 : Users;
  const title = isDonor
    ? "Donor ESG interpretation"
    : "NGO community interpretation";
  const meta = isDonor ? "Report view" : "Program view";
  const intro = isDonor
    ? `${donorName} can frame this receipt as ${formatOneDecimal(
        currentImpact.kgRescued,
      )} kg rescued, ${formatWholeNumber(
        currentImpact.mealEquivalents,
      )} meal equivalents, and ${formatOneDecimal(
        currentImpact.co2eAvoidedKg,
      )} kg CO2e avoided for batch ${batchId}.`
    : `${ngoName} can frame this receipt as ${formatWholeNumber(
        currentImpact.mealEquivalents,
      )} meal equivalents received from ${donorName}, matched to demand and closed through shared routing.`;
  const points = isDonor
    ? [
        "Attach the demo methodology beside ESG reporting language.",
        "Show reduced disposal and confirmed community handoff.",
        "Keep the receipt linked to the accepted NGO confirmation.",
      ]
    : [
        "Use the receipt in pantry output and volunteer notes.",
        "Connect donor reliability to future pickup planning.",
        "Track received batches against service capacity.",
      ];

  return (
    <section className="panel impact-role-panel" aria-labelledby="impact-role-title">
      <ImpactPanelHeading
        id="impact-role-title"
        icon={Icon}
        title={title}
        meta={meta}
      />
      <div className="impact-role-body">
        <p>{intro}</p>
        <ul>
          {points.map((point) => (
            <li key={point}>
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="impact-report-actions" aria-label="Demo report actions">
        <button type="button" className="button button-secondary">
          <FileText size={17} aria-hidden="true" />
          {isDonor ? "Preview ESG Note" : "Preview NGO Summary"}
        </button>
        <button type="button" className="button button-primary">
          <Download size={17} aria-hidden="true" />
          {isDonor ? "Export ESG Report" : "Export Impact Report"}
        </button>
      </div>
    </section>
  );
}

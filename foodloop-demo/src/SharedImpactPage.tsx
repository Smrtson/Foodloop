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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  impactAgentSummary,
  impactCumulativeMetricDefinitions,
  impactCumulativeTrend,
  impactDonationStatusBreakdown,
  impactOverallTotals,
  impactRouteTimeSaved,
} from "./data";
import type {
  AcceptedRouteMatch,
  ImpactCumulativeTrendDatum,
  ImpactMetricDefinition,
  ImpactMetricKey,
  ImpactSeriesDatum,
  Role,
} from "./types";

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

function formatMetricValue(value: number, metric: ImpactMetricDefinition) {
  return `${numberFormatter.format(Math.round(value))} ${metric.unit}`;
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
        <ImpactTrendPanel
          data={impactCumulativeTrend}
          metrics={impactCumulativeMetricDefinitions}
        />
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

function ImpactTrendPanel({
  data,
  metrics,
}: {
  data: ImpactCumulativeTrendDatum[];
  metrics: ImpactMetricDefinition[];
}) {
  const [activeMetricKey, setActiveMetricKey] =
    useState<ImpactMetricKey>("kgRescued");
  const activeMetric =
    metrics.find((metric) => metric.key === activeMetricKey) ?? metrics[0];
  const chartValues = data.map((item) => item[activeMetric.key]);
  const maxValue = Math.max(...chartValues);
  const chart = {
    width: 640,
    height: 260,
    left: 42,
    right: 598,
    top: 34,
    bottom: 190,
  };
  const points = data.map((item, index) => {
    const x =
      chart.left +
      (index / Math.max(1, data.length - 1)) * (chart.right - chart.left);
    const y =
      chart.bottom -
      (item[activeMetric.key] / Math.max(1, maxValue)) *
        (chart.bottom - chart.top);

    return {
      label: item.label,
      value: item[activeMetric.key],
      x,
      y,
    };
  });
  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(
          1,
        )}`,
    )
    .join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x.toFixed(1)} ${chart.bottom} L ${firstPoint.x.toFixed(1)} ${chart.bottom} Z`;
  const chartSummary = `${activeMetric.label} cumulative impact rises from ${formatMetricValue(
    firstPoint.value,
    activeMetric,
  )} on ${firstPoint.label} to ${formatMetricValue(
    lastPoint.value,
    activeMetric,
  )} today.`;

  return (
    <section
      className={`panel impact-chart-panel impact-cumulative-panel impact-tone-${activeMetric.tone}`}
      aria-labelledby="impact-trend-title"
    >
      <ImpactPanelHeading
        id="impact-trend-title"
        icon={TrendingUp}
        title="Cumulative impact growth"
        meta={activeMetric.shortLabel}
      />
      <p className="impact-chart-intro">
        FoodLoop impact accumulates with every completed pickup.
      </p>
      <div className="impact-metric-tabs" role="group" aria-label="Impact metric">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            className={metric.key === activeMetricKey ? "metric-tab-active" : ""}
            aria-pressed={metric.key === activeMetricKey}
            onClick={() => setActiveMetricKey(metric.key)}
          >
            {metric.label}
          </button>
        ))}
      </div>
      <figure className="impact-area-chart" role="img" aria-label={chartSummary}>
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} aria-hidden="true">
          {[0.25, 0.5, 0.75, 1].map((guide) => {
            const y = chart.bottom - guide * (chart.bottom - chart.top);

            return (
              <line
                key={guide}
                className="impact-area-guide"
                x1={chart.left}
                x2={chart.right}
                y1={y}
                y2={y}
              />
            );
          })}
          <path className="impact-area-fill" d={areaPath} />
          <path className="impact-area-line" d={linePath} />
          {points.map((point) => (
            <g key={point.label}>
              <circle
                className="impact-area-point"
                cx={point.x}
                cy={point.y}
                r={4.5}
              />
              <text
                className="impact-area-day"
                x={point.x}
                y={226}
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          ))}
          <text
            className="impact-area-direct-label"
            x={Math.min(firstPoint.x + 12, chart.right - 128)}
            y={firstPoint.y - 10}
          >
            {formatMetricValue(firstPoint.value, activeMetric)}
          </text>
          <text
            className="impact-area-direct-label impact-area-direct-label-end"
            x={lastPoint.x - 10}
            y={Math.max(chart.top + 15, lastPoint.y - 12)}
            textAnchor="end"
          >
            {formatMetricValue(lastPoint.value, activeMetric)}
          </text>
        </svg>
      </figure>
    </section>
  );
}

function ImpactStatusPanel({ data }: { data: ImpactSeriesDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const completed = data.find((item) => item.label === "Completed")?.value ?? 0;
  const statusSummary = data
    .map((item) => `${item.label} ${item.value}%`)
    .join(", ");
  let cumulativePercent = 0;

  return (
    <section className="panel impact-chart-panel" aria-labelledby="impact-status-title">
      <ImpactPanelHeading
        id="impact-status-title"
        icon={BarChart3}
        title="Donation closure success"
        meta="mock split"
      />
      <div className="impact-donut-layout">
        <div
          className="impact-donut-chart"
          role="img"
          aria-label={`Donation closure split: ${statusSummary}.`}
        >
          <svg viewBox="0 0 160 160" aria-hidden="true">
            <circle className="impact-donut-base" cx="80" cy="80" r="58" />
            {data.map((item) => {
              const percent = (item.value / total) * 100;
              const strokeDashoffset = -cumulativePercent;
              cumulativePercent += percent;

              return (
                <circle
                  key={item.label}
                  className={`impact-donut-segment impact-tone-${item.tone}`}
                  cx="80"
                  cy="80"
                  r="58"
                  pathLength="100"
                  strokeDasharray={`${percent} ${100 - percent}`}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div className="impact-donut-center" aria-hidden="true">
            <strong>{completed}%</strong>
            <span>completed</span>
          </div>
        </div>
        <ul className="impact-donut-legend">
          {data.map((item) => (
            <li key={item.label} className={`impact-tone-${item.tone}`}>
              <span className="impact-legend-swatch" aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}%</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ImpactTimeSavedPanel({ data }: { data: ImpactSeriesDatum[] }) {
  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
  const timeSummary = data
    .map((item) => `${item.label} ${item.value} minutes`)
    .join(", ");

  return (
    <section className="panel impact-chart-panel" aria-labelledby="impact-time-title">
      <ImpactPanelHeading
        id="impact-time-title"
        icon={Clock3}
        title="AI time savings"
        meta={`${totalMinutes} min saved`}
      />
      <div className="impact-time-total">
        <strong>{totalMinutes} min saved</strong>
        <span>Across intake, matching, and dispatch coordination</span>
      </div>
      <div
        className="impact-stacked-time"
        role="img"
        aria-label={`AI time saved split: ${timeSummary}. Total ${totalMinutes} minutes saved.`}
      >
        {data.map((item) => (
          <div
            key={item.label}
            className={`impact-time-segment impact-tone-${item.tone}`}
            style={{ flexBasis: `${(item.value / totalMinutes) * 100}%` }}
          >
            <span>{item.label}</span>
            <strong>{item.value}m</strong>
          </div>
        ))}
      </div>
      <ul className="impact-time-list">
        {data.map((item) => (
          <li key={item.label} className={`impact-tone-${item.tone}`}>
            <span className="impact-legend-swatch" aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{item.value} min</strong>
          </li>
        ))}
      </ul>
    </section>
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

  return (
    <section className="panel impact-role-panel" aria-labelledby="impact-role-title">
      <ImpactPanelHeading
        id="impact-role-title"
        icon={isDonor ? Building2 : Users}
        title="Shared donor and NGO value"
        meta={isDonor ? "Donor view active" : "NGO view active"}
      />
      <div className="impact-role-comparison" aria-label="Role-specific value">
        <article
          className={`impact-role-card ${isDonor ? "impact-role-card-active" : ""}`}
        >
          <div className="impact-role-card-header">
            <Building2 size={18} aria-hidden="true" />
            <span>{isDonor ? "Active view" : "Donor view"}</span>
          </div>
          <h3>Donor sees ESG proof</h3>
          <p>
            {donorName} gets a receipt tied to batch {batchId}, confirmed by the
            NGO before reporting language appears.
          </p>
          <strong>
            {formatOneDecimal(currentImpact.kgRescued)} kg rescued and{" "}
            {formatOneDecimal(currentImpact.co2eAvoidedKg)} kg CO2e avoided
          </strong>
          <ul>
            <li>Reduced disposal is tied to a named recipient.</li>
            <li>Receipt language stays separate from audited claims.</li>
            <li>Export copy is ready for ESG follow-up.</li>
          </ul>
        </article>

        <article
          className={`impact-role-card ${!isDonor ? "impact-role-card-active" : ""}`}
        >
          <div className="impact-role-card-header">
            <Users size={18} aria-hidden="true" />
            <span>{!isDonor ? "Active view" : "NGO view"}</span>
          </div>
          <h3>NGO sees community output</h3>
          <p>
            {ngoName} sees the same receipt as service output from {donorName},
            matched to demand and closed through shared routing.
          </p>
          <strong>
            {formatWholeNumber(currentImpact.mealEquivalents)} meal equivalents
            received
          </strong>
          <ul>
            <li>Pantry output can be traced to the donor handoff.</li>
            <li>Confirmed demand supports future pickup planning.</li>
            <li>Volunteer notes can reference the shared receipt.</li>
          </ul>
        </article>
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

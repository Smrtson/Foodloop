import { ChartLineUp, DownloadSimple, Leaf, Package, Timer, UsersThree } from "@phosphor-icons/react";
import { BarChart, LineChart } from "../components/Charts";
import { MetricCard } from "../components/MetricCard";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import type { ImpactMetrics } from "../types";

interface ImpactScreenProps {
  metrics: ImpactMetrics;
  pickupCompleted: boolean;
}

export function ImpactScreen({ metrics, pickupCompleted }: ImpactScreenProps) {
  return (
    <section className="impact-screen">
      <div className="panel impact-hero">
        <div>
          <span className="overline">Impact reporting</span>
          <h2>Food rescue outcomes</h2>
          <p>
            Demo metrics update after pickup completion, showing how RescueCore turns operational actions into
            donor-ready impact evidence.
          </p>
        </div>
        <div className="impact-hero-actions">
          <Badge tone={pickupCompleted ? "success" : "neutral"} icon={<ChartLineUp size={14} aria-hidden />}>
            {pickupCompleted ? "Latest pickup included" : "Baseline demo data"}
          </Badge>
          <Button variant="secondary" icon={<DownloadSimple size={16} weight="bold" aria-hidden />}>
            ESG report
          </Button>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard
          label="Meals rescued"
          value={metrics.mealsRescued.toLocaleString()}
          detail={pickupCompleted ? "Includes the bakery pickup" : "Current demo baseline"}
          icon={<UsersThree size={18} aria-hidden />}
          tone="emerald"
        />
        <MetricCard
          label="Food diverted"
          value={`${metrics.kgDiverted} kg`}
          detail="Recovered before waste stream"
          icon={<Package size={18} aria-hidden />}
          tone="blue"
        />
        <MetricCard
          label="CO2e avoided"
          value={`${metrics.co2eAvoidedKg} kg`}
          detail="Estimated with mock factors"
          icon={<Leaf size={18} aria-hidden />}
          tone="emerald"
        />
        <MetricCard
          label="Avg. match"
          value={`${metrics.averageMatchMinutes} min`}
          detail="Donor submit to NGO fit"
          icon={<Timer size={18} aria-hidden />}
          tone="amber"
        />
      </div>

      <div className="chart-grid">
        <LineChart data={metrics.weeklyTrend} highlighted={pickupCompleted} />
        <BarChart data={metrics.categoryBreakdown} />
      </div>

      <div className="panel reporting-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Report sections</span>
            <h2>Slide-ready status breakdown</h2>
          </div>
          <Badge tone="info">Mock ESG export</Badge>
        </div>
        <div className="report-grid">
          <article>
            <strong>Donor value</strong>
            <p>Batch-level evidence for rescued servings, diverted kilograms, and repeat donation readiness.</p>
          </article>
          <article>
            <strong>NGO value</strong>
            <p>Candidate fit, capacity availability, route ETA, and successful handoff status in one record.</p>
          </article>
          <article>
            <strong>Operator value</strong>
            <p>Faster triage, explainable scoring, and a clear escalation boundary for human review.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

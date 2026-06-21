import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
  tone?: "emerald" | "blue" | "amber" | "neutral";
}

export function MetricCard({ label, value, detail, icon, tone = "neutral" }: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-header">
        <span>{label}</span>
        {icon ? <span className="metric-icon">{icon}</span> : null}
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

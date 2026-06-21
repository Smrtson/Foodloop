import type { CSSProperties } from "react";
import type { ImpactMetrics } from "../types";

interface LineChartProps {
  data: ImpactMetrics["weeklyTrend"];
  highlighted?: boolean;
}

export function LineChart({ data, highlighted = false }: LineChartProps) {
  const width = 560;
  const height = 240;
  const padding = 34;
  const maxMeals = Math.max(...data.map((point) => point.meals));
  const minMeals = Math.min(...data.map((point) => point.meals));
  const range = Math.max(maxMeals - minMeals, 1);
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.meals - minMeals) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <figure className="chart-card">
      <figcaption>
        <span>Meals rescued by day</span>
        <strong>{highlighted ? "Pickup added to Sunday" : "Current week"}</strong>
      </figcaption>
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart of meals rescued by day">
        {[0, 1, 2, 3].map((row) => {
          const y = padding + row * ((height - padding * 2) / 3);
          return <line key={row} x1={padding} y1={y} x2={width - padding} y2={y} className="chart-gridline" />;
        })}
        <path d={path} className="chart-line" />
        {points.map((point) => (
          <g key={point.day}>
            <circle cx={point.x} cy={point.y} r={point.day === "Sun" && highlighted ? 7 : 5} className="chart-dot" />
            <text x={point.x} y={height - 8} textAnchor="middle" className="chart-label">
              {point.day}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

interface BarChartProps {
  data: ImpactMetrics["categoryBreakdown"];
}

export function BarChart({ data }: BarChartProps) {
  const max = Math.max(...data.map((item) => item.value));

  return (
    <figure className="chart-card">
      <figcaption>
        <span>Donation category mix</span>
        <strong>Share of rescued volume</strong>
      </figcaption>
      <div className="bar-chart" role="img" aria-label="Bar chart of rescued volume by category">
        {data.map((item) => (
          <div className="bar-row" key={item.label}>
            <div className="bar-meta">
              <span>{item.label}</span>
              <strong>{item.value}%</strong>
            </div>
            <div className="bar-trackless" style={{ "--bar-width": `${(item.value / max) * 100}%` } as CSSProperties}>
              <span />
            </div>
            <small>{item.status}</small>
          </div>
        ))}
      </div>
    </figure>
  );
}

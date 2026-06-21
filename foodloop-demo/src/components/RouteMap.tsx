import type { RoutePlan } from "../types";

interface RouteMapProps {
  plan: RoutePlan;
  status: "draft" | "recalculating" | "optimized" | "complete";
}

export function RouteMap({ plan, status }: RouteMapProps) {
  const [pickup, dropoff] = plan.stops;
  const midX = (pickup.mapX + dropoff.mapX) / 2;
  const path = `M ${pickup.mapX} ${pickup.mapY} C ${midX - 10} ${pickup.mapY - 26}, ${midX + 12} ${
    dropoff.mapY + 22
  }, ${dropoff.mapX} ${dropoff.mapY}`;

  return (
    <section className="route-map-card" aria-label="Route preview map">
      <div className="route-map-header">
        <div>
          <span className="overline">Route preview</span>
          <h3>{pickup.district} to {dropoff.district}</h3>
        </div>
        <span className={`route-state route-state-${status}`}>
          {status === "recalculating" ? "Recalculating" : status === "optimized" ? "Optimized" : status === "complete" ? "Completed" : "Draft"}
        </span>
      </div>
      <svg viewBox="0 0 100 100" className="route-map" role="img" aria-label={`${pickup.label} in ${pickup.district} to ${dropoff.label} in ${dropoff.district}`}>
        <rect x="4" y="8" width="92" height="78" rx="8" className="map-base" />
        <path d="M8 24H94M8 45H94M8 68H94M22 11V84M45 11V84M73 11V84" className="map-grid" />
        <path d="M12 76C26 58 32 60 46 69C62 79 72 72 88 54" className="map-road" />
        <path d="M8 32C23 34 36 30 48 23C64 15 78 18 92 31" className="map-road secondary" />
        <path d={path} className="route-path" />
        <g className="map-pin pickup-pin" transform={`translate(${pickup.mapX} ${pickup.mapY})`}>
          <circle r="5.4" />
          <text y="-8" textAnchor="middle">P</text>
        </g>
        <g className="map-pin dropoff-pin" transform={`translate(${dropoff.mapX} ${dropoff.mapY})`}>
          <circle r="5.4" />
          <text y="-8" textAnchor="middle">D</text>
        </g>
      </svg>
      <div className="route-map-footer">
        <span>{plan.distanceKm} km</span>
        <span>{plan.etaMinutes} min ETA</span>
        <span>{plan.pickupWindow}</span>
      </div>
    </section>
  );
}

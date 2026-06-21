import { ArrowClockwise, CheckCircle, ClipboardText, MapPin, Timer, Truck, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { RouteMap } from "../components/RouteMap";
import type { FoodBatch, NgoCandidate, RoutePlan } from "../types";

interface DispatchScreenProps {
  batch: FoodBatch;
  selectedNgo: NgoCandidate;
  routePlan: RoutePlan;
  routeStatus: "draft" | "recalculating" | "optimized" | "complete";
  pickupCompleted: boolean;
  onRecalculate: () => void;
  onCompletePickup: () => void;
}

export function DispatchScreen({
  batch,
  selectedNgo,
  routePlan,
  routeStatus,
  pickupCompleted,
  onRecalculate,
  onCompletePickup,
}: DispatchScreenProps) {
  const eta = routeStatus === "optimized" || routeStatus === "complete" ? routePlan.etaMinutes - 3 : routePlan.etaMinutes;

  return (
    <section className="screen-grid dispatch-grid">
      <RouteMap plan={{ ...routePlan, etaMinutes: eta }} status={routeStatus} />

      <div className="panel dispatch-details-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Assignment</span>
            <h2>Driver and handoff details</h2>
          </div>
          <Badge
            tone={routePlan.slaStatus === "On track" ? "success" : "warning"}
            icon={<Timer size={14} aria-hidden />}
          >
            {routePlan.slaStatus}
          </Badge>
        </div>

        <dl className="dispatch-list">
          <div>
            <dt>Driver</dt>
            <dd>{routePlan.driverName}</dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>{routePlan.vehicle}</dd>
          </div>
          <div>
            <dt>Pickup window</dt>
            <dd>{routePlan.pickupWindow}</dd>
          </div>
          <div>
            <dt>ETA</dt>
            <dd>{eta} minutes</dd>
          </div>
          <div>
            <dt>Donation</dt>
            <dd>{batch.quantityKg} kg bakery surplus</dd>
          </div>
          <div>
            <dt>Recipient</dt>
            <dd>{selectedNgo.name}</dd>
          </div>
        </dl>

        <div className="handoff-checklist">
          <h3>Handoff checklist</h3>
          <label>
            <input type="checkbox" checked readOnly />
            Sealed tray count matches donor record
          </label>
          <label>
            <input type="checkbox" checked readOnly />
            Allergen tags attached
          </label>
          <label>
            <input type="checkbox" checked={routeStatus === "optimized" || pickupCompleted} readOnly />
            Route optimized for open NGO window
          </label>
        </div>
      </div>

      <aside className="panel route-ops-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Dispatch controls</span>
            <h2>Route optimization</h2>
          </div>
          <Badge tone={pickupCompleted ? "success" : "info"} icon={<Truck size={14} aria-hidden />}>
            {pickupCompleted ? "Closed" : "Active route"}
          </Badge>
        </div>

        {routeStatus === "recalculating" ? (
          <div className="route-recalc-state" aria-live="polite">
            <span />
            <strong>Checking traffic and NGO window</strong>
            <p>Mock optimizer is comparing route time, intake cutoff, and allergen handoff tasks.</p>
          </div>
        ) : (
          <div className="optimization-list">
            {(routeStatus === "optimized"
              ? ["ETA reduced by 3 minutes after avoiding Queensway congestion.", ...routePlan.optimizationNotes]
              : routePlan.optimizationNotes
            ).map((note) => (
              <article key={note}>
                <CheckCircle size={16} weight="fill" aria-hidden />
                <p>{note}</p>
              </article>
            ))}
          </div>
        )}

        <div className="sla-card">
          <WarningCircle size={18} aria-hidden />
          <div>
            <strong>SLA summary</strong>
            <p>
              Pickup remains inside the donor window and the NGO intake team is available before the batch
              distribution cutoff.
            </p>
          </div>
        </div>

        <div className="action-stack">
          <Button
            variant="secondary"
            onClick={onRecalculate}
            disabled={routeStatus === "recalculating" || pickupCompleted}
            icon={<ArrowClockwise size={16} weight="bold" aria-hidden />}
          >
            Recalculate
          </Button>
          <Button
            variant="primary"
            onClick={onCompletePickup}
            disabled={routeStatus === "recalculating" || pickupCompleted}
            icon={<ClipboardText size={16} weight="bold" aria-hidden />}
          >
            {pickupCompleted ? "Pickup complete" : "Complete pickup"}
          </Button>
        </div>

        <div className="stop-stack">
          {routePlan.stops.map((stop) => (
            <div key={stop.label}>
              <MapPin size={16} aria-hidden />
              <span>
                <strong>{stop.label}</strong>
                <small>{stop.time}, {stop.address}</small>
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

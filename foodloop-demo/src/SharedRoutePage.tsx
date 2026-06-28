import {
  Bot,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  PackageCheck,
  Route as RouteIcon,
  Send,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { sharedRoutePlan } from "./data";
import type { Role, RouteStop, RouteTimelineStep } from "./types";

const completedReceivedTime = "1:08 PM";

function getUpdatedTimeline(isReceived: boolean): RouteTimelineStep[] {
  if (!isReceived) {
    return sharedRoutePlan.timeline;
  }

  return sharedRoutePlan.timeline.map((step) => {
    if (step.id === "pickup-scheduled") {
      return {
        ...step,
        note: "Pickup completed and handed off for drop-off.",
        status: "done",
      };
    }

    if (step.id === "received") {
      return {
        ...step,
        time: completedReceivedTime,
        note: "NGO confirmed the received batch.",
        status: "done",
      };
    }

    return step;
  });
}

function getCounterpart(activeRole: Role) {
  if (activeRole === "donor") {
    return {
      icon: Users,
      label: "Receiving partner",
      name: sharedRoutePlan.ngoName,
      meta: "Central and Sheung Wan",
      detail: "Maya Lau confirms receipt after drop-off.",
      note: "Capacity covers the full bakery batch.",
    };
  }

  return {
    icon: Building2,
    label: "Donor partner",
    name: sharedRoutePlan.donorName,
    meta: "Queen's Road East, Wan Chai",
    detail: "Mr. Chan has the side entrance pickup ready.",
    note: "Batch record and pickup notes are already accepted.",
  };
}

export function SharedRoutePage({ activeRole }: { activeRole: Role }) {
  const [isTracking, setIsTracking] = useState(false);
  const [isReceived, setIsReceived] = useState(false);

  const timeline = useMemo(() => getUpdatedTimeline(isReceived), [isReceived]);
  const counterpart = getCounterpart(activeRole);
  const CounterpartIcon = counterpart.icon;
  const routeStatus = isReceived
    ? "Received confirmed"
    : isTracking
      ? "Pickup tracking active"
      : sharedRoutePlan.slaStatus;
  const actionLabel =
    activeRole === "donor"
      ? isReceived
        ? "Receipt Confirmed"
        : isTracking
          ? "Tracking Active"
          : "Track Pickup"
      : isReceived
        ? "Received Confirmed"
        : "Confirm Received";
  const actionStatus =
    activeRole === "donor"
      ? isReceived
        ? "Harbour Care Kitchen has confirmed the received batch."
        : isTracking
          ? "Pickup tracking is active for the donor team."
          : "Track the scheduled pickup from the donor view."
      : isReceived
        ? "Receipt is confirmed and the shared route is closed."
        : "Confirm once the batch arrives at Harbour Care Kitchen.";
  const isActionComplete = activeRole === "donor" ? isTracking || isReceived : isReceived;

  const handlePrimaryAction = () => {
    if (activeRole === "donor") {
      setIsTracking(true);
      return;
    }

    setIsReceived(true);
  };

  return (
    <section className="page-stack route-page" aria-labelledby="route-title">
      <div className="page-heading route-heading">
        <div>
          <p className="page-kicker">Accepted shared route</p>
          <h1 id="route-title">Shared Route</h1>
          <p>
            Accepted donor-to-NGO pairing with the live pickup window, mock
            route, shared timeline, and role-aware confirmation.
          </p>
        </div>

        <div className="heading-meta" aria-label="Route summary">
          <span>{activeRole === "donor" ? "Donor view" : "NGO view"}</span>
          <span>{sharedRoutePlan.batchId}</span>
          <span>{routeStatus}</span>
        </div>
      </div>

      <div className="route-overview-strip" aria-label="Route overview">
        <RouteMetric
          icon={PackageCheck}
          label="Accepted pairing"
          value={`${sharedRoutePlan.donorName} to ${sharedRoutePlan.ngoName}`}
          note={sharedRoutePlan.quantityLabel}
        />
        <RouteMetric
          icon={Clock3}
          label="ETA"
          value={sharedRoutePlan.etaLabel}
          note={sharedRoutePlan.routeDistanceLabel}
        />
        <RouteMetric
          icon={CalendarClock}
          label="Pickup window"
          value={sharedRoutePlan.pickupWindow}
          note={sharedRoutePlan.slaStatus}
        />
        <RouteMetric
          icon={RouteIcon}
          label="Assigned route"
          value={sharedRoutePlan.driverName}
          note={`Volunteer: ${sharedRoutePlan.volunteerName}`}
        />
      </div>

      <div className="route-workspace-grid">
        <section className="panel route-map-panel" aria-labelledby="route-map-title">
          <RoutePanelHeading
            id="route-map-title"
            icon={MapPin}
            title="Pickup and drop-off"
            meta={routeStatus}
          />

          <div
            className={[
              "mock-route-map",
              isTracking || isReceived ? "mock-route-map-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`${sharedRoutePlan.donorName} to ${sharedRoutePlan.ngoName} route map`}
          >
            <span className="map-road map-road-main" aria-hidden="true" />
            <span className="map-road map-road-cross" aria-hidden="true" />
            <span className="map-route-line" aria-hidden="true" />
            <span className="map-route-turn map-route-turn-first" aria-hidden="true" />
            <span className="map-route-turn map-route-turn-second" aria-hidden="true" />

            <MapWaypoint stop={sharedRoutePlan.stops[0]} />
            <MapWaypoint stop={sharedRoutePlan.stops[1]} />

            <div className="map-eta-card">
              <span>{sharedRoutePlan.agent.statusLabel}</span>
              <strong>{sharedRoutePlan.etaLabel}</strong>
            </div>
          </div>

          <div className="route-stop-grid" aria-label="Route stops">
            {sharedRoutePlan.stops.map((stop) => (
              <RouteStopCard key={stop.id} stop={stop} />
            ))}
          </div>
        </section>

        <section
          className="panel route-agent-panel"
          aria-labelledby="route-agent-title"
        >
          <RoutePanelHeading
            id="route-agent-title"
            icon={Bot}
            title={sharedRoutePlan.agent.agentName}
            meta={`${sharedRoutePlan.agent.confidence}% confidence`}
          />

          <div className="route-agent-copy">
            <RouteIcon size={18} aria-hidden="true" />
            <p>{sharedRoutePlan.agent.summary}</p>
          </div>

          <div className="route-agent-facts" aria-label="Route recommendation">
            <RouteFact
              label="ETA"
              value={sharedRoutePlan.agent.etaLabel}
              note={sharedRoutePlan.routeDistanceLabel}
            />
            <RouteFact
              label="Window"
              value={sharedRoutePlan.agent.pickupWindow}
              note={sharedRoutePlan.agent.statusLabel}
            />
          </div>

          <ul className="route-reason-list">
            {sharedRoutePlan.agent.reasons.map((reason) => (
              <li key={reason}>
                <Check size={14} aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel route-timeline-panel" aria-labelledby="route-timeline-title">
          <RoutePanelHeading
            id="route-timeline-title"
            icon={CheckCircle2}
            title="Shared timeline"
            meta={isReceived ? "Closed" : "In progress"}
          />

          <ol className="route-timeline">
            {timeline.map((step) => (
              <li
                key={step.id}
                className={`route-timeline-step route-timeline-step-${step.status}`}
              >
                <span className="route-timeline-marker" aria-hidden="true">
                  {step.status === "done" ? <Check size={13} /> : null}
                </span>
                <div>
                  <strong>{step.label}</strong>
                  <span>{step.time}</span>
                  <p>{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="panel route-action-panel" aria-label="Route confirmation">
          <RoutePanelHeading
            icon={activeRole === "donor" ? Eye : Send}
            title={activeRole === "donor" ? "Donor action" : "NGO action"}
            meta={activeRole === "donor" ? "Track pickup" : "Confirm receipt"}
          />

          <div className="counterpart-preview">
            <CounterpartIcon size={18} aria-hidden="true" />
            <div>
              <span>{counterpart.label}</span>
              <strong>{counterpart.name}</strong>
              <small>{counterpart.meta}</small>
              <p>{counterpart.detail}</p>
            </div>
          </div>

          <div className="route-action-state" aria-live="polite">
            {isActionComplete ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : (
              <Clock3 size={18} aria-hidden="true" />
            )}
            <span>{actionStatus}</span>
          </div>

          <button
            type="button"
            className="button button-primary route-primary-action"
            disabled={isActionComplete}
            onClick={handlePrimaryAction}
          >
            {isActionComplete ? (
              <CheckCircle2 size={17} aria-hidden="true" />
            ) : activeRole === "donor" ? (
              <Eye size={17} aria-hidden="true" />
            ) : (
              <Send size={17} aria-hidden="true" />
            )}
            {actionLabel}
          </button>

          <div className="route-handoff-note">
            <span>{sharedRoutePlan.title}</span>
            <strong>{sharedRoutePlan.itemDescription}</strong>
            <p>{counterpart.note}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function RouteMetric({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="panel route-metric">
      <Icon size={18} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

function RoutePanelHeading({
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
    <div className="route-panel-heading">
      <div>
        <Icon size={18} aria-hidden="true" />
        <h2 id={id}>{title}</h2>
      </div>
      <span>{meta}</span>
    </div>
  );
}

function MapWaypoint({ stop }: { stop: RouteStop }) {
  return (
    <div className={`map-waypoint map-waypoint-${stop.kind}`}>
      <span className="map-pin-dot" aria-hidden="true">
        <MapPin size={17} />
      </span>
      <div>
        <span>{stop.label}</span>
        <strong>{stop.name}</strong>
      </div>
    </div>
  );
}

function RouteStopCard({ stop }: { stop: RouteStop }) {
  return (
    <article className="route-stop-card">
      <span>{stop.label}</span>
      <strong>{stop.name}</strong>
      <small>{stop.address}</small>
      <p>{stop.window}</p>
      <em>{stop.note}</em>
    </article>
  );
}

function RouteFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="route-fact">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

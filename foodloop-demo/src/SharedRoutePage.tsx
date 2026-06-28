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
import maplibregl from "maplibre-gl";
import type { ErrorEvent, StyleSpecification } from "maplibre-gl";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { sharedRoutePlan } from "./data";
import type { Role, RouteStop, RouteTimelineStep, SharedRoutePlan } from "./types";

const completedReceivedTime = "1:08 PM";
const routeSourceId = "shared-route-source";
const routeCasingLayerId = "shared-route-casing";
const routeLineLayerId = "shared-route-line";

const openStreetMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-raster",
      type: "raster",
      source: "osm-raster",
    },
  ],
};

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
            Accepted donor-to-NGO pairing with the live pickup window, route
            map, shared timeline, and role-aware confirmation.
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

          <RouteMap routePlan={sharedRoutePlan} isActive={isTracking || isReceived} />

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

function RouteMap({
  routePlan,
  isActive,
}: {
  routePlan: SharedRoutePlan;
  isActive: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasMapFailed, setHasMapFailed] = useState(false);

  useEffect(() => {
    if (hasMapFailed || !mapContainerRef.current) {
      return;
    }

    const firstCoordinate = routePlan.routeGeometry.coordinates[0];

    if (!firstCoordinate) {
      setHasMapFailed(true);
      return;
    }

    let isDisposed = false;
    let map: maplibregl.Map | null = null;
    const markers: maplibregl.Marker[] = [];

    const showFallback = () => {
      if (!isDisposed) {
        setHasMapFailed(true);
      }
    };

    try {
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: openStreetMapStyle,
        center: firstCoordinate,
        zoom: 14,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });

      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        const loadedMap = map;

        if (!loadedMap || isDisposed) {
          return;
        }

        loadedMap.addSource(routeSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: routePlan.routeGeometry,
          },
        });

        loadedMap.addLayer({
          id: routeCasingLayerId,
          type: "line",
          source: routeSourceId,
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#ffffff",
            "line-opacity": 0.92,
            "line-width": 11,
          },
        });

        loadedMap.addLayer({
          id: routeLineLayerId,
          type: "line",
          source: routeSourceId,
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#2563eb",
            "line-opacity": 0.96,
            "line-width": 5,
          },
        });

        routePlan.stops.forEach((stop) => {
          const marker = new maplibregl.Marker({
            element: createRouteMarkerElement(stop),
            anchor: "bottom",
            offset: [0, -4],
          })
            .setLngLat(stop.coordinates)
            .addTo(loadedMap);

          markers.push(marker);
        });

        const bounds = routePlan.routeGeometry.coordinates.reduce(
          (currentBounds, coordinate) => currentBounds.extend(coordinate),
          new maplibregl.LngLatBounds(firstCoordinate, firstCoordinate),
        );

        loadedMap.fitBounds(bounds, {
          padding: {
            top: 64,
            right: 52,
            bottom: 58,
            left: 52,
          },
          maxZoom: 15,
          duration: 0,
        });
      });

      map.on("error", (event: ErrorEvent) => {
        if (event.error) {
          showFallback();
        }
      });
    } catch {
      showFallback();
    }

    return () => {
      isDisposed = true;
      markers.forEach((marker) => marker.remove());
      map?.remove();
    };
  }, [hasMapFailed, routePlan]);

  if (hasMapFailed) {
    return <RouteMapFallback routePlan={routePlan} isActive={isActive} />;
  }

  return (
    <div
      className={[
        "route-map-shell",
        isActive ? "route-map-shell-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${routePlan.donorName} to ${routePlan.ngoName} route map`}
    >
      <div ref={mapContainerRef} className="route-map-canvas" />
      <div className="map-eta-card">
        <span>{routePlan.agent.statusLabel}</span>
        <strong>{routePlan.etaLabel}</strong>
      </div>
    </div>
  );
}

function RouteMapFallback({
  routePlan,
  isActive,
}: {
  routePlan: SharedRoutePlan;
  isActive: boolean;
}) {
  return (
    <div
      className={[
        "route-map-shell",
        "route-map-fallback",
        isActive ? "route-map-shell-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={`${routePlan.donorName} to ${routePlan.ngoName} route map fallback`}
    >
      <span className="route-map-fallback-grid" aria-hidden="true" />
      <span className="route-map-fallback-path" aria-hidden="true" />
      <span className="route-map-fallback-path route-map-fallback-path-shadow" aria-hidden="true" />

      <MapWaypoint stop={routePlan.stops[0]} />
      <MapWaypoint stop={routePlan.stops[1]} />

      <div className="route-map-fallback-badge">
        <span>Local route fallback</span>
        <strong>{routePlan.routeDistanceLabel}</strong>
      </div>

      <div className="map-eta-card">
        <span>{routePlan.agent.statusLabel}</span>
        <strong>{routePlan.etaLabel}</strong>
      </div>
    </div>
  );
}

function createRouteMarkerElement(stop: RouteStop) {
  const marker = document.createElement("div");
  marker.className = `route-map-marker route-map-marker-${stop.kind}`;
  marker.setAttribute("aria-label", `${stop.label}: ${stop.name}`);

  const pin = document.createElement("span");
  pin.className = "route-map-marker-pin";
  pin.textContent = stop.kind === "pickup" ? "P" : "D";

  const label = document.createElement("span");
  label.className = "route-map-marker-label";
  label.textContent = stop.label;

  const name = document.createElement("strong");
  name.textContent = stop.name;

  const copy = document.createElement("span");
  copy.className = "route-map-marker-copy";
  copy.append(label, name);

  marker.append(pin, copy);

  return marker;
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

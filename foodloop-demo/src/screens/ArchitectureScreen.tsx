import { ArrowRight, Brain, ChartLineUp, Database, MapTrifold, ShieldCheck, Sparkle, Truck } from "@phosphor-icons/react";
import { Badge } from "../components/Badge";

const layers = [
  {
    title: "Input",
    icon: Database,
    items: ["Donor photo", "Batch form", "Pickup location", "Allergen tags"],
  },
  {
    title: "Intelligence",
    icon: Brain,
    items: ["Risk scoring", "Reason generation", "Human review boundary", "Decision log"],
  },
  {
    title: "Optimization",
    icon: MapTrifold,
    items: ["NGO ranking", "Capacity fit", "Route ETA", "SLA status"],
  },
  {
    title: "Output",
    icon: ChartLineUp,
    items: ["Dispatch task", "Impact metrics", "ESG export", "Demo narrative"],
  },
];

export function ArchitectureScreen() {
  return (
    <section className="architecture-screen">
      <div className="panel architecture-hero">
        <div>
          <span className="overline">Technical overview</span>
          <h2>RescueCore prototype architecture</h2>
          <p>
            The prototype simulates AI decision support locally. It shows the future product path without claiming
            production food-safety certification or live routing.
          </p>
        </div>
        <Badge tone="info" icon={<ShieldCheck size={14} weight="fill" aria-hidden />}>
          Decision support only
        </Badge>
      </div>

      <div className="architecture-diagram" aria-label="FoodLoop RescueCore architecture layers">
        {layers.map((layer, index) => {
          const Icon = layer.icon;
          return (
            <article className="architecture-layer" key={layer.title}>
              <div className="layer-icon">
                <Icon size={24} weight="duotone" aria-hidden />
              </div>
              <h3>{layer.title}</h3>
              <ul>
                {layer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {index < layers.length - 1 ? (
                <span className="layer-arrow" aria-hidden>
                  <ArrowRight size={20} weight="bold" />
                </span>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="architecture-grid">
        <article className="panel architecture-tile">
          <Sparkle size={22} weight="fill" aria-hidden />
          <h3>What is simulated</h3>
          <p>
            Photo extraction, risk scoring, NGO ranking, ETA calculation, and impact metrics are deterministic
            TypeScript functions using Hong Kong mock data.
          </p>
        </article>
        <article className="panel architecture-tile">
          <Truck size={22} weight="fill" aria-hidden />
          <h3>MVP path</h3>
          <p>
            Replace mock inputs with authenticated donor uploads, coordinator review queues, route-provider APIs,
            and auditable partner handoff records.
          </p>
        </article>
        <article className="panel architecture-tile">
          <ShieldCheck size={22} weight="fill" aria-hidden />
          <h3>Safety posture</h3>
          <p>
            The AI layer recommends next actions and explains why. Human coordinators remain accountable for food
            acceptance and escalation.
          </p>
        </article>
      </div>
    </section>
  );
}

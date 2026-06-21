import { CheckCircle, Info, SealCheck, Truck, UsersThree, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import type { FoodBatch, NgoCandidate, RiskResult } from "../types";

interface MatchingScreenProps {
  batch: FoodBatch;
  risk: RiskResult;
  candidates: NgoCandidate[];
  selectedNgoId: string;
  ngoConfirmed: boolean;
  onSelectNgo: (ngoId: string) => void;
  onConfirmNgo: () => void;
}

export function MatchingScreen({
  batch,
  risk,
  candidates,
  selectedNgoId,
  ngoConfirmed,
  onSelectNgo,
  onConfirmNgo,
}: MatchingScreenProps) {
  const selectedNgo = candidates.find((candidate) => candidate.id === selectedNgoId) ?? candidates[0];
  const riskTone = risk.label === "High" ? "danger" : risk.label === "Medium" ? "warning" : "success";

  return (
    <section className="screen-grid matching-grid">
      <div className="panel match-summary-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Batch summary</span>
            <h2>{batch.donorName}</h2>
          </div>
          <Badge tone={riskTone} icon={<WarningCircle size={14} aria-hidden />}>
            {risk.label} risk
          </Badge>
        </div>
        <dl className="summary-list">
          <div>
            <dt>Food type</dt>
            <dd>{batch.category}</dd>
          </div>
          <div>
            <dt>Volume</dt>
            <dd>{batch.quantityKg} kg</dd>
          </div>
          <div>
            <dt>Service window</dt>
            <dd>{batch.consumeWithinHours} hours</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{batch.location.district}</dd>
          </div>
        </dl>
        <div className="risk-card">
          <strong>Why this needs coordinator review</strong>
          <p>{risk.recommendation}</p>
          <div className="risk-reason-chips">
            {risk.reasons.slice(0, 3).map((reason) => (
              <span key={reason.title}>{reason.title}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="panel ranked-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Ranked NGOs</span>
            <h2>Recommended match</h2>
          </div>
          <Badge tone={ngoConfirmed ? "success" : "info"} icon={<UsersThree size={14} aria-hidden />}>
            {ngoConfirmed ? "Confirmed" : `${candidates.length} candidates`}
          </Badge>
        </div>

        <div className="ngo-list">
          {candidates.map((candidate, index) => {
            const isSelected = candidate.id === selectedNgoId;
            return (
              <article className={`ngo-card ${isSelected ? "is-selected" : ""}`} key={candidate.id}>
                <button type="button" className="ngo-card-button" onClick={() => onSelectNgo(candidate.id)}>
                  <span className="rank-number">{index + 1}</span>
                  <span>
                    <strong>{candidate.name}</strong>
                    <small>{candidate.focus}</small>
                  </span>
                  <span className="ngo-score">{candidate.score}%</span>
                </button>
                <div className="ngo-meta">
                  <span>{candidate.district}</span>
                  <span>{candidate.routeMinutesFromDonor} min route</span>
                  <span>{candidate.capacityKg} kg capacity</span>
                  <span>{candidate.vehicleStatus}</span>
                </div>
                {isSelected ? (
                  <div className="score-breakdown" aria-label={`Score breakdown for ${candidate.name}`}>
                    {Object.entries(candidate.scoreBreakdown ?? {}).map(([key, value]) => (
                      <div key={key}>
                        <span>{formatScoreKey(key)}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>

      <aside className="panel recommendation-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Selected recommendation</span>
            <h2>{selectedNgo.name}</h2>
          </div>
          <Badge tone="success" icon={<SealCheck size={14} weight="fill" aria-hidden />}>
            {selectedNgo.score}% fit
          </Badge>
        </div>
        <div className="selected-ngo-detail">
          <p>{selectedNgo.focus}</p>
          <dl className="compact-dl">
            <div>
              <dt>Contact</dt>
              <dd>{selectedNgo.contactName}</dd>
            </div>
            <div>
              <dt>Open window</dt>
              <dd>{selectedNgo.openWindow}</dd>
            </div>
            <div>
              <dt>Reliability</dt>
              <dd>{Math.round(selectedNgo.reliability * 100)}%</dd>
            </div>
            <div>
              <dt>Active clients</dt>
              <dd>{selectedNgo.activeClients}</dd>
            </div>
          </dl>
          <div className="note-stack">
            {selectedNgo.matchNotes?.map((note) => (
              <span key={note}>
                <CheckCircle size={14} weight="fill" aria-hidden />
                {note}
              </span>
            ))}
          </div>
          <div className="formula-box">
            <Info size={16} aria-hidden />
            <p>
              Score = category fit + capacity + response + route + risk fit + reliability. This is mock decision
              support for demo use.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={onConfirmNgo}
          icon={<Truck size={16} weight="bold" aria-hidden />}
          className="full-width"
        >
          {ngoConfirmed ? "Open Dispatch" : "Confirm NGO"}
        </Button>
      </aside>
    </section>
  );
}

function formatScoreKey(key: string) {
  return key
    .replace("categoryFit", "Category")
    .replace("capacityFit", "Capacity")
    .replace("responseFit", "Response")
    .replace("routeFit", "Route")
    .replace("riskFit", "Risk");
}

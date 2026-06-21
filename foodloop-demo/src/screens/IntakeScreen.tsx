import { Camera, CheckCircle, CloudArrowUp, MagicWand, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import bakeryAsset from "../assets/bakery-surplus.svg";
import type { FoodBatch, RiskResult } from "../types";

interface IntakeScreenProps {
  batch: FoodBatch;
  risk: RiskResult;
  analysisStatus: "idle" | "analyzing" | "ready";
  batchSubmitted: boolean;
  onAnalyze: () => void;
  onSubmit: () => void;
}

export function IntakeScreen({
  batch,
  risk,
  analysisStatus,
  batchSubmitted,
  onAnalyze,
  onSubmit,
}: IntakeScreenProps) {
  const ready = analysisStatus === "ready";

  return (
    <section className="screen-grid intake-grid">
      <div className="panel upload-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Donor upload</span>
            <h2>Bakery surplus intake</h2>
          </div>
          <Badge tone={ready ? "success" : "neutral"} icon={<Camera size={14} aria-hidden />}>
            {ready ? "Photo analyzed" : "Photo pending"}
          </Badge>
        </div>

        <div className="form-field">
          <label htmlFor="photo-upload">Donation photo</label>
          <input id="photo-upload" className="sr-only" type="file" accept="image/*" />
          <div className="upload-preview" aria-describedby="photo-help">
            <img src={bakeryAsset} alt="Generated bakery surplus trays prepared for donation pickup" />
            <label className="upload-dropzone" htmlFor="photo-upload">
              <CloudArrowUp size={20} aria-hidden />
              <span>Replace image</span>
            </label>
          </div>
          <p id="photo-help">Mock upload for the pitch demo. The analysis step uses deterministic local logic.</p>
        </div>

        <div className="intake-actions">
          <Button
            variant="primary"
            onClick={onAnalyze}
            disabled={analysisStatus === "analyzing"}
            icon={<MagicWand size={16} weight="bold" aria-hidden />}
          >
            {analysisStatus === "analyzing" ? "Analyzing" : ready ? "Reanalyze" : "Analyze photo"}
          </Button>
          <Button variant="secondary" onClick={onSubmit} disabled={!ready || batchSubmitted}>
            {batchSubmitted ? "Sent to Matching" : "Submit to Matching"}
          </Button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <span className="overline">AI draft</span>
            <h2>Extracted batch record</h2>
          </div>
          {ready ? (
            <Badge tone={risk.label === "Medium" ? "warning" : "success"} icon={<CheckCircle size={14} weight="fill" aria-hidden />}>
              {risk.decision}
            </Badge>
          ) : null}
        </div>

        {analysisStatus === "analyzing" ? (
          <div className="skeleton-stack" aria-label="Analyzing donation photo">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : (
          <div className={`batch-form ${ready ? "" : "is-muted"}`}>
            <div className="form-grid two">
              <div className="form-field">
                <label htmlFor="donor-name">Donor</label>
                <input id="donor-name" readOnly value={ready ? batch.donorName : "Awaiting analysis"} />
              </div>
              <div className="form-field">
                <label htmlFor="donor-type">Donor type</label>
                <input id="donor-type" readOnly value={ready ? batch.donorType : "Awaiting analysis"} />
              </div>
              <div className="form-field">
                <label htmlFor="category">Food category</label>
                <input id="category" readOnly value={ready ? batch.category : "Awaiting analysis"} />
              </div>
              <div className="form-field">
                <label htmlFor="quantity">Quantity</label>
                <input id="quantity" readOnly value={ready ? `${batch.quantityKg} kg, ${batch.servings} servings` : "Awaiting analysis"} />
              </div>
              <div className="form-field">
                <label htmlFor="storage">Storage</label>
                <input id="storage" readOnly value={ready ? `${batch.storage}, ${batch.temperatureC}C` : "Awaiting analysis"} />
              </div>
              <div className="form-field">
                <label htmlFor="window">Service window</label>
                <input id="window" readOnly value={ready ? `${batch.consumeWithinHours} hours remaining` : "Awaiting analysis"} />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="items">Detected items</label>
              <textarea id="items" readOnly value={ready ? batch.items.join(", ") : "Awaiting analysis"} />
            </div>

            <div className="form-field">
              <label htmlFor="allergens">Allergen tags</label>
              <input id="allergens" readOnly value={ready ? batch.allergens.join(", ") : "Awaiting analysis"} />
            </div>
          </div>
        )}
      </div>

      <aside className="panel decision-panel">
        <div className="panel-heading">
          <div>
            <span className="overline">Decision support</span>
            <h2>Risk explanation</h2>
          </div>
          <Badge tone={ready ? "warning" : "neutral"} icon={<WarningCircle size={14} aria-hidden />}>
            {ready ? `${risk.score}/100` : "Waiting"}
          </Badge>
        </div>
        {ready ? (
          <>
            <p className="decision-copy">{risk.recommendation}</p>
            <div className="reason-list">
              {risk.reasons.map((reason) => (
                <article className={`reason reason-${reason.severity}`} key={reason.title}>
                  <strong>{reason.title}</strong>
                  <p>{reason.detail}</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <MagicWand size={28} aria-hidden />
            <strong>Analysis not run yet</strong>
            <p>Use the guided demo button to extract a batch record and generate support reasons.</p>
          </div>
        )}
      </aside>
    </section>
  );
}

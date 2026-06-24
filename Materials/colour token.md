# FoodLoop Website Design Token Spec

## Summary

This Markdown-only specification defines the design token system for the FoodLoop demo website. The visual direction is a light ESG SaaS dashboard: fresh, credible, operational, and suitable for pitch screenshots.

The token system uses three layers:

1. Primitive tokens: raw color, spacing, radius, typography, shadow, and motion values.
2. Semantic tokens: purpose-based aliases for brand, status, surface, text, and interaction roles.
3. Component tokens: UI-specific contracts for buttons, cards, forms, badges, KPI modules, matching, dispatch, risk, chart, and architecture screens.

This is a design handoff spec only. It does not introduce CSS, JSON, Tailwind config, React components, or dark mode implementation.

## Design Intent

FoodLoop should feel like an operational coordination product, not a generic admin table and not a consumer food app.

| Attribute | Direction |
| --- | --- |
| Product category | ESG SaaS dashboard |
| Mood | Fresh, trusted, compact, explainable |
| Primary signal | Food rescue and sustainability |
| Secondary signal | AI routing, dispatch, system intelligence |
| Density | Compact dashboard density for desktop pitch walkthroughs |
| Theme | Light-only v1, semantically themeable later |
| Language support | English plus Traditional Chinese labels |

## Token Naming

Use this naming pattern:

```css
--{category}-{role}-{variant}-{state}
```

Examples:

```css
--color-brand-primary
--color-risk-medium-soft
--button-primary-bg-hover
--ngo-match-score-color
```

Rules:

- Component tokens must reference semantic tokens, not primitive hex values.
- Semantic tokens should carry product meaning: brand, logistics, risk, surface, text, border.
- Primitive tokens should stay stable and raw.
- Risk tokens must describe handling priority and review state, not food-safety certification.
- Blue is reserved for AI, logistics, routing, dispatch, and system intelligence.
- Green is the dominant FoodLoop identity. Filled white-text primary actions use the darker green action role.

## Layer 1: Primitive Tokens

Primitive tokens are raw values. These may be implemented later in CSS, JSON, or a Tailwind theme, but this file remains Markdown-only.

### Primitive Colors

```css
:root {
  /* FoodLoop green */
  --color-green-50: #E7F6EF;
  --color-green-100: #CDECDD;
  --color-green-200: #B9E4CF;
  --color-green-500: #31A873;
  --color-green-600: #178F5D;
  --color-green-700: #0F7A4D;
  --color-green-800: #0B5F3C;

  /* Logistics blue */
  --color-blue-50: #EAF1FF;
  --color-blue-100: #DBEAFE;
  --color-blue-200: #C7D8FF;
  --color-blue-500: #4F83F1;
  --color-blue-600: #2563EB;
  --color-blue-700: #1D4ED8;

  /* Risk amber */
  --color-amber-50: #FFF7ED;
  --color-amber-100: #FFEDD5;
  --color-amber-600: #D97706;
  --color-amber-700: #B45309;
  --color-amber-800: #92400E;

  /* Urgent red */
  --color-red-50: #FEF2F2;
  --color-red-100: #FEE2E2;
  --color-red-600: #DC2626;
  --color-red-700: #B91C1C;

  /* Neutral slate */
  --color-slate-50: #F7FAF8;
  --color-slate-100: #F1F5F3;
  --color-slate-200: #DDE7E1;
  --color-slate-300: #B7C8BE;
  --color-slate-500: #7A8A82;
  --color-slate-600: #52635B;
  --color-slate-700: #33443B;
  --color-slate-900: #14211B;
  --color-blue-slate-500: #64748B;
  --color-map-50: #F3F7F5;

  /* Absolute */
  --color-white: #FFFFFF;
}
```

### Primitive Spacing

Use a 4px base unit for compact dashboard layouts.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

### Primitive Radius

Keep corners restrained. Cards and panels should not exceed 8px in v1.

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

### Primitive Typography

```css
:root {
  --font-ui: Inter, "Noto Sans TC", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", monospace;

  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-kpi: 32px;

  --line-height-tight: 1.2;
  --line-height-ui: 1.45;
  --line-height-body: 1.6;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --letter-spacing-normal: 0;
}
```

### Primitive Shadows And Motion

```css
:root {
  --shadow-xs: 0 1px 2px rgb(20 33 27 / 0.05);
  --shadow-sm: 0 2px 8px rgb(20 33 27 / 0.08);
  --shadow-md: 0 8px 24px rgb(20 33 27 / 0.10);

  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

## Layer 2: Semantic Tokens

Semantic tokens define product meaning. They should be the main tokens used by layouts and components.

### Core Color Roles

These roles must resolve to the exact values below. `--color-brand-primary` remains the FoodLoop identity green for brand presence, match scores, charts, and success indicators. Filled buttons that place white text on green use the darker action green so compact 13px labels meet contrast requirements.

```css
:root {
  --color-brand-primary: #178F5D;
  --color-brand-primary-hover: #0F7A4D;
  --color-brand-primary-soft: #E7F6EF;
  --color-brand-primary-border: #B9E4CF;
  --color-brand-action: #0F7A4D;
  --color-brand-action-hover: #0B5F3C;
  --color-brand-action-fg: #FFFFFF;
  --color-brand-chart-alt: #31A873;

  --color-accent-logistics: #2563EB;
  --color-accent-logistics-hover: #1D4ED8;
  --color-accent-logistics-soft: #EAF1FF;
  --color-accent-logistics-border: #C7D8FF;
  --color-accent-logistics-chart-alt: #4F83F1;

  --color-risk-low: #178F5D;
  --color-risk-low-soft: #E7F6EF;
  --color-risk-low-border: #B9E4CF;
  --color-risk-medium: #D97706;
  --color-risk-medium-soft: #FFF7ED;
  --color-risk-medium-border: #FFEDD5;
  --color-risk-urgent: #DC2626;
  --color-risk-urgent-hover: #B91C1C;
  --color-risk-urgent-soft: #FEF2F2;
  --color-risk-urgent-border: #FEE2E2;
  --color-risk-review: #64748B;

  --color-bg-page: #F7FAF8;
  --color-bg-surface: #FFFFFF;
  --color-bg-muted: #F1F5F3;

  --color-text-primary: #14211B;
  --color-text-secondary: #52635B;
  --color-text-muted: #7A8A82;

  --color-border-subtle: #DDE7E1;
  --color-border-strong: #B7C8BE;
}
```

Recommended layered implementation later:

```css
:root {
  --color-brand-primary: var(--color-green-600);
  --color-brand-primary-hover: var(--color-green-700);
  --color-brand-primary-soft: var(--color-green-50);
  --color-brand-primary-border: var(--color-green-200);
  --color-brand-action: var(--color-green-700);
  --color-brand-action-hover: var(--color-green-800);
  --color-brand-action-fg: var(--color-white);
  --color-brand-chart-alt: var(--color-green-500);

  --color-accent-logistics: var(--color-blue-600);
  --color-accent-logistics-hover: var(--color-blue-700);
  --color-accent-logistics-soft: var(--color-blue-50);
  --color-accent-logistics-border: var(--color-blue-200);
  --color-accent-logistics-chart-alt: var(--color-blue-500);

  --color-risk-low: var(--color-green-600);
  --color-risk-low-soft: var(--color-green-50);
  --color-risk-low-border: var(--color-green-200);
  --color-risk-medium: var(--color-amber-600);
  --color-risk-medium-soft: var(--color-amber-50);
  --color-risk-medium-border: var(--color-amber-100);
  --color-risk-urgent: var(--color-red-600);
  --color-risk-urgent-hover: var(--color-red-700);
  --color-risk-urgent-soft: var(--color-red-50);
  --color-risk-urgent-border: var(--color-red-100);
  --color-risk-review: var(--color-blue-slate-500);

  --color-bg-page: var(--color-slate-50);
  --color-bg-surface: var(--color-white);
  --color-bg-muted: var(--color-slate-100);

  --color-text-primary: var(--color-slate-900);
  --color-text-secondary: var(--color-slate-600);
  --color-text-muted: var(--color-slate-500);

  --color-border-subtle: var(--color-slate-200);
  --color-border-strong: var(--color-slate-300);
}
```

### Surface And Layout Semantics

```css
:root {
  --surface-page-bg: var(--color-bg-page);
  --surface-panel-bg: var(--color-bg-surface);
  --surface-panel-bg-muted: var(--color-bg-muted);
  --surface-panel-border: var(--color-border-subtle);
  --surface-panel-border-emphasis: var(--color-border-strong);
  --surface-panel-shadow: var(--shadow-xs);
  --surface-map-bg: var(--color-map-50);

  --layout-page-padding-x: var(--space-6);
  --layout-page-padding-y: var(--space-5);
  --layout-section-gap: var(--space-5);
  --layout-panel-gap: var(--space-4);
  --layout-control-gap: var(--space-2);
}
```

### Text Semantics

```css
:root {
  --text-heading-color: var(--color-text-primary);
  --text-body-color: var(--color-text-secondary);
  --text-caption-color: var(--color-text-muted);
  --text-inverse-color: var(--color-white);

  --text-heading-font: var(--font-ui);
  --text-body-font: var(--font-ui);
  --text-number-font: var(--font-ui);
  --text-code-font: var(--font-mono);

  --text-page-title-size: var(--font-size-xl);
  --text-panel-title-size: var(--font-size-lg);
  --text-body-size: var(--font-size-md);
  --text-label-size: var(--font-size-sm);
  --text-caption-size: var(--font-size-xs);
  --text-kpi-size: var(--font-size-kpi);
}
```

### Interaction Semantics

```css
:root {
  --interactive-focus-color: var(--color-accent-logistics);
  --interactive-focus-ring: 0 0 0 3px rgb(37 99 235 / 0.18);
  --interactive-disabled-opacity: 0.48;
  --interactive-transition: var(--duration-fast) var(--ease-standard);
}
```

### Risk Semantics

Risk language must communicate handling priority and review confidence. It must not imply that FoodLoop certifies food safety.

```css
:root {
  --risk-low-color: var(--color-risk-low);
  --risk-low-fg-strong: var(--color-green-800);
  --risk-low-bg: var(--color-risk-low-soft);
  --risk-low-border: var(--color-risk-low-border);

  --risk-medium-color: var(--color-risk-medium);
  --risk-medium-fg-strong: var(--color-amber-800);
  --risk-medium-bg: var(--color-risk-medium-soft);
  --risk-medium-border: var(--color-risk-medium-border);

  --risk-urgent-color: var(--color-risk-urgent);
  --risk-urgent-fg-strong: var(--color-red-700);
  --risk-urgent-bg: var(--color-risk-urgent-soft);
  --risk-urgent-border: var(--color-risk-urgent-border);

  --risk-review-color: var(--color-risk-review);
  --risk-review-fg-strong: var(--color-slate-700);
  --risk-review-bg: var(--color-bg-muted);
  --risk-review-border: var(--color-border-subtle);
}
```

### Status Semantics

```css
:root {
  --status-sensor-ok-color: var(--color-risk-low);
  --status-sensor-alert-color: var(--color-risk-medium);
  --status-routing-color: var(--color-accent-logistics);
  --status-review-color: var(--color-risk-review);
  --status-exception-color: var(--color-risk-urgent);

  --status-sensor-ok-bg: var(--risk-low-bg);
  --status-sensor-alert-bg: var(--risk-medium-bg);
  --status-routing-bg: var(--color-accent-logistics-soft);
  --status-review-bg: var(--risk-review-bg);
  --status-exception-bg: var(--risk-urgent-bg);
}
```

## Layer 3: Component Tokens

Component tokens define how the demo screens consume the semantic layer.

### Buttons

Use green for primary completion actions and blue for AI/logistics actions. `--color-brand-primary` is the identity green; `--color-brand-action` is the darker filled-button green for white text.

```css
:root {
  --button-height-sm: 32px;
  --button-height-md: 36px;
  --button-height-lg: 40px;
  --button-padding-x: var(--space-3);
  --button-gap: var(--space-2);
  --button-radius: var(--radius-md);
  --button-font-size: var(--font-size-sm);
  --button-font-weight: var(--font-weight-semibold);

  --button-primary-bg: var(--color-brand-action);
  --button-primary-bg-hover: var(--color-brand-action-hover);
  --button-primary-fg: var(--color-brand-action-fg);
  --button-primary-border: var(--color-brand-action);

  --button-logistics-bg: var(--color-accent-logistics);
  --button-logistics-bg-hover: var(--color-accent-logistics-hover);
  --button-logistics-fg: var(--text-inverse-color);
  --button-logistics-border: var(--color-accent-logistics);

  --button-secondary-bg: var(--color-bg-surface);
  --button-secondary-bg-hover: var(--color-bg-muted);
  --button-secondary-fg: var(--color-text-primary);
  --button-secondary-border: var(--color-border-subtle);

  --button-danger-bg: var(--color-risk-urgent);
  --button-danger-bg-hover: var(--color-risk-urgent-hover);
  --button-danger-fg: var(--text-inverse-color);
  --button-danger-border: var(--color-risk-urgent);
}
```

Usage:

| Action | Variant |
| --- | --- |
| Submit batch | Primary |
| Confirm NGO | Primary |
| Complete pickup | Primary |
| Analyze photo | Logistics |
| Recalculate route | Logistics |
| View explanation | Secondary |
| Flag for review | Secondary or danger, based on severity |

### Cards And Panels

Cards should be compact, rectangular, and dashboard-native.

```css
:root {
  --card-bg: var(--surface-panel-bg);
  --card-border: var(--surface-panel-border);
  --card-shadow: var(--surface-panel-shadow);
  --card-radius: var(--radius-lg);
  --card-padding: var(--space-4);
  --card-gap: var(--space-3);
  --card-title-color: var(--text-heading-color);
  --card-title-size: var(--text-panel-title-size);
  --card-body-color: var(--text-body-color);
}
```

Use cards for repeated items and framed tools only: KPI cards, NGO match cards, risk panels, route summaries, architecture nodes.

### Form Fields

```css
:root {
  --field-height: 36px;
  --field-bg: var(--color-bg-surface);
  --field-bg-disabled: var(--color-bg-muted);
  --field-border: var(--color-border-subtle);
  --field-border-hover: var(--color-border-strong);
  --field-border-focus: var(--interactive-focus-color);
  --field-ring-focus: var(--interactive-focus-ring);
  --field-radius: var(--radius-md);
  --field-padding-x: var(--space-3);
  --field-label-color: var(--color-text-secondary);
  --field-label-size: var(--font-size-sm);
  --field-value-color: var(--color-text-primary);
  --field-placeholder-color: var(--color-text-muted);
  --field-helper-color: var(--color-text-muted);
}
```

Form field usage:

| Input area | Token emphasis |
| --- | --- |
| Donor upload fields | Standard field tokens |
| Photo analysis drop zone | Logistics border on active state |
| Expiry and ready time | Risk color only after validation |
| Storage location | Sensor status badge nearby, not field color alone |
| Quantity and category | Compact field height with readable labels |

### Badges

Badges communicate state. They must include text or icon support and never rely on color alone. Compact 12px labels use soft backgrounds paired with strong foreground tokens.

```css
:root {
  --badge-height: 24px;
  --badge-padding-x: var(--space-2);
  --badge-gap: var(--space-1);
  --badge-radius: var(--radius-sm);
  --badge-font-size: var(--font-size-xs);
  --badge-font-weight: var(--font-weight-semibold);

  --badge-low-bg: var(--risk-low-bg);
  --badge-low-fg: var(--risk-low-fg-strong);
  --badge-low-border: var(--risk-low-border);

  --badge-medium-bg: var(--risk-medium-bg);
  --badge-medium-fg: var(--risk-medium-fg-strong);
  --badge-medium-border: var(--risk-medium-border);

  --badge-urgent-bg: var(--risk-urgent-bg);
  --badge-urgent-fg: var(--risk-urgent-fg-strong);
  --badge-urgent-border: var(--risk-urgent-border);

  --badge-review-bg: var(--risk-review-bg);
  --badge-review-fg: var(--risk-review-fg-strong);
  --badge-review-border: var(--risk-review-border);

  --badge-routing-bg: var(--color-accent-logistics-soft);
  --badge-routing-fg: var(--status-routing-color);
  --badge-routing-border: var(--color-accent-logistics-border);
}
```

Recommended labels:

| State | Label style |
| --- | --- |
| Low handling risk | Green badge, not "safe" |
| Short window | Amber badge |
| Urgent route | Red badge |
| Needs confirmation | Neutral badge |
| Route optimized | Blue badge |
| Sensor attached | Green or neutral badge depending on evidence |

### KPI Cards

KPI cards must remain readable in pitch screenshots at 1440x900.

```css
:root {
  --kpi-card-bg: var(--card-bg);
  --kpi-card-border: var(--card-border);
  --kpi-card-radius: var(--card-radius);
  --kpi-card-padding: var(--space-4);
  --kpi-label-color: var(--color-text-secondary);
  --kpi-label-size: var(--font-size-sm);
  --kpi-value-color: var(--color-text-primary);
  --kpi-value-size: var(--font-size-kpi);
  --kpi-value-weight: var(--font-weight-bold);
  --kpi-delta-positive-color: var(--color-brand-primary);
  --kpi-delta-neutral-color: var(--color-text-muted);
  --kpi-delta-warning-color: var(--color-risk-medium);
}
```

Use green for food rescued and successful recovery metrics. Use blue for route time, ETA, and operational efficiency.

### NGO Match Cards

NGO match cards should show ranking, fit, capacity, distance, and explanation without becoming a table dump.

```css
:root {
  --ngo-match-card-bg: var(--card-bg);
  --ngo-match-card-border: var(--card-border);
  --ngo-match-card-border-selected: var(--color-brand-primary);
  --ngo-match-card-radius: var(--card-radius);
  --ngo-match-card-padding: var(--space-4);
  --ngo-match-card-gap: var(--space-3);

  --ngo-match-rank-bg: var(--color-brand-primary-soft);
  --ngo-match-rank-fg: var(--color-brand-primary);
  --ngo-match-score-color: var(--color-brand-primary);
  --ngo-match-score-bg: var(--color-brand-primary-soft);

  --ngo-match-route-color: var(--color-accent-logistics);
  --ngo-match-route-bg: var(--color-accent-logistics-soft);
  --ngo-match-capacity-color: var(--color-text-secondary);
  --ngo-match-explanation-color: var(--color-text-secondary);
}
```

Content rules:

- Match score uses green because it represents FoodLoop fit.
- Route distance and ETA use blue because they represent logistics.
- Capacity warnings use amber.
- Manual review uses neutral unless there is a genuine urgent handling state.

### Risk Explanation Panels

Risk panels explain why the system recommends a handling action. They should look like decision support, not certification.

```css
:root {
  --risk-panel-bg: var(--color-bg-surface);
  --risk-panel-border: var(--color-border-subtle);
  --risk-panel-radius: var(--radius-lg);
  --risk-panel-padding: var(--space-4);
  --risk-panel-title-color: var(--color-text-primary);
  --risk-panel-body-color: var(--color-text-secondary);
  --risk-panel-factor-gap: var(--space-2);

  --risk-factor-positive-color: var(--color-risk-low);
  --risk-factor-warning-color: var(--color-risk-medium);
  --risk-factor-urgent-color: var(--color-risk-urgent);
  --risk-factor-review-color: var(--color-risk-review);
}
```

Panel copy should prefer:

| Prefer | Avoid |
| --- | --- |
| Handling recommendation | Safety verdict |
| Sensor evidence attached | Certified safe |
| Needs donor confirmation | Failed safety check |
| Temperature excursion detected | Unsafe food |
| Human review recommended | AI decision |

### Route And Map Panels

Route panels are where blue should be most visible.

```css
:root {
  --route-panel-bg: var(--card-bg);
  --route-panel-border: var(--card-border);
  --route-panel-radius: var(--card-radius);
  --route-panel-padding: var(--space-4);

  --route-map-bg: var(--surface-map-bg);
  --route-path-color: var(--color-accent-logistics);
  --route-path-alt-color: var(--color-border-strong);
  --route-pickup-color: var(--color-brand-primary);
  --route-dropoff-color: var(--color-accent-logistics);
  --route-delay-color: var(--color-risk-medium);
  --route-urgent-color: var(--color-risk-urgent);

  --route-eta-color: var(--color-accent-logistics);
  --route-window-color: var(--color-text-secondary);
  --route-note-color: var(--color-text-muted);
}
```

Usage:

| Route element | Color role |
| --- | --- |
| Optimized route | Logistics blue |
| Pickup point | FoodLoop green |
| NGO drop-off | Logistics blue |
| Delay or time-window risk | Amber |
| Expiry conflict | Red |
| Historical/alternate route | Neutral |

### Timeline And Stepper States

The guided demo flow should feel like an operational workflow.

```css
:root {
  --stepper-gap: var(--space-3);
  --stepper-dot-size: 10px;
  --stepper-line-color: var(--color-border-subtle);

  --stepper-complete-color: var(--color-brand-primary);
  --stepper-current-color: var(--color-accent-logistics);
  --stepper-upcoming-color: var(--color-text-muted);
  --stepper-warning-color: var(--color-risk-medium);
  --stepper-blocked-color: var(--color-risk-urgent);

  --stepper-label-color: var(--color-text-secondary);
  --stepper-label-current-color: var(--color-text-primary);
  --stepper-label-size: var(--font-size-sm);
}
```

Flow mapping:

| Demo step | State treatment |
| --- | --- |
| Intake complete | Green complete |
| Matching active | Blue current |
| Dispatch recalculating | Blue current plus loading |
| Pickup complete | Green complete |
| Needs confirmation | Neutral review |
| Expiry conflict | Red blocked |

### Chart Colors

Charts should be restrained and presentation-readable. Use green for impact, blue for operations, amber/red for risk, and neutral for baselines.

```css
:root {
  --chart-series-food-rescued: var(--color-brand-primary);
  --chart-series-meals-served: var(--color-brand-chart-alt);
  --chart-series-route-time: var(--color-accent-logistics);
  --chart-series-eta: var(--color-accent-logistics-chart-alt);
  --chart-series-risk-low: var(--color-risk-low);
  --chart-series-risk-medium: var(--color-risk-medium);
  --chart-series-risk-urgent: var(--color-risk-urgent);
  --chart-series-review: var(--color-risk-review);
  --chart-series-neutral: var(--color-border-strong);

  --chart-axis-color: var(--color-text-muted);
  --chart-grid-color: var(--color-border-subtle);
  --chart-label-color: var(--color-text-secondary);
  --chart-tooltip-bg: var(--color-text-primary);
  --chart-tooltip-fg: var(--text-inverse-color);
}
```

Do not use rainbow chart palettes. Reserve red for genuine exceptions or missed windows.

### Architecture Diagram Nodes

Architecture diagrams should look like product infrastructure, not a decorative infographic.

```css
:root {
  --arch-canvas-bg: var(--color-bg-surface);
  --arch-node-radius: var(--radius-lg);
  --arch-node-padding: var(--space-3);
  --arch-node-border: var(--color-border-subtle);
  --arch-node-text: var(--color-text-primary);
  --arch-edge-color: var(--color-border-strong);
  --arch-edge-active-color: var(--color-accent-logistics);

  --arch-node-intake-bg: var(--color-brand-primary-soft);
  --arch-node-intake-border: var(--color-brand-primary-border);
  --arch-node-ai-bg: var(--color-accent-logistics-soft);
  --arch-node-ai-border: var(--color-accent-logistics-border);
  --arch-node-risk-bg: var(--color-risk-medium-soft);
  --arch-node-risk-border: var(--color-risk-medium-border);
  --arch-node-dispatch-bg: var(--color-accent-logistics-soft);
  --arch-node-dispatch-border: var(--color-accent-logistics-border);
  --arch-node-impact-bg: var(--color-brand-primary-soft);
  --arch-node-impact-border: var(--color-brand-primary-border);
  --arch-node-data-bg: var(--color-bg-muted);
  --arch-node-data-border: var(--color-border-subtle);
}
```

Node mapping:

| Architecture layer | Node treatment |
| --- | --- |
| Donor upload / intake | Green soft |
| AI extraction / rules engine | Blue soft |
| Risk scoring / review queue | Amber or neutral |
| NGO matching | Green soft with blue route metadata |
| Dispatch / route optimization | Blue soft |
| Impact analytics / ESG report | Green soft |
| Sensor logs / mock data store | Neutral or blue soft when active |

## Screen Coverage Matrix

| Screen | Dominant roles | Notes |
| --- | --- | --- |
| Intake | Green primary, neutral surfaces, blue AI action | `Analyze photo` uses logistics blue, `Submit batch` uses green. |
| Matching | Green match score, blue ETA, amber capacity warnings | Explanation text stays neutral and readable. |
| Dispatch | Blue route/map, green pickup confirmation, amber delay | Route recalculation is the clearest blue moment. |
| Impact | Green KPI and chart emphasis, neutral captions | Use restrained green dominance for ESG credibility. |
| Architecture | Soft green and blue nodes, neutral data layer | Risk/review nodes use amber or neutral, not red unless urgent. |

## Bilingual Fit Rules

The UI should support English and Traditional Chinese without breaking compact spacing.

| Element | Rule |
| --- | --- |
| Buttons | Minimum 36px height, allow icon plus text, avoid fixed narrow widths. |
| Badges | Keep labels short and allow 2 to 4 extra characters of width. |
| Table-like rows | Prefer flexible grid columns over hard-coded pixel widths. |
| KPI labels | Allow two-line labels under 13px to 14px text. |
| Timeline labels | Use 13px labels and wrap before overlapping. |

Sample labels to test:

| English | Traditional Chinese |
| --- | --- |
| Intake | 餐點上載 |
| Matching | 配對結果 |
| Dispatch | 派送路線 |
| Impact | 影響報告 |
| Needs confirmation | 需要確認 |

## Accessibility And Readability

- Normal body text should target at least 4.5:1 contrast.
- White text on filled primary, logistics, and danger buttons should target at least 4.5:1 contrast.
- Compact badges should pair soft backgrounds with strong foreground tokens at 4.5:1 or better.
- UI component boundaries should target at least 3:1 contrast.
- Focus states must be visible and use the blue logistics focus ring.
- Status indicators must include text and/or icons, not color alone.
- KPI numbers, match scores, ETA, route times, and dashboard labels must remain readable in 1440x900 pitch screenshots.
- Avoid tiny red text for critical states; use panel or badge structure.

## Validation Test Plan

Use this checklist before turning the spec into implementation tokens.

- Intake, Matching, Dispatch, Impact, and Architecture screens can all be styled from the same semantic roles.
- Risk states remain explainable without looking like food-safety certification.
- Green is dominant enough for FoodLoop identity.
- Blue remains clearly reserved for AI, logistics, routing, system intelligence, and dispatch.
- KPI numbers, match scores, ETA, route times, and dashboard labels are readable at presentation size.
- Traditional Chinese labels fit without breaking spacing assumptions.
- Sensor, forecasting, exception queue, and ESG report hooks can use the status and component tokens without new colors.
- No component needs raw hex values once semantic tokens exist.
- Primary button contrast: white on `--color-brand-action` is at least 4.5:1.
- Logistics button contrast: white on `--color-accent-logistics` is at least 4.5:1.
- Badge contrast: strong badge foreground tokens on their soft backgrounds are at least 4.5:1.
- Text contrast: body and label text on page and surface backgrounds is at least 4.5:1.
- Raw hex values appear only in primitive blocks and the exact semantic value block.
- Component token blocks contain no raw hex values.
- Component token blocks prefer semantic tokens over primitives for hover, foreground, border, and status roles.

## Assumptions

- The first deliverable is a Markdown token spec, not CSS or JSON files.
- The website will be a light dashboard-style prototype.
- The token system supports the current FoodLoop demo flow: Intake, Matching, Dispatch, Impact, and Architecture.
- The token system also leaves room for sensors, forecasting, exception queues, and ESG reports.
- No dark mode, backend schema, or production component library decisions are included in this first token step.

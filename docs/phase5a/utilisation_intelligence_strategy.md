# Utilisation Intelligence Strategy

## Utilisation Semantics
Utilisation is the measure of a staff member's productive output relative to their total capacity. It is critical for engineering consultancies to maintain high utilisation to ensure overall business profitability.

## Productive vs Non-Productive Definitions
- **Productive (Billable):** `is_billable = true` on `APPROVED` time entries. This time actively consumes client fee budgets and drives revenue.
- **Non-Productive (Non-Billable/Internal):** `is_billable = false`. Time spent on internal ops, training, or unbillable job administration.

## Staffing Pressure Indicators
Utilisation intelligence tracks rolling averages (e.g., 4-week, 12-week windows). Prolonged periods of >100% utilisation trigger "Burnout Risk" signals. Prolonged periods of <70% billable utilisation trigger "Under-utilisation" signals.

## Historical Comparison Rules
Utilisation metrics always compare current output against historical baselines. Crucially, the calculation only evaluates `APPROVED` time to prevent skewed metrics from draft or rejected timesheets.

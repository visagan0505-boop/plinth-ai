# Operational Forecasting Architecture

## Fee Burn Forecasting Mechanics
The engine calculates the "Velocity of WIP" (average value of WIP accumulated per week over the last N weeks). It then projects this velocity linearly against the remaining fee budget to predict the exact date of 100% fee consumption.

## Workload Projection Strategy
By aggregating the forecasted fee burn across all active jobs assigned to a specific discipline (e.g., Structural Engineering), the system projects the macro-level discipline workload over the upcoming quarter.

## Deterministic Forecasting Inputs
Forecasting must strictly use:
- `fee_value`
- Unbilled WIP (from approved time)
- Realized Revenue (from issued invoices)
It explicitly ignores DRAFT invoices and SUBMITTED (unapproved) timesheets to prevent phantom variances.

## Confidence Boundary Philosophy
Every forecast outputs a `confidence_score` (0.0 to 1.0). 
- High confidence: Burn rate has variance < 5% week-over-week.
- Low confidence: Burn rate is erratic (e.g., 0 hours, then 100 hours, then 0 hours). 
Low confidence forecasts must be visually flagged in the UI so human managers don't over-react to statistical noise.

## Temporal Prediction Windows
Forecasting is bounded. The engine predicts 30, 60, and 90-day horizons. Extrapolating a 2-week burn rate into a 2-year projection is statistically invalid and structurally prevented by the engine boundaries.

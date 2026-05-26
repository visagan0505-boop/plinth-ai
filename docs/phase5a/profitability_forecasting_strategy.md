# Profitability Forecasting Strategy

## Fee Burn Forecasting Inputs
Forecasting fee burn requires historical burn rate velocity. The inputs are strictly:
- The `fee_value` of the job.
- The temporal accumulation of unbilled WIP over time (hours × `snapshot_bill_rate`).
- The rate of invoice issuance vs fee consumption.
- The aggregate operational cost applied against the fee over distinct time horizons.

## Historical Reconstruction Usage
Because Phase 4 established deterministic profitability reconstruction (the ability to mathematically query the job's state as it was on any given historical date), the forecasting engine can reliably plot the "actuals" curve and project the statistical "forecast" curve based on the trajectory.

## Prediction Constraints
- Forecasting does not modify operational data.
- Predictions must always be explicitly labeled as projections.
- Forecasts cannot project beyond the mathematical absolute (e.g., if fee is 100% consumed, the forecast indicates immediate overburn).

## Uncertainty Handling
Forecasting models must include confidence intervals based on the consistency of the historical data (e.g., highly volatile weekly time entries lower the confidence score of the forecast).

## Temporal Forecasting Rules
Forecasts are calculated dynamically at read-time against the current operational snapshot. They are not stored persistently as "truth" because new backdated time entries or adjustments instantly alter the real operational trajectory.

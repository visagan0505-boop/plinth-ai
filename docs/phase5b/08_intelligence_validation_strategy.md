# Intelligence Validation Strategy

## Replay Validation
The primary test of the intelligence layer: Resetting the event pipeline cursor to 0 and replaying history must result in an identical analytical state as processing the events in real-time. If there is a variance, the analytical aggregator is flawed.

## Forecasting Validation
Validation scripts will implement "Backtesting". The script simulates standing at Date X, generates a 30-day forecast, and then compares that forecast against the actual deterministic results that occurred at Date X+30. The variance is mapped to refine the confidence interval algorithms.

## Temporal Consistency Validation
Assert that querying an analytical model for the state of the business in "March 2025" returns identical results when queried in April 2025 vs December 2026. The historical snapshot must be structurally immune to future mutations.

## Intelligence Drift Validation
If the Risk Engine calculates a Health Score of 40, and the underlying WIP Engine calculates a 20% margin, the tests must ensure these metrics are derived from the exact same temporal snapshot to prevent race conditions where the AI explains a risk using stale data.

## Confidence Score Validation
Ensure that when a job has < 3 weeks of time entry history, the Forecasting Engine forcefully caps its confidence score, preventing the UI from presenting highly uncertain early-phase data as definitive intelligence.

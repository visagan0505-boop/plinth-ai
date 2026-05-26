# Delivery Risk Engine Architecture

## Risk Scoring Mechanics
The Delivery Risk Engine aggregates multiple discrete signals into a normalized `JobHealthScore` (0-100).
- 100 = Perfect trajectory.
- < 50 = High Risk, intervention required.

## Operational Anomaly Indicators
Deterministic triggers that reduce the health score:
- **Overburn:** Unbilled WIP + Realized Revenue > Fee Value.
- **Stagnation:** An active job with 0 hours logged for > 14 days.
- **Billing Delay:** Unbilled WIP > 30% of total fee (indicates the PM is forgetting to invoice).

## Revision Pressure Analysis
A heuristic module that scans the `notes` field of `time_entries` for keywords indicating rework: "revision", "change", "correction", "fixed error". A sudden spike in these keywords reduces the health score, indicating scope creep or quality issues.

## Delivery Drift Calculations
The engine analyzes the seniority mix. If the initial month of the job was 80% Graduate Engineer time, and the current month is 80% Principal Engineer time, the system flags `SENIORITY_DRIFT`, indicating complex problems requiring expensive intervention.

## Risk Threshold Governance
The thresholds for these risks are globally configured. When a job drops below a defined health threshold, it is automatically surfaced to a "Requires Attention" intelligence dashboard, ensuring management focuses only on exceptions, not the baseline.

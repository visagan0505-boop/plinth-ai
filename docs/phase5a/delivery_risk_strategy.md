# Delivery Risk Strategy

## Delivery Risk Indicators
Delivery risk represents the probability of a job exceeding its fee budget, missing its timeline, or suffering a profitability collapse.

## Revision Pressure Signals
Anomalous patterns in time entry descriptions (e.g., repeated instances of the word "revision", "rework", or "correction" in time entries) can serve as early-warning textual signals for AI analysis that the job is suffering from client-driven scope creep.

## Fee Burn Acceleration
The primary quantitative risk signal is fee burn acceleration. If the velocity of WIP accumulation suddenly spikes relative to the historical baseline of the job, the intelligence layer immediately raises a risk flag.

## Operational Drift Detection
Drift occurs when the staff working on a project deviate from the intended discipline or seniority level (e.g., a Principal Engineer is logging 20 hours a week on a job meant for a Graduate Engineer, destroying the job's profitability).

## Risk Scoring Philosophy
Risk scoring is aggregative. Quantitative signals (burn rate) and qualitative signals (time entry NLP analysis) are combined to produce a unified operational health score.

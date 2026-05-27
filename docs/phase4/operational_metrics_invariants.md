# Operational Metrics Invariants

This document restricts the types of metrics the system is permitted to calculate.

## Permitted Metrics
1. **Total Hours Burned**: Sum of duration across time entries.
2. **Financial Burn**: Sum of (duration * applicable rate).
3. **Transmittal Count/Velocity**: Count of `transmittal.issued` events over time.
4. **Revision Churn**: The ratio of Revisions per Deliverable (indicates design instability).
5. **Phase Completion Status**: Binary indicators of whether a phase has active time entries vs. issued transmittals.

## Forbidden Metrics
1. **Employee Utilization Percentage**: (e.g., "User X was 85% billable this week"). This is a payroll/HR metric, not an operational delivery metric.
2. **Subjective Completion %**: (e.g., "This drawing is 75% done"). Unless derived from a hard fact (like "3 of 4 planned deliverables have issued transmittals"), subjective slider-bar metrics are banned.
3. **Productivity Scores**: Abstract scores rating staff performance.

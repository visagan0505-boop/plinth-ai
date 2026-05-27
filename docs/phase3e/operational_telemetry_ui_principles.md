# Operational Telemetry UI Principles

This document defines the strict governance rules for the user interface representing the Time Entry workflow (Phase 3E). The UI must reflect absolute engineering realism and reject generalized ERP/payroll patterns.

## 1. Telemetry UI Philosophy
The interface exists to rapidly and accurately capture operational effort (telemetry) against the established engineering hierarchy. It must prioritize speed of entry and deterministic attribution over complex submission mechanics.

## 2. Hierarchy-Aware Interaction Rules
- **Dependent Selectors**: The UI must enforce the structural integrity of the `Job > Phase > Scope > Component` hierarchy. A user cannot select a Scope without first selecting a Phase belonging to the chosen Job.
- **Strict Validation**: The UI must prevent the selection of invalid or mismatched structural units.

## 3. Operational Speed Principles
- **Fast Entry Flow**: Telemetry capture is a daily operational chore. The UI must facilitate rapid, low-friction entry (e.g., inline row additions, keyboard accessibility).
- **Inline Editing Preference**: Modifying a logged time entry should occur inline or via a highly responsive drawer/popover, avoiding heavy modal blockades.

## 4. Forbidden ERP/Payroll UX Patterns
- **No Submit/Approve Workflows**: Do not build "Submit Timesheet for Approval" buttons. Time entries are factual telemetry, not requests for pay.
- **No Clock-In/Clock-Out**: Engineering effort is logged in discrete durations (hours), not tracked via stopwatch mechanics.
- **No Productivity Gamification**: Avoid progress bars comparing hours logged to a "daily 8-hour target".

## 5. Telemetry Integrity Interaction Rules
- **Billable Default**: The `is_billable` toggle should default to true to reflect standard operational assumptions but must be explicitly visible and mutable.
- **Zero-Hour Rejection**: The UI must strictly prevent the submission of `0` or negative hours.

## 6. Operational Information Density Principles
- The daily/weekly view of time entries must be dense and scannable, prioritizing the visibility of the Job/Phase attribution, duration, and notes. Whitespace should not compromise the ability to review a day's effort at a glance.

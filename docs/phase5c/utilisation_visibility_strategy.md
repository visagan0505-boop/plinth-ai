# Utilisation Visibility Strategy

## Staffing Pressure Presentation
Utilisation analytics are presented across discrete time horizons (1-week, 4-week, 12-week). The UI must emphasize the *rolling average* (4-week and 12-week) over the 1-week tactical metric, as consulting work naturally peaks and troughs weekly.

## Burnout Visibility Semantics
If the Utilisation Engine flags `burnoutRisk: true` (e.g., >110% sustained utilisation), the UI explicitly flags the staff member in resource dashboards. This is presented not as a "good" metric of high productivity, but as a critical operational risk requiring load-balancing.

## Productive vs Non-Productive Visibility
The UI explicitly partitions hours into "Billable" (consuming fee, driving revenue) and "Internal" (overhead). This visual separation ensures management understands the structural cost of non-billable time.

## Trend Explainability
A sudden drop in utilisation must be contextualised. If a staff member drops to 40% utilisation, the UI should ideally cross-reference leave systems (if applicable) or explicitly state: "Utilisation dropped due to 20 hours logged to non-billable internal jobs."

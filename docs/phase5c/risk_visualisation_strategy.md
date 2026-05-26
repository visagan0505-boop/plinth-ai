# Risk Visualisation Strategy

## Risk Score Presentation
The Delivery Risk Engine outputs a normalized `JobHealthScore` (0-100). This is presented contextually using explicit traffic-light semantics (Green = Optimal, Yellow = Attention Required, Red = Critical Risk).

## Contributing Factor Visibility
A risk score of "40" is useless without context. The UI must structurally decompose the score, explicitly listing the heuristic flags returned by the Risk Engine (e.g., "-20 points: Forecast indicates fee budget depletion within 2 weeks", "-15 points: High frequency of 'revision' keywords").

## Operational Drilldowns
Clicking on the 'revision' flag must take the user directly to the filtered list of time entries containing the word "revision", proving the system's heuristic claim.

## Risk Threshold Semantics
The UI should filter noise. Jobs with a health score > 85 should be grouped under "Healthy" and deprioritized in intelligence dashboards, forcing operational focus purely on jobs that breach the "Medium" or "High" risk thresholds.

## Explainable Risk Composition
The composition of the risk must be transparent. Users should intuitively understand that resolving the underlying operational issue (e.g., issuing the delayed invoice) will mathematically restore the health score.

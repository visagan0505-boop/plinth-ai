# Intelligence UI Execution Plan

## Implementation Order
1. **Risk Visualization Components:** Build the Health Score ring and flag decomposition lists.
2. **Utilisation Visualization Components:** Build the rolling 4-week bar charts and burnout indicator cards.
3. **Forecasting Visualization Components:** Build the "Cone of Uncertainty" line charts for fee burn.
4. **Intelligence Dashboards:** Assemble the components into Job-level and System-level operational views.
5. **Drilldown Navigation:** Wire the intelligence flags directly to the Phase 3/4 transactional data views.

## Rendering Architecture
The Intelligence UI relies heavily on Next.js Server Components to fetch the flat analytical snapshots rapidly. Only highly interactive elements (like hovering over a forecast chart) utilize Client Components.

## Aggregation Boundaries
The UI must NEVER calculate profitability or risk scores. It strictly renders the values pre-calculated by the Intelligence Engines. If a metric is missing, the UI renders an error state; it does not attempt to calculate it on the fly.

## Performance Constraints
Intelligence dashboards must load in < 500ms, as they rely entirely on pre-calculated analytical snapshots. If drilldowns require complex cross-table queries, they must be paginated or deferred until explicitly requested.

## Rollout Sequencing
The UI will be rolled out to Job-level pages first (validating forecasting and risk at the micro-level) before being aggregated into global firm-wide dashboards.

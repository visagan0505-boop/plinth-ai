# Utilisation Analytics Architecture

## Utilisation Calculation Formulas
`Weekly Utilisation % = (Total Billable Hours / Base Contracted Hours) * 100`

This calculation explicitly depends on `is_billable = true` from the Phase 3 time entry structure.

## Rolling Utilisation Windows
Utilisation is highly volatile on a daily basis. The analytics architecture evaluates:
- **1-Week Window:** Tactical visibility (Did they hit their target this week?)
- **4-Week Rolling:** Operational visibility (Are they consistently hitting targets?)
- **12-Week Rolling:** Strategic visibility (Are they structurally over-allocated or under-allocated?)

## Burnout Pressure Indicators
A sustained 4-week rolling utilisation of >110% triggers a deterministic `BURNOUT_RISK` operational anomaly. This is a mathematical flag, not an AI hallucination.

## Staffing Imbalance Metrics
The engine aggregates utilisation at the discipline level. If Structural Engineers are running at 110% and Civil Engineers at 60%, a `DISCIPLINE_IMBALANCE` signal is generated, prompting leadership to cross-allocate resources or hire.

## Trend Aggregation Semantics
Utilisation trends are stored as time-series vectors in the read models, allowing easy graphing (e.g., Sparklines) in the UI without massive database joins.

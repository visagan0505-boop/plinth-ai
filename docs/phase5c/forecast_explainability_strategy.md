# Forecast Explainability Strategy

## How Forecasts are Explained
A forecast is never presented simply as "Fee depleted on October 1st". It must be presented as: "Based on the average weekly WIP accumulation of $5,000 over the past 4 weeks, the remaining fee of $20,000 is projected to deplete on October 1st."

## Confidence Presentation
The confidence score (0.0 to 1.0) calculated by the Forecasting Engine translates to distinct UI treatments:
- > 0.7: High Confidence (Solid lines, standard colors).
- 0.4 to 0.7: Medium Confidence (Alert icons, contextual warnings about volatility).
- < 0.4: Low Confidence (Explicitly marked as "Insufficient Data" or "Highly Volatile", dashed projection lines).

## Volatility Visibility
The UI must explicitly show the variance in the historical data. If Week 1 had 10 hours, Week 2 had 50, and Week 3 had 0, the forecast must declare: "Historical burn is highly volatile; projection reliability is low."

## Historical Basis Visibility
The chart or widget must clearly mark the boundary between "Historical Actuals" (locked, immutable) and "Projections" (mutable, predictive).

## Projection Limitations & Uncertainty Semantics
The UI explicitly guards against over-reliance by clamping projections to a maximum of 90 days. Users cannot project a highly volatile 3-week job out to a 3-year timeline.

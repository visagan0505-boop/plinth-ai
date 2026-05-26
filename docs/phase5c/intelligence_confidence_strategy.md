# Intelligence Confidence Strategy

## Confidence Score Philosophy
Intelligence is only useful if its limitations are known. Plinth structurally attaches a confidence score (0.0 - 1.0) to all predictive algorithms. The UI's job is to translate that mathematical score into human trust semantics.

## Low-Confidence Handling
When confidence drops below 0.4, the UI must intercept the visualization. Instead of drawing a solid projection line that looks authoritative, it must render dashed or blurred lines accompanied by explicit text: "Projection based on highly volatile data. Use with caution."

## Insufficient-Data Semantics
If a job is 2 weeks old, it lacks the historical runway to confidently forecast a 6-month burn. The UI must explicitly state: "Insufficient historical data for a stable forecast. Accumulate 4 weeks of approved time to unlock forecasting."

## Stale-Data Handling
If the intelligence snapshots haven't been updated (e.g., the last processed domain event was 7 days ago due to a cron failure), the UI must explicitly declare: "Intelligence metrics are 7 days stale." It must never present stale data as real-time truth.

## Confidence Decay Mechanics
Projections inherently decay in accuracy the further out they go. A 30-day forecast may have 0.8 confidence, but extrapolating to 90 days drops the confidence to 0.4. The UI must visually represent this "cone of uncertainty" widening over time.

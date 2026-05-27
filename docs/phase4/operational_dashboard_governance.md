# Operational Dashboard Governance

This document establishes the boundaries for the dashboard UI surfaces.

## 1. Anti-Vanity Guarantee
Dashboards will not contain "vanity metrics" (e.g., "Total Jobs Created All Time"). Every number, chart, and indicator must directly support a real-time operational decision.

## 2. Information Density
The dashboard must respect the engineering mindset: dense, factual, and scannable. It should avoid excessive whitespace, unnecessary animations, or simplified abstract icons when raw data is more useful.

## 3. Hierarchy Awareness
Dashboards must respect the operational hierarchy. A user should be able to view intelligence at the Tenant level (all jobs), drill down to a specific Job, and drill further into a specific Phase or Scope. The aggregation logic must remain identical across these strata.

## 4. Forbidden Elements
- Gamification (badges, progress streaks).
- Predictive AI estimations (in Phase 4). We only show what *has* happened, not what *might* happen (yet).
- Irrelevant social feeds or collaboration chat.

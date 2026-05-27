# Telemetry Aggregation Strategy

This document defines how raw time entries are rolled up into actionable intelligence.

## 1. The Time-Series Rollup
Time entries (Phase 3E) are raw temporal facts. The aggregation layer will construct SQL views or optimized queries that group these facts by:
- `job_id`
- `phase_id`
- `scope_id`
- `staff_id`
- `date` (Daily, Weekly, Monthly rollups)

## 2. Materialization Strategy
For Phase 4, given the expected data volume, dynamic aggregation via Supabase RPCs (Remote Procedure Calls) or strict SQL Views will be utilized. We will avoid complex asynchronous materialized view refreshes until performance profiling dictates it is necessary.

## 3. Immutability Benefits
Because time entries are largely append-only (with corrections strictly audited), the aggregation strategy can confidently cache or pre-compute historical months without fear of silent historical data mutation corrupting the rollups.

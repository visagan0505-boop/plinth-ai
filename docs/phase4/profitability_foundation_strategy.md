# Profitability Foundation Strategy

This document outlines how the system constructs the mathematical foundation for job profitability.

## 1. The Cost Equation
Profitability is derived by comparing the **Revenue Budget** (which we will introduce as simple Phase Fee allocations) against the **Cost Burn** (derived from operational telemetry).

## 2. Base Rates vs. Billable Rates
To establish profitability, the system requires the concept of `cost_rate` (what the employee costs the business) and `charge_rate` (what the client is billed). 
In Phase 4, we will lay the foundation for these rates, allowing time entries to be mathematically converted into a financial burn metric.

## 3. Real-Time Derivation
Profitability is not a static field stored in a database. It is dynamically calculated on-the-fly by summing time entries attached to a phase and multiplying by the respective rates. This ensures the dashboard is always perfectly synchronized with the immutable telemetry ledger.

## 4. Scope Isolation
Profitability must be calculable at the Scope level. If Scope A is a fixed fee and Scope B is a time-and-materials variation, the system must be able to isolate the profitability of Scope A without contamination from Scope B.

# Operational Intelligence Principles

This document defines the overarching philosophy for extracting intelligence from the Plinth operational data structures.

## 1. Truth Primacy
Operational intelligence in Plinth is strictly deterministic. We do not infer, estimate, or guess. Intelligence is mathematically derived *exclusively* from explicit operational facts (time entries, issued revisions, structured phases). If the data is not in the ledger, the platform will not report on it.

## 2. Decision-Support vs. Surveillance
The platform is an engineering operational decision-support tool. It is designed to help Project Managers and Principals answer questions like:
- "Is this job burning hours faster than we anticipated?"
- "Which deliverables are bottlenecking our transmittal schedule?"

It is explicitly **NOT** a surveillance tool. It rejects metrics designed to score, rank, or micromanage individual employees (e.g., "lines of code written", "utilization scores").

## 3. Engineering Relevance
Generic SaaS metrics (DAU, MRR, engagement) are banished. Plinth speaks the language of engineering consultancy:
- Work In Progress (WIP) burn rates.
- Transmittal velocity.
- Revision churn.
- Phase profitability.

## 4. Forecasting Compatibility
The intelligence architecture is designed to be a foundation for future AI and predictive forecasting. By ensuring that all current metrics are cleanly aggregated from immutable temporal ledgers, we guarantee that future forecasting models will have clean, uncorrupted time-series data to train on.

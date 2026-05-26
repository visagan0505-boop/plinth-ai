# ADR 010 — Sequence Generation Strategy

Operational identifiers must be deterministic and concurrency-safe.

Includes:
- job numbers
- issue numbers
- transmittal numbers

Rules:
- tenant-scoped uniqueness
- immutable after creation
- atomic generation
- concurrency-safe sequence allocation

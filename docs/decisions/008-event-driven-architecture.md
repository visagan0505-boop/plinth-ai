# ADR 008 — Event-Driven Architecture

Plinth adopts an event-sourcing-adjacent approach.

Events are signalling infrastructure for:
- notifications
- activity feeds
- workflow triggers
- subscriptions
- escalations

Example event types:
- document.approved
- transmittal.sent
- comm.posted
- job.status_changed

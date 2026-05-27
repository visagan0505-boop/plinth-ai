# Telemetry Interaction Invariants

This document establishes the unbreakable guarantees the user interface must provide when interacting with operational telemetry. These invariants ensure the UI cannot produce corrupted, malformed, or orphaned time entries.

## 1. Telemetry Interaction Guarantees
- **Atomic Operations**: Telemetry submissions (create/update) must either completely succeed and update the UI locally, or completely fail and notify the user. Partial states are forbidden.
- **Immediate Propagation**: The UI must reflect structural truth immediately upon successful interaction with the server action.

## 2. Hierarchy-Safe Interaction Rules
- **Dependent Cascade**: The selection of a structural unit strictly filters subsequent choices. Selecting Job A restricts Phases to Job A's children. Selecting Phase A1 restricts Scopes to Phase A1's children.
- **Nullification on Parent Change**: If a user changes the Job selection, all previously selected Phase, Scope, and Component IDs must be immediately nullified.

## 3. Tenant-Safe Selection Guarantees
- The UI MUST NOT render or allow the selection of any Jobs, Phases, Scopes, or Components that do not belong to the current authenticated `tenant_id`. This is enforced by backend RLS, but the UI data fetching must respect it.

## 4. Validation Enforcement Guarantees
- **Client-Side Pre-Validation**: The UI must prevent the submission of invalid telemetry (e.g., negative hours, string inputs in numeric fields, incomplete required hierarchy selections) before hitting the server.
- **Form Disablement**: Submit buttons must be disabled while a mutation is in flight to prevent duplicate telemetry capture.

## 5. Operational UX Invariants
- The interface must never block the user from entering telemetry for a valid job structure.
- The default state of a new entry should optimize for the most common path: `entryDate` defaults to today, `isBillable` defaults to true.

## 6. Deterministic Telemetry Interaction Rules
- Clicking "Save" or "Log Hours" triggers a deterministic server action. It does not queue the entry for later syncing.

## 7. Forbidden Telemetry UX Behaviors
- **No Optimistic Persistence**: Do not render an entry as "saved" until the backend confirms the mutation was successful. Telemetry is an auditable record of truth and cannot be faked visually.
- **No Drag-and-Drop Time Logging**: Do not allow users to "drag" blocks of time onto a calendar grid. All effort must be deterministically typed into discrete hour fields against explicit structural scopes.

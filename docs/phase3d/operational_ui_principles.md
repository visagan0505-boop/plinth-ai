# Operational UI Principles

This document defines the strict governance rules for the user interface representing the Job Operational Structure (Phase 3D). The UI must reflect absolute engineering realism and reject generalized project management patterns.

## 1. Operational UI Philosophy
The interface exists to expose structural truth, not to orchestrate agile workflows. It must present a highly legible, dense, and deterministic view of the operational commitments (Phases, Scopes, Components) underlying a Job.

## 2. Hierarchy Rendering Rules
- **Strict Visual Nesting**: The visual structure must strictly map to `Job > Phase > Scope > Component`. No lateral linking or bypassing of levels is permitted.
- **Top-Down Sequential Rendering**: Items are rendered based on their `sort_order`.
- **Inline Editing Preferred**: Editing a Phase, Scope, or Component's core attributes (name, estimated hours, billable flag) should prioritize inline interactions over heavy, context-breaking modal workflows.

## 3. Engineering Terminology Requirements
- Use `Phase`, `Scope`, `Component`. 
- Use `Estimated Hours` and `Fee`.
- Use `Billable` and `Included`.
- Never use terms like "Sprint", "Epic", "Ticket", "Task", "Story", or "Backlog".

## 4. Forbidden PM/Task-Management UI Patterns
- **No Kanban Boards**: Operational components are not cards to be dragged across lifecycle columns.
- **No Gantt Charts**: Components do not have visual dependency lines or drag-and-drop temporal relationships.
- **No Progress Bars based on "Checklists"**: Progress is driven strictly by downstream time entry telemetry (actuals vs estimates), not manual checkbox clicking.
- **No "Assignees" on Components**: Structural components represent buckets of effort, not task assignments. Staff log time *against* components; components are not *assigned* to staff.

## 5. Operational Information Density Principles
- The UI must favor density over whitespace. Engineers need to digest the entire breakdown of a $500k job quickly.
- Critical numeric data (hours, fees) must be strictly aligned and consistently formatted for rapid scanning.

## 6. Hierarchy Visibility Rules
- **Progressive Disclosure**: While density is favored, extremely large jobs may require accordions at the Phase or Scope level to prevent overwhelming the browser. 
- **Context Preservation**: Expanding a Scope should never hide the context of its parent Phase.

## 7. Interaction Simplicity Rules
- **Deterministic Outcomes**: Clicking "Save" on a component inline edit immediately patches the database and revalidates the UI tree. No optimistic UI rendering that hides potential backend failures.
- **Clear Boundaries**: Actions (Create, Update) on a Component should clearly delineate themselves visually from Actions on a Scope.

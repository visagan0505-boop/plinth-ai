# LLM Orchestration Architecture

## Orchestration Boundaries
Plinth uses the Vercel AI SDK / LangChain conceptually, but tightly wraps all execution. The orchestration layer intercepts all requests, enforces RLS via the `getOperationalContext()` session, and builds the prompt entirely server-side.

## Deterministic Guardrails
Orchestration intercepts the LLM output. If the LLM generates a numerical value that does not exist in the injected Deterministic Context Block, the response is structurally flagged as a potential hallucination and an explicit warning is appended to the UI.

## Fallback Behavior
If the LLM times out, hits a context limit, or generates invalid JSON, the orchestration layer gracefully defaults to displaying only the deterministic Intelligence UI (Phase 5) rather than breaking the user experience.

## Model Abstraction Layer
The orchestration layer must remain model-agnostic. While OpenAI GPT-4o may be the default, the pipeline must support switching to Claude 3.5 or local open-weights models if data privacy concerns dictate.

## Retry Policies
Strict exponential backoff with a hard ceiling (e.g., max 2 retries). If the LLM continuously fails structured output contracts, the request is aborted.

## Prompt Governance
Prompts are treated as code. They are version-controlled, tested against regressions, and never dynamically modified by user input (preventing prompt injection attacks).

## Structured Output Contracts
The LLM is strictly constrained using `zod` schema enforcement. It cannot output raw markdown unless requested. Operational recommendations are output as strict JSON matching Plinth's internal DTOs.

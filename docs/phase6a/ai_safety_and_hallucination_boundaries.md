# AI Safety and Hallucination Boundaries

## The Threat of Hallucination in Finance
In an engineering consultancy, an AI hallucinating a $50,000 WIP balance or fabricating an invoice number destroys user trust instantly and irreparably.

## Hallucination Prevention Boundaries
1. **Mathematical Prohibition:** The LLM is structurally instructed via system prompts NEVER to calculate totals, margins, or percentages. It must only read and repeat the math provided by the deterministic engine context.
2. **Entity Fabrication Prohibition:** The LLM must never invent job numbers, invoice numbers, or staff names. If an entity is not in the retrieval context, it does not exist.
3. **Format Enforcement:** Outputs that contain operational directives (e.g., DTOs for an adjustment) must be parsed by strict Zod schemas before being presented to the user for approval. If the LLM hallucinates an invalid field, the transaction is structurally rejected by the application layer before the user ever sees it.

## Graceful Degradation
If the retrieval pipeline returns insufficient operational context to answer a query confidently, the system prompt strictly requires the LLM to output a standard fallback: "I do not have sufficient operational data to determine this," rather than attempting to guess.

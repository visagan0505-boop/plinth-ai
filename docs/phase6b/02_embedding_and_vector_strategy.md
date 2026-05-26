# Embedding and Vector Strategy

## Embedding Boundaries
Embeddings are strictly generated for operational qualitative text:
- Time entry `notes`
- Invoice `notes`
- Job descriptions
- User-approved `lessons_learned`
Quantitative data (hours, dollars) is NEVER embedded; it is passed deterministically.

## Tenant Isolation
Every vector generated MUST include `tenant_id` as metadata. Vector queries must apply a hard pre-filter on `tenant_id`. Cross-tenant semantic search is structurally impossible at the database level.

## Semantic Chunking Rules
Time entries are short enough to be embedded 1:1. However, larger documents (e.g., a "Job Post-Mortem") must be chunked carefully to preserve operational context. Every chunk must retain its `source_entity_id` and `temporal_date`.

## Temporal Indexing
Vectors age. An embedding generated in 2024 has less operational weight than one generated today. The vector database must support hybrid search: semantic similarity + temporal recency.

## Retrieval Freshness Semantics
The indexing pipeline listens to `domain_events`. If a time entry note is updated, the original vector is marked stale or deleted, and a new vector is generated.

## Future Multimodal Compatibility
The vector store schema (e.g., pgvector) is designed to eventually accept image embeddings (e.g., structural plan fragments) linked to the same underlying job operational ID.

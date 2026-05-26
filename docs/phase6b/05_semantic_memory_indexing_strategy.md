# Semantic Memory Indexing Strategy

## Lessons-Learned Indexing
At job closeout, Project Managers are prompted to write a textual post-mortem. This is chunked, embedded, and indexed globally for the tenant under a specific `lessons_learned` metadata tag, heavily weighting it for future "Similar Job" queries.

## Revision Clustering
A background cron job periodically scans recent time entries across the entire firm, utilizing an LLM strictly for classification (not generation). It clusters time entries into "Revision Rework", "Scope Creep", or "Standard Delivery" buckets, generating semantic metadata that the retrieval pipeline can filter against.

## Operational Pattern Indexing
If a specific discipline consistently overburns on a specific client, the intelligence read models flag the anomaly. The Context Engine translates this anomaly into a textual "Pattern Summary" and embeds it into the vector store as a persistent structural memory for that client.

## Delivery-Risk Semantic Indexing
When the Risk Engine (Phase 5) issues a `CRITICAL` flag, the textual summary of why it triggered is embedded, permanently linking the risk event to the timeline of the job for future retrospective analysis.

## Profitability Pattern Retrieval
When proposing fees for a new job, the memory engine retrieves the semantic clusters of the three most historically similar jobs to highlight where hidden costs (e.g., specific regulatory delays) might arise.

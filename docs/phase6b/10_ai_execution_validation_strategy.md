# AI Execution Validation Strategy

## Hallucination Testing
Automated integration tests inject adversarial prompts and contradictory deterministic data into the orchestration layer. The tests assert that the LLM successfully parses the math over the text and outputs the deterministic truth.

## Retrieval Accuracy Testing
The RAG pipeline is evaluated using a Golden Dataset of known engineering questions ("Why did the bridge project fail?"). The test asserts that the vector search successfully surfaces the correct time entries containing the keyword "geotechnical delays" within the Top 3 results.

## Grounding Validation
Output parsers verify that every AI-generated Action Card strictly matches a Zod schema. If an AI attempts to invent a new DTO field, the test fails, proving the orchestration layer successfully intercepted the anomaly.

## Replay Validation
A conversation with the AI is simulated at Temporal Point X. The exact same conversation is replayed at Temporal Point Y using historical state reconstruction. The outputs must be semantically identical, proving the AI is temporally grounded.

## Semantic Drift Validation
Over time, as engineering terminology evolves, vector clusters may drift. A background validation script periodically compares semantic groupings to ensure "RFI" and "Request For Information" remain tightly clustered.

## Approval Flow Validation
Tests guarantee that generating an AI Action Card does NOT hit the PostgreSQL database mutators. The tests ensure that only the final HTTP POST request carrying the human's session token can execute the transaction.

## Confidence Calibration
The validation suite charts the AI's predicted "Risk Severity" against the deterministic engine's mathematical risk score. If the AI consistently predicts high risk when math predicts low risk, the confidence algorithms are recalibrated to punish semantic hallucination.

# SecureFlow AI Pipeline

The SecureFlow AI pipeline has been architected to minimize external dependencies, ensuring a deterministic, fast, and privacy-preserving analysis process. The pipeline primarily relies on Cloudinary's AI capabilities and a local Rule Engine, completely eliminating the need for mandatory third-party LLMs like OpenAI.

## Pipeline Stages

### 1. Media Upload & Initial Analysis (Cloudinary)
- **Asset Upload**: Users upload media (images, videos) to the platform.
- **On-the-fly Processing**: Media is uploaded directly to Cloudinary.
- **Vision AI Extraction**: During upload, Cloudinary's add-ons extract intelligent metadata:
  - Tags and categories (Object detection)
  - OCR (Text extraction)
  - Moderation (NSFW, explicit content flags)

### 2. Payload Construction
The backend constructs an `EnginePayload` object containing:
- Resource Type (Image, Video, Raw)
- Extracted tags and moderation status
- OCR text (if present)
- General asset metadata (format, dimensions)

### 3. Local Rule Engine Evaluation
The constructed payload is passed to the `SecureFlowEngine`. The engine consists of several modular rule sets:
- **Credentials & Secrets**: Scans OCR text and tags for potential exposure of passwords, API keys, or personal identifiable information (PII).
- **Malware & Phishing**: Flags files with suspicious formats, metadata anomalies, or tags indicating malicious content.
- **Content Moderation**: Analyzes Cloudinary's moderation results and flags inappropriate or restricted content.
- **Network Security**: Analyzes network-related context if applicable.

### 4. Risk Scoring & Findings Generation
The Rule Engine evaluates the context against all rules and aggregates the results:
- Generates specific **Observations** (e.g., "Resource type: image", "Detected element: credit card").
- Identifies **Potential Risks** with assigned severity levels (Info, Low, Medium, High, Critical).
- Calculates a final **Risk Score** based on the severity and confidence of findings.

### 5. Final Report Construction
The engine packages the analysis into a `SecurityAnalysisResult` object, which is then persisted to the database and presented on the dashboard.

## Advantages of this Architecture
- **Zero API Rate Limits**: No dependency on external LLM providers.
- **Deterministic Results**: Rule-based evaluation ensures consistent and predictable findings.
- **Enhanced Privacy**: Data processing is confined to necessary extraction (Cloudinary) and local evaluation, reducing data sharing surfaces.
- **Speed**: Local evaluation is instantaneous compared to waiting for LLM inference.

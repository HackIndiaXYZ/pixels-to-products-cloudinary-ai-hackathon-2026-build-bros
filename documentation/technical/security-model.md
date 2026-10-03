# Security Model & Threat Rules

The SecureFlow AI platform utilizes a deterministic Rule Engine located at `src/security/engine.ts`. This engine evaluates context provided by Cloudinary against predefined rulesets.

## The Rule Engine Architecture

The engine is highly modular. A `Rule` is defined by:
- An `id` (e.g., `cred-001`)
- A `category` (e.g., `Data Exposure`)
- A `severity` (Info, Low, Medium, High, Critical)
- An `evaluate` function that takes a `RuleContext` and returns a boolean or specific findings.

## Current Rulesets

### 1. Credentials & Secrets (`src/security/rules/credentials.ts`)
This ruleset scans the OCR text extracted by Cloudinary for sensitive strings using robust Regular Expressions.
- **Passwords**: Looks for patterns like `password: [value]`.
- **API Keys**: Identifies high-entropy strings and common API key formats (e.g., `sk_live_...`, `AIza...`).
- **PII**: Identifies Social Security Numbers, Credit Card formats, and Phone numbers.

### 2. Content Moderation
Evaluates the direct output of Cloudinary's WebPurify integration.
- If moderation returns `rejected`, a critical finding is generated.

### 3. Malware & Format Validation
Evaluates the metadata and tags of the file.
- Flags suspicious extensions or mismatched MIME types.
- Evaluates tags for indicators of malicious intent (e.g., "phishing", "malware").

## Risk Calculation

The final Risk Score (0-100) is calculated based on the highest severity finding:
- **Critical**: 90-100
- **High**: 70-89
- **Medium**: 40-69
- **Low**: 10-39
- **Info**: 0-9

If multiple findings of the same severity occur, the risk score is incrementally adjusted upwards.

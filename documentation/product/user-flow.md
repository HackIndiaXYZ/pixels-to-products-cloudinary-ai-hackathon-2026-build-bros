# User Flow

The user journey in SecureFlow AI is designed to be seamless, intuitive, and highly functional. 

## Primary Workflow: Security Analysis

1. **Dashboard Landing**
   - User lands on the main dashboard overview.
   - Views high-level metrics, recent findings, and system status.

2. **Asset Upload**
   - User navigates to **New Analysis** or **Workspace**.
   - Drags and drops a media file (image or video).
   - File is securely uploaded to Cloudinary.

3. **Processing & Transformation (Optional)**
   - In the **Workspace**, the user can preview and apply transformations (e.g., blur, crop, background removal).

4. **Security Analysis Execution**
   - User clicks "Run Security Analysis".
   - Cloudinary intelligence (OCR, tags, moderation) is extracted.
   - The local SecureFlow Rule Engine evaluates the data.

5. **Reviewing Findings**
   - User is redirected to the detailed **Evidence / Analysis Report** page.
   - User reviews the Risk Score, Observations, Potential Risks, and Recommendations.

6. **Search & Archival**
   - User can search for past analyses using the Global Search (Ctrl+K).
   - User can view all historical data in the **Evidence Library** and **Findings** tables.

## Navigation Architecture

- **Dashboard**: Main overview.
- **Evidence Library**: Grid/table view of all uploaded media.
- **Findings**: Consolidated table of all security risks identified.
- **Reports**: Analytical charts and aggregated metrics.
- **Pipeline**: View the steps involved in the analysis process.
- **Workspace**: Media transformation studio.
- **Configuration/Status**: Manage settings and view service health.

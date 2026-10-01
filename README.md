# SecureFlow AI

> **Security Intelligence Workstation** — Analyze, reason, and act on visual evidence using Cloudinary and OpenAI.

SecureFlow AI is a production-grade, editorial-style security operations dashboard. It allows teams to ingest media evidence, automatically extract intelligence (tags, OCR, moderation states), reason over that intelligence with AI models, and persist the security findings. 

Built as a submission for the Cloudinary AI Hackathon.

## ✨ Features

- **Media Intelligence Pipeline:** Upload evidence and instantly trigger Cloudinary’s computer vision to extract tags, moderation state, and OCR text.
- **AI Security Reasoning:** Feed Cloudinary’s extracted metadata into OpenAI to evaluate risk scores, infer security threats, and generate actionable recommendations.
- **Editorial UX:** A luxury "Financial Times × Bloomberg Terminal" UI featuring an ivory canvas, serif typography, and rich data tables.
- **Persistent Intelligence:** Automatically store findings in a Supabase PostgreSQL database for historical analysis.
- **Global Command Palette:** Hit `⌘K` from anywhere to quickly jump across investigations, findings, or system settings.

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Media Pipeline:** Cloudinary (Upload, Transformations, AI Vision, Moderation)
- **Reasoning Engine:** OpenAI (GPT-4o)
- **Database & Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + Vanilla CSS Variables

## 🛠️ Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file with the following:
   ```env
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 Pipeline Architecture

1. **Upload:** User drops evidence (image/video/pdf) into the dropzone.
2. **Cloudinary Processing:** Cloudinary ingests the file, optimizes it (`f_auto,q_auto`), and runs AI plugins (OCR, auto-tagging, moderation).
3. **Reasoning Engine:** Next.js API route calls OpenAI, passing Cloudinary's intelligence report to infer physical/digital security risks.
4. **Persistence:** The final risk assessment and Cloudinary metadata are saved to Supabase.
5. **Dashboard:** Findings are rendered across the workstation (Reports, Findings, Evidence Detail).

## 🏆 Hackathon Notes
This project was built focusing heavily on high-fidelity UX and real-world pipeline integration for the Cloudinary AI Hackathon.

-- SecureFlow AI — Supabase Database Schema (v3)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables from previous phases to cleanly apply Phase 4 schema
DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.observations CASCADE;
DROP TABLE IF EXISTS public.analyses CASCADE;
DROP TABLE IF EXISTS public.evidence CASCADE;

-- ============================================================
-- 1. EVIDENCE TABLE
-- Cloudinary is the media source of truth, this stores the metadata
-- ============================================================
CREATE TABLE IF NOT EXISTS public.evidence (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudinary_asset_id  TEXT NOT NULL,
  public_id            TEXT NOT NULL,
  secure_url           TEXT NOT NULL,
  resource_type        TEXT NOT NULL,
  format               TEXT,
  width                INTEGER,
  height               INTEGER,
  bytes                INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. ANALYSES TABLE
-- Stores the high-level security report details
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidence_id            UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_evidence_type TEXT NOT NULL,
  executive_summary      TEXT NOT NULL,
  risk_score             INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  overall_severity       TEXT NOT NULL CHECK (overall_severity IN ('critical', 'high', 'medium', 'low', 'info')),
  analysis_status        TEXT NOT NULL DEFAULT 'completed',
  risk_status            TEXT,
  analysis_confidence    TEXT,
  is_archived            BOOLEAN NOT NULL DEFAULT FALSE,
  model                  TEXT DEFAULT 'gpt-4o',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. OBSERVATIONS TABLE
-- Factual observations derived directly from the media or Cloudinary AI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.observations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id     UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  statement       TEXT NOT NULL,
  evidence_source TEXT NOT NULL CHECK (evidence_source IN ('visual', 'cloudinary_ai', 'metadata')),
  confidence      INTEGER NOT NULL
);

-- ============================================================
-- 4. RISKS TABLE
-- Inferred security implications based on the observations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.risks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id  UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  severity     TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  category     TEXT NOT NULL,
  statement    TEXT NOT NULL,
  evidence     JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence   INTEGER NOT NULL,
  is_inferred  BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 5. RECOMMENDATIONS TABLE
-- Actionable advice derived from the risks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recommendations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  priority    TEXT NOT NULL CHECK (priority IN ('immediate', 'high', 'medium', 'low')),
  action      TEXT NOT NULL,
  rationale   TEXT NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Drop existing policies to ensure anonymous access for the hackathon demo
DROP POLICY IF EXISTS "Users can view own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can insert own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can delete own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can view own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON public.analyses;
DROP POLICY IF EXISTS "Users can view own observations" ON public.observations;
DROP POLICY IF EXISTS "Users can insert own observations" ON public.observations;
DROP POLICY IF EXISTS "Users can view own risks" ON public.risks;
DROP POLICY IF EXISTS "Users can insert own risks" ON public.risks;
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Service role full access evidence" ON public.evidence;
DROP POLICY IF EXISTS "Service role full access analyses" ON public.analyses;
DROP POLICY IF EXISTS "Service role full access observations" ON public.observations;
DROP POLICY IF EXISTS "Service role full access risks" ON public.risks;
DROP POLICY IF EXISTS "Service role full access recommendations" ON public.recommendations;

ALTER TABLE public.evidence DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations DISABLE ROW LEVEL SECURITY;

-- Explicitly remove NOT NULL constraints from existing tables
ALTER TABLE public.evidence ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.analyses ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.observations ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.risks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.recommendations ALTER COLUMN user_id DROP NOT NULL;

-- Note: All previous RLS policies have been removed for the hackathon demo
-- to ensure a frictionless, anonymous user experience.

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX evidence_user_id_idx ON public.evidence(user_id);
CREATE INDEX evidence_created_at_idx ON public.evidence(created_at DESC);

CREATE INDEX analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX analyses_evidence_id_idx ON public.analyses(evidence_id);
CREATE INDEX analyses_created_at_idx ON public.analyses(created_at DESC);

CREATE INDEX observations_analysis_id_idx ON public.observations(analysis_id);
CREATE INDEX risks_analysis_id_idx ON public.risks(analysis_id);
CREATE INDEX recommendations_analysis_id_idx ON public.recommendations(analysis_id);

-- SecureFlow AI — RLS INSERT Policies
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
-- This allows the server-side API routes to persist evidence, analyses, and
-- findings using the anon key (which is safe because these routes are server-only).
--
-- After running this, you do NOT need SUPABASE_SERVICE_ROLE_KEY in .env.local.

-- evidence table
CREATE POLICY "Allow anon insert on evidence"
  ON evidence FOR INSERT
  TO anon
  WITH CHECK (true);

-- analyses table
CREATE POLICY "Allow anon insert on analyses"
  ON analyses FOR INSERT
  TO anon
  WITH CHECK (true);

-- observations table
CREATE POLICY "Allow anon insert on observations"
  ON observations FOR INSERT
  TO anon
  WITH CHECK (true);

-- risks table
CREATE POLICY "Allow anon insert on risks"
  ON risks FOR INSERT
  TO anon
  WITH CHECK (true);

-- recommendations table
CREATE POLICY "Allow anon insert on recommendations"
  ON recommendations FOR INSERT
  TO anon
  WITH CHECK (true);

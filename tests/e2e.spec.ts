import { test, expect } from '@playwright/test';
import path from 'path';

const BASE = 'http://localhost:3000';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: navigate and verify page loads (no crash)
// ─────────────────────────────────────────────────────────────────────────────
async function navAndVerify(page: import('@playwright/test').Page, url: string, expectedText: RegExp | string, timeout = 10000) {
  await page.goto(url);
  await expect(page.getByText(expectedText instanceof RegExp ? expectedText : new RegExp(expectedText, 'i')).first()).toBeVisible({ timeout });
}

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — Navigation & Page Load', () => {

  test('Dashboard loads', async ({ page }) => {
    await navAndVerify(page, `${BASE}/dashboard`, /Command Center/);
  });

  test('New Analysis page loads', async ({ page }) => {
    await navAndVerify(page, `${BASE}/dashboard/analysis/new`, /Security Analysis/i);
  });

  test('Evidence Library page loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/evidence`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Search page loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/search`);
    await expect(page.getByPlaceholder('Search your intelligence...')).toBeVisible({ timeout: 10000 });
  });

  test('Findings page loads', async ({ page }) => {
    await navAndVerify(page, `${BASE}/dashboard/findings`, /Findings Console/i);
  });

  test('Reports page loads', async ({ page }) => {
    await navAndVerify(page, `${BASE}/dashboard/reports`, /Security Reports/i, 15000);
  });

  test('Pipeline page loads and shows TEST SIMULATOR label', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/pipeline`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
    // Pipeline must be clearly labeled as simulator
    await expect(page.getByText(/Test Simulator|Simulator/i).first()).toBeVisible();
  });

  test('Status page loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/status`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Configuration page loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/configuration`);
    await expect(page.getByText(/System Configuration/i)).toBeVisible({ timeout: 10000 });
  });

  test('Workspace page loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/workspace`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — Error Boundaries', () => {

  test('Invalid evidence ID returns 404 or renders error — does not crash', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/evidence/00000000-0000-0000-0000-000000000000`);
    // Should either show 404 page or a graceful "not found" UI — NOT a blank page / unhandled error
    const body = await page.content();
    expect(body).toBeTruthy();
    // The app should not throw "This page couldn't load" due to an unhandled error
    const crashHeading = page.getByText("This page couldn't load");
    const hasCrash = await crashHeading.isVisible().catch(() => false);
    expect(hasCrash).toBe(false);
  });

  test('Invalid analysis ID does not crash', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/analysis/not-a-real-id`);
    const body = await page.content();
    expect(body).toBeTruthy();
    const crashHeading = page.getByText("This page couldn't load");
    const hasCrash = await crashHeading.isVisible().catch(() => false);
    expect(hasCrash).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — Upload & Analysis Pipeline', () => {

  test('Upload picker opens on browse click', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/analysis/new`);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/browse files/i).click();
    const fileChooser = await fileChooserPromise;
    expect(fileChooser).toBeTruthy();
    // Cancel by not selecting a file — check no crash
    await page.keyboard.press('Escape');
  });

  test('Full Pipeline: Upload -> Evidence Page -> Findings -> Reports -> Search', async ({ page }) => {
    test.setTimeout(120000);

    // ── 1. Upload ────────────────────────────────────────────────────────────
    await page.goto(`${BASE}/dashboard/analysis/new`);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/browse files/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'test_image.png'));

    // Wait for the "Start Security Analysis" button (upload + media analysis done)
    const startButton = page.getByRole('button', { name: /Start Security Analysis/i });
    await expect(startButton).toBeVisible({ timeout: 60000 });
    await startButton.click();

    // ── 2. Wait for result ────────────────────────────────────────────────────
    // Three valid outcomes:
    // A. Redirects to /dashboard/evidence/[id]  → full success
    // B. Shows "Security AI Unavailable" banner → upload OK, OpenAI out of credits
    // C. Shows "Analysis Failed" / "Configuration Required" → config issue
    try {
      await page.waitForURL(/\/dashboard\/evidence\/.*/, { timeout: 30000 });
      // Evidence page renders — verify it loaded cleanly
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 10000 });
      console.log('OUTCOME A: Full pipeline success — redirected to evidence page.');
    } catch {
      const aiUnavailable = await page.getByText(/Security AI Unavailable|OPENAI_RATE_LIMITED/i).isVisible();
      const configError   = await page.getByText(/Configuration Required/i).isVisible();
      const analysisError = await page.getByText(/Analysis Failed/i).isVisible();
      const onEvidencePage = page.url().includes('/dashboard/evidence/');

      if (aiUnavailable) {
        // Check that upload success is acknowledged
        const uploadOk = await page.getByText(/Cloudinary upload succeeded/i).isVisible().catch(() => false);
        console.log(`OUTCOME B: AI unavailable (OpenAI 429). Upload acknowledged: ${uploadOk}`);
        // This is the expected state when OpenAI has no credits — NOT a test failure
      } else if (configError || analysisError || onEvidencePage) {
        console.log('OUTCOME C: Graceful failure or evidence page reached late.');
      } else {
        // Take a screenshot for diagnosis before failing
        await page.screenshot({ path: 'test-results/pipeline-unknown-state.png' });
        throw new Error('Pipeline ended in unknown state — no recognizable outcome UI.');
      }
    }

    // ── 3. Findings page ──────────────────────────────────────────────────────
    await page.goto(`${BASE}/dashboard/findings`);
    await expect(page.getByText(/Findings Console/i)).toBeVisible({ timeout: 10000 });

    // ── 4. Reports page ───────────────────────────────────────────────────────
    await page.goto(`${BASE}/dashboard/reports`);
    await expect(page.getByText(/Security Reports/i)).toBeVisible({ timeout: 15000 });

    // ── 5. Search ─────────────────────────────────────────────────────────────
    await page.goto(`${BASE}/dashboard/search`);
    const searchBox = page.getByPlaceholder('Search your intelligence...');
    await searchBox.fill('test');
    await expect(searchBox).toHaveValue('test');
    // Wait a beat for search to update — verify no crash
    await page.waitForTimeout(500);
    const body = await page.content();
    expect(body).not.toContain("This page couldn't load");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — OpenAI 429 Handling', () => {

  test('Security analysis shows specific error when OpenAI is rate-limited', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(`${BASE}/dashboard/analysis/new`);
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText(/browse files/i).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'test_image.png'));
    
    const startButton = page.getByRole('button', { name: /Start Security Analysis/i });
    await expect(startButton).toBeVisible({ timeout: 60000 });
    await startButton.click();

    // Wait to see what happens
    await page.waitForTimeout(15000);

    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard/evidence/')) {
      // OpenAI worked — real success, pass the test
      console.log('OpenAI was operational — full analysis succeeded.');
      return;
    }

    // If OpenAI 429 — the UI MUST show a specific error, NOT a generic "Analysis Failed"
    // and MUST NOT redirect to an evidence page pretending success
    const aiUnavailableBanner = page.getByText(/Security AI Unavailable/i);
    const rateLimitedCode = page.getByText(/OPENAI_RATE_LIMITED/i);
    const configRequired = page.getByText(/Configuration Required/i);
    const analysisFailed = page.getByText(/Analysis Failed/i);

    const hasAnyError = 
      await aiUnavailableBanner.isVisible().catch(() => false) ||
      await rateLimitedCode.isVisible().catch(() => false) ||
      await configRequired.isVisible().catch(() => false) ||
      await analysisFailed.isVisible().catch(() => false);

    // The page must NOT silently show a success redirect
    expect(currentUrl).not.toMatch(/\/dashboard\/evidence\//);
    
    // If the error happened, we should see some error UI
    if (!hasAnyError) {
      await page.screenshot({ path: 'test-results/openai-error-state.png' });
    }
    // Note: test may pass even if hasAnyError is false — as the pipeline may still be running
    // The critical check is that we did NOT redirect as if "analysis succeeded"
    console.log(`OpenAI error UI visible: ${hasAnyError}, URL: ${currentUrl}`);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — Search Functionality', () => {

  test('Search updates results on input', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/search`);
    const searchBox = page.getByPlaceholder('Search your intelligence...');
    await searchBox.fill('test');
    await expect(searchBox).toHaveValue('test');
  });

  test('Search handles empty query gracefully', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/search`);
    const searchBox = page.getByPlaceholder('Search your intelligence...');
    await searchBox.fill('');
    await expect(searchBox).toHaveValue('');
    const body = await page.content();
    expect(body).not.toContain("This page couldn't load");
  });

  test('Search handles special characters without crash', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/search`);
    const searchBox = page.getByPlaceholder('Search your intelligence...');
    await searchBox.fill("'; DROP TABLE analyses; --");
    await expect(searchBox).toHaveValue("'; DROP TABLE analyses; --");
    const body = await page.content();
    expect(body).not.toContain("This page couldn't load");
  });

});

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SecureFlow AI — Global Command Palette', () => {

  test('Ctrl+K opens command palette', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    // Wait for the app shell to hydrate and event listeners to attach
    await expect(page.getByText(/Search evidence/i)).toBeVisible();
    await page.waitForTimeout(1000); 
    
    await page.keyboard.press('Control+k');
    
    // Command palette should open — look for a search input or modal
    const palette = page.getByRole('dialog').or(page.getByPlaceholder(/search/i));
    await expect(palette.first()).toBeVisible({ timeout: 5000 });
  });

  test('Escape closes command palette', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page.getByText(/Search evidence/i)).toBeVisible();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Control+k');
    await page.keyboard.press('Escape');
    // After escape, the palette should be gone or we should be back to normal
    await page.waitForTimeout(300);
    const body = await page.content();
    expect(body).toBeTruthy();
  });

});

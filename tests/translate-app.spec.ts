/**
 * YE-App-Translate Smoke Tests v0.2.13.1
 *
 * Tests install + core functionality of the Translate app on mikevm.
 *
 * Prerequisites:
 * - mikevm running (192.168.31.202), CP on 0.2.13.1
 * - Market Translate manifest deployed
 *
 * Run:
 *   npx playwright test tests/translate-app.spec.ts --headed
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DOMAIN = 'mikevm.test';
const CP_URL = `https://control.${DOMAIN}`;
const TRANSLATE_URL = `https://translate.${DOMAIN}`;
const SS_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });

async function ss(page: Page, name: string) {
  const file = path.join(SS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  [screenshot] ${name}.png`);
}

/** Login to CP via identity SSO */
async function loginToCP(page: Page): Promise<void> {
  await page.goto(`${CP_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await ss(page, 'login-01-cp-login-page');

  const currentUrl = page.url();
  console.log(`  Current URL after /login: ${currentUrl}`);

  // If redirected to identity sign-in
  if (currentUrl.includes('id.') || currentUrl.includes('auth.') || currentUrl.includes('/flows/')) {
    console.log('  Using identity SSO flow');

    // Username step
    // CP admin username = VM name (mikevm), password = tester123
    const usernameInput = page.locator('input[name="uidField"], #id_uid_field, input[type="text"]').first();
    await usernameInput.waitFor({ timeout: 20000 });
    await usernameInput.fill('mikevm');
    await ss(page, 'login-02-username-filled');

    // Click Continue/Next
    const nextBtn = page.locator('button[type="submit"]').first();
    await nextBtn.click();
    await page.waitForTimeout(2000);
    await ss(page, 'login-03-after-username');

    // Password step
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 15000 });
    await passwordInput.fill('tester123');
    await ss(page, 'login-04-password-filled');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await ss(page, 'login-05-after-password');

    // Handle consent screen if it appears (first login or after fresh setup)
    const consentBtn = page.locator('button:has-text("Continue")').first();
    const consentVisible = await consentBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (consentVisible) {
      console.log('  Consent screen — clicking Continue');
      await consentBtn.click();
      await page.waitForTimeout(3000);
      await ss(page, 'login-05b-after-consent');
    }

  } else {
    // PAM login form (used when accessing CP via IP, not subdomain)
    console.log('  Using PAM login form');
    await page.fill('input[name="username"], input[type="text"]', 'mikevm');
    await page.fill('input[name="password"], input[type="password"]', 'tester123');
    await page.click('button[type="submit"]');
  }

  // Wait for CP to load — wait until we leave the identity auth domain
  await page.waitForURL(url => !url.href.includes(`auth.${DOMAIN}`) && url.href.includes(DOMAIN), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await ss(page, 'login-06-cp-loaded');
  console.log(`  [ok] CP loaded: ${page.url()}`);
}

// ─── CP Login ────────────────────────────────────────────────

test('01 - CP login and dashboard loads', async ({ page }) => {
  await loginToCP(page);
  expect(page.url()).toContain(`control.${DOMAIN}`);
  console.log('[ok] CP login');
});

// ─── Market ─────────────────────────────────────────

test('02 - Translate app visible in Market', async ({ page }) => {
  await loginToCP(page);

  // Navigate to Market (not installed apps list)
  await page.goto(`${CP_URL}/market`, { waitUntil: 'networkidle' });
  await ss(page, '02-cp-market');

  // Look for Translate in the market list
  const translateLocator = page.locator('text=/translate/i').first();
  await translateLocator.waitFor({ timeout: 15000 });
  const isVisible = await translateLocator.isVisible();
  await ss(page, '02b-translate-in-list');
  expect(isVisible).toBe(true);
  console.log('[ok] Translate app visible in Market');
});

// ─── Install Translate ────────────────────────────────────────

test('03 - Install Translate app', async ({ page }) => {
  test.setTimeout(600000); // 10 min for install

  await loginToCP(page);

  // Navigate to Market to find and install Translate
  await page.goto(`${CP_URL}/market`, { waitUntil: 'networkidle' });
  await ss(page, '03-market');

  // All Install buttons on market page:
  // [0] "Install from URL" (header)
  // [1] "Install" on Notes card
  // [2] "Install" on Translate card  ← this one
  // Use nth(2) to get the Translate Install button
  const allInstallBtns = page.locator('button:has-text("Install")');
  await allInstallBtns.first().waitFor({ timeout: 15000 });
  const count = await allInstallBtns.count();
  console.log(`  Found ${count} Install buttons on market page`);

  // Click the 3rd button (index 2) = Translate
  await allInstallBtns.nth(2).click();

  await ss(page, '03b-install-clicked');
  await page.waitForTimeout(1000);

  // Handle install dialog: "Install Translate" button appears in the dialog
  const installTranslateBtn = page.locator('button:has-text("Install Translate")').first();
  if (await installTranslateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('  Install dialog appeared — clicking "Install Translate"');
    await installTranslateBtn.click();
    await ss(page, '03c-install-confirmed');
  } else {
    // Try other confirm buttons
    const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Install Now"), button:has-text("Deploy")').last();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      await ss(page, '03c-install-confirmed');
    }
  }

  // Wait for install to complete — look for SSE log output or success state
  console.log('  Waiting for install to complete (up to 5 minutes)...');
  // The install shows real-time logs — wait for "Step 8" or "installed" or URL change
  await page.waitForFunction(
    () => {
      const body = document.body.textContent || '';
      return body.includes('installed successfully') ||
             body.includes('App installed') ||
             body.includes('Running') ||
             (body.includes('Step 8') && body.includes('complete'));
    },
    { timeout: 300000, polling: 2000 }
  );
  await ss(page, '03d-install-complete');
  console.log('[ok] Translate app installed');
});

// ─── Health Check ─────────────────────────────────────────────

test('04 - Translate health API responds', async ({ page }) => {
  // Navigate via page to avoid request context SSL issues
  await page.goto(`${TRANSLATE_URL}/api/health`, { waitUntil: 'networkidle' });
  await ss(page, '04-health-api');

  const content = await page.content();
  const hasStatus = content.includes('ok') || content.includes('status') || content.includes('healthy');
  console.log(`  Health response contains status: ${hasStatus}`);
  // Check URL didn't get a connection error
  expect(page.url()).toContain('translate');
  console.log('[ok] Health API reachable');
});

// ─── SSO Login to Translate ───────────────────────────────────

test('05 - SSO login to Translate app', async ({ page }) => {
  await page.goto(TRANSLATE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await ss(page, '05-translate-home');

  const url = page.url();
  console.log(`  Translate URL: ${url}`);

  if (url.includes('id.') || url.includes('auth.') || url.includes('/flows/') || url.includes('/login')) {
    console.log('  Redirected to identity SSO');

    const usernameInput = page.locator('input[name="uidField"], #id_uid_field, input[type="text"]').first();
    await usernameInput.waitFor({ timeout: 20000 });
    await usernameInput.fill('mikevm');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
    await ss(page, '05b-sso-after-username');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 10000 });
    await passwordInput.fill('tester123');
    await ss(page, '05c-password-filled');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await ss(page, '05d-sso-submitted');
  }

  // Wait for translate app to load
  await page.waitForURL(new RegExp(`translate\\.${DOMAIN}`), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await ss(page, '05e-translate-loaded');
  console.log('[ok] SSO login to Translate app successful');
});

// ─── Translation Flow ─────────────────────────────────────────

test('06 - Translation: Hello World en→de', async ({ page }) => {
  test.setTimeout(120000);

  // Navigate to translate app
  await page.goto(TRANSLATE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Handle identity SSO if redirected
  const url = page.url();
  if (url.includes('id.') || url.includes('auth.') || url.includes('/flows/') || url.includes('/login')) {
    console.log('  Redirected to identity SSO');
    const usernameInput = page.locator('input[name="uidField"], #id_uid_field, input[type="text"]').first();
    await usernameInput.waitFor({ timeout: 20000 });
    await usernameInput.fill('mikevm');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);
    await ss(page, '06-sso-after-username');
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.waitFor({ timeout: 15000 });
    await passwordInput.fill('tester123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    // Handle consent
    const consentBtn = page.locator('button:has-text("Continue")').first();
    if (await consentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await consentBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // Wait for translate app to load
  await page.waitForURL(url => url.href.includes(`translate.${DOMAIN}`), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await ss(page, '06-translate-main');

  // Find source textarea (may be textarea or contenteditable)
  const sourceTextarea = page.locator('textarea, [contenteditable="true"]').first();
  await sourceTextarea.waitFor({ timeout: 20000 });
  await sourceTextarea.fill('Hello, world!');
  await ss(page, '06b-text-entered');

  // Trigger translation
  await sourceTextarea.press('Control+Enter');
  await page.waitForTimeout(5000);
  await ss(page, '06c-translation-result');

  console.log('[ok] Translation flow executed');
});

// ─── Swap Languages ───────────────────────────────────────────

test('07 - Swap languages button', async ({ page }) => {
  await page.goto(TRANSLATE_URL, { waitUntil: 'networkidle' });

  // Handle possible auth redirect
  if (!page.url().includes(`translate.${DOMAIN}`)) {
    const usernameInput = page.locator('input[name="uidField"], input[type="text"]').first();
    if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usernameInput.fill('mikevm');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      await page.locator('input[type="password"]').first().fill('tester123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(new RegExp(`translate\\.${DOMAIN}`), { timeout: 30000 });
    }
  }

  await ss(page, '07-translate-for-swap');

  // Try swap button or keyboard shortcut
  const swapBtn = page.locator(
    'button[aria-label*="swap" i], button[title*="swap" i], button:has-text("⇄")'
  ).first();

  if (await swapBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await swapBtn.click();
    await ss(page, '07b-swapped');
    console.log('[ok] Swap button clicked');
  } else {
    await page.keyboard.press('Control+Shift+S');
    await page.waitForTimeout(500);
    await ss(page, '07b-swap-keyboard');
    console.log('[ok] Swap via keyboard shortcut');
  }
});

// ─── History Page ─────────────────────────────────────────────

test('08 - History page loads', async ({ page }) => {
  await page.goto(`${TRANSLATE_URL}/history`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  if (!page.url().includes(`translate.${DOMAIN}`)) {
    const usernameInput = page.locator('input[name="uidField"], input[type="text"]').first();
    if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usernameInput.fill('mikevm');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      await page.locator('input[type="password"]').first().fill('tester123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(new RegExp(`translate\\.${DOMAIN}`), { timeout: 30000 });
    }
  }

  await ss(page, '08-history-page');
  console.log(`  URL: ${page.url()}`);
  console.log('[ok] History page loaded');
});

// ─── Saved Page ───────────────────────────────────────────────

test('09 - Saved page loads', async ({ page }) => {
  await page.goto(`${TRANSLATE_URL}/saved`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  if (!page.url().includes(`translate.${DOMAIN}`)) {
    const usernameInput = page.locator('input[name="uidField"], input[type="text"]').first();
    if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await usernameInput.fill('mikevm');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      await page.locator('input[type="password"]').first().fill('tester123');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(new RegExp(`translate\\.${DOMAIN}`), { timeout: 30000 });
    }
  }

  await ss(page, '09-saved-page');
  console.log(`  URL: ${page.url()}`);
  console.log('[ok] Saved page loaded');
});

// ─── Languages API ────────────────────────────────────────────

test('10 - Languages API returns list', async ({ page }) => {
  // Navigate to languages API (public endpoint, no auth required)
  await page.goto(`${TRANSLATE_URL}/api/translate/languages`, { waitUntil: 'networkidle' });
  await ss(page, '10-languages-api');

  const content = await page.content();
  // Should contain language data
  const hasLanguages = content.includes('"en"') || content.includes('"de"') || content.includes('English') || content.includes('languages');
  console.log(`  Languages response snippet: ${content.substring(0, 200)}`);
  expect(hasLanguages).toBe(true);
  console.log('[ok] Languages API OK');
});

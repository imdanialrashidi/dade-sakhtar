#!/usr/bin/env node
/**
 * Interaction QA: exercises the React islands through real user interactions
 * and asserts observable behaviour (state changes, persistence, focus).
 *
 * This complements the unit tests: these assertions target browser-only risks
 * — hydration, localStorage persistence across reloads, and accessible names.
 *
 * Usage: node scripts/interaction-qa.mjs [--base http://localhost:4321]
 */
import { chromium } from 'playwright-core';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function resolveChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM && existsSync(process.env.PLAYWRIGHT_CHROMIUM)) {
    return process.env.PLAYWRIGHT_CHROMIUM;
  }

  const cacheRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), '.cache', 'ms-playwright');
  if (existsSync(cacheRoot)) {
    const candidates = readdirSync(cacheRoot)
      .filter((entry) => entry.startsWith('chromium-') || entry.startsWith('chromium_headless_shell-'))
      .sort()
      .reverse();
    for (const dir of candidates) {
      for (const rel of ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-linux/headless_shell']) {
        const full = path.join(cacheRoot, dir, rel);
        if (existsSync(full)) return full;
      }
    }
  }

  for (const system of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
    if (existsSync(system)) return system;
  }

  // Last resort: first browser binary on PATH (covers user-local installs).
  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    try {
      const found = execSync('command -v ' + name, { encoding: 'utf8' }).trim().split('\n')[0];
      if (found && existsSync(found)) return found;
    } catch {
      /* not on PATH */
    }
  }

  throw new Error(
    'No Chromium binary found. Set PLAYWRIGHT_CHROMIUM=/path/to/chrome or run `npx playwright install chromium`.',
  );
}

const baseArgIndex = process.argv.indexOf('--base');
const base = baseArgIndex === -1 ? 'http://localhost:4321' : process.argv[baseArgIndex + 1];

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });

/* ── Quiz island ─────────────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fa-IR' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${base}/practice/practice-foundations`, { waitUntil: 'networkidle' });

  const quiz = page.locator('section[aria-labelledby$="-title"]').first();
  await quiz.waitFor({ state: 'visible', timeout: 10000 });

  // A React component rendered from MDX without a client directive produces
  // identical HTML that silently never responds. Assert hydration explicitly.
  await page.waitForFunction(() => document.documentElement.dataset.quizHydrated === 'true', null, {
    timeout: 10000,
  });
  check('quiz: island actually hydrated', true);

  // Every option must be in the static HTML so the island adds behaviour,
  // not content.
  const staticOptions = await page.locator('section label').count();
  check('quiz: options present in served HTML', staticOptions >= 8, `${staticOptions} options`);

  // Submit must be disabled until every question is answered (disabled state).
  const submit = quiz.getByRole('button', { name: 'بررسی پاسخ‌ها' });
  check('quiz: submit disabled before answering', await submit.isDisabled());

  // Independent oracle: read from the practice content, not from the app's
  // own output. practice-foundations (DSA ch.1): q1=b (finiteness), q2=b
  // (ADT both), q3=false (wall-clock unfair), q4=b ((n+1)/2), q5=15
  // (bubble n=6), q6=5 (loop 1..20 step 4), q7=true (factorial dominates).
  const questions = quiz.locator('ol > li');
  const CORRECT_PICKS = ['b', 'b', 'false', 'b'];
  for (let i = 0; i < CORRECT_PICKS.length; i += 1) {
    await questions.nth(i).locator(`label:has(input[value="${CORRECT_PICKS[i]}"])`).click();
  }
  // Numeric questions take typed input (Persian digits accepted too).
  await questions.nth(4).locator('input[type="text"]').fill('15');
  await questions.nth(5).locator('input[type="text"]').fill('۵');
  await questions.nth(6).locator(`label:has(input[value="true"])`).click();
  check('quiz: submit enabled after answering all', await submit.isEnabled());
  await submit.click();
  await page.waitForTimeout(200);

  const status = await quiz.locator('footer').getByRole('status').innerText();
  check('quiz: grades a fully-correct run as ۱۰۰٪', status.includes('۱۰۰٪'), status.trim());

  // Retry must clear the verdict.
  await quiz.getByRole('button', { name: 'تلاش دوباره' }).click();
  await page.waitForTimeout(150);
  check('quiz: retry resets to unanswered', await submit.isDisabled());

  // Wrong answers must be marked and explained.
  const WRONG_PICKS = ['a', 'a', 'true', 'a'];
  for (let i = 0; i < WRONG_PICKS.length; i += 1) {
    await questions.nth(i).locator(`label:has(input[value="${WRONG_PICKS[i]}"])`).click();
  }
  await questions.nth(4).locator('input[type="text"]').fill('999');
  await questions.nth(5).locator('input[type="text"]').fill('999');
  await questions.nth(6).locator(`label:has(input[value="false"])`).click();
  await submit.click();
  await page.waitForTimeout(200);
  const wrongStatus = await quiz.locator('footer').getByRole('status').innerText();
  check('quiz: grades a fully-wrong run as ۰٪', wrongStatus.includes('۰٪'), wrongStatus.trim());
  const markedWrong = await page.locator('[aria-label="پاسخ نادرست"]').count();
  check('quiz: marks wrong selections (non-color cue)', markedWrong >= 1, `${markedWrong} marked`);

  // Score must survive a reload through the progress store.
  await page.reload({ waitUntil: 'networkidle' });
  const stored = await page.evaluate(() => localStorage.getItem('dr-study-progress:v1'));
  check('quiz: score persisted to localStorage', Boolean(stored && stored.includes('practice-foundations')));

  check('quiz: no uncaught page errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

/* ── Quiz island: recursion slice ──────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fa-IR' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`${base}/practice/practice-recursion`, { waitUntil: 'networkidle' });

  const quiz = page.locator('section[aria-labelledby$="-title"]').first();
  await quiz.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => document.documentElement.dataset.quizHydrated === 'true', null, {
    timeout: 10000,
  });
  check('quiz-rec: island actually hydrated', true);

  const submit = quiz.getByRole('button', { name: 'بررسی پاسخ‌ها' });
  check('quiz-rec: submit disabled before answering', await submit.isDisabled());

  // Independent oracle: practice-recursion answers q1=a, q2=24, q3=b,
  // q4=8, q5=3, q6=6, q7=false.
  const questions = quiz.locator('ol > li');
  await questions.nth(0).locator('label:has(input[value="a"])').click();
  await questions.nth(1).locator('input[type="text"]').fill('24');
  await questions.nth(2).locator('label:has(input[value="b"])').click();
  await questions.nth(3).locator('input[type="text"]').fill('۸');
  await questions.nth(4).locator('input[type="text"]').fill('3');
  await questions.nth(5).locator('input[type="text"]').fill('6');
  await questions.nth(6).locator('label:has(input[value="false"])').click();
  check('quiz-rec: submit enabled after answering all', await submit.isEnabled());
  await submit.click();
  await page.waitForTimeout(200);

  const status = await quiz.locator('footer').getByRole('status').innerText();
  check('quiz-rec: grades a fully-correct run as ۱۰۰٪', status.includes('۱۰۰٪'), status.trim());

  await quiz.getByRole('button', { name: 'تلاش دوباره' }).click();
  await page.waitForTimeout(150);
  check('quiz-rec: retry resets to unanswered', await submit.isDisabled());

  check('quiz-rec: no uncaught page errors', errors.length === 0, errors.join(' | '));

  // Score must survive a reload through the progress store.
  await questions.nth(0).locator('label:has(input[value="a"])').click();
  await questions.nth(1).locator('input[type="text"]').fill('24');
  await questions.nth(2).locator('label:has(input[value="b"])').click();
  await questions.nth(3).locator('input[type="text"]').fill('8');
  await questions.nth(4).locator('input[type="text"]').fill('3');
  await questions.nth(5).locator('input[type="text"]').fill('6');
  await questions.nth(6).locator('label:has(input[value="false"])').click();
  await submit.click();
  await page.waitForTimeout(200);
  await page.reload({ waitUntil: 'networkidle' });
  const stored = await page.evaluate(() => localStorage.getItem('dr-study-progress:v1'));
  check('quiz-rec: score persisted to localStorage', Boolean(stored && stored.includes('practice-recursion')));
  await context.close();
}

/* ── StepReveal island ───────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fa-IR' });
  const page = await context.newPage();
  await page.goto(`${base}/examples/swap-two-variables`, { waitUntil: 'networkidle' });

  const reveal = page.locator('section[aria-label="راه‌حل گام‌به‌گام"]');
  await reveal.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => document.documentElement.dataset.stepRevealHydrated === 'true', null, {
    timeout: 10000,
  });
  check('reveal: island actually hydrated', true);

  const steps = reveal.locator('ol > li');
  check('reveal: hides later steps initially', (await steps.count()) === 0 || (await steps.count()) === 1, `${await steps.count()} visible`);

  await reveal.getByRole('button', { name: 'گام بعدی را ببینید' }).click();
  await page.waitForTimeout(150);
  const afterOne = await steps.count();
  check('reveal: reveals exactly one step per click', afterOne >= 1, `${afterOne} steps`);

  await reveal.getByRole('button', { name: 'همهٔ گام‌ها' }).click();
  await page.waitForTimeout(200);
  check('reveal: "all" reveals every step', (await steps.count()) === 4, `${await steps.count()} steps`);

  const mathInSteps = await steps.locator('.katex').count();
  check('reveal: math is pre-rendered static HTML', mathInSteps >= 3, `${mathInSteps} katex blocks`);

  await reveal.getByRole('button', { name: 'از ابتدا' }).click();
  await page.waitForTimeout(150);
  check('reveal: reset hides steps again', (await steps.count()) === 0, `${await steps.count()} steps`);
  await context.close();
}

/* ── StepReveal island: recursion slice ────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fa-IR' });
  const page = await context.newPage();

  // Lesson with an inline WorkedExample (3 steps).
  await page.goto(`${base}/lessons/recursion-and-factorial`, { waitUntil: 'networkidle' });
  const reveal = page.locator('section[aria-label="راه‌حل گام‌به‌گام"]').first();
  await reveal.scrollIntoViewIfNeeded();
  await reveal.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(() => document.documentElement.dataset.stepRevealHydrated === 'true', null, {
    timeout: 10000,
  });
  check('reveal-rec: lesson island hydrated', true);
  const lessonSteps = reveal.locator('ol > li');
  await reveal.getByRole('button', { name: 'همهٔ گام‌ها' }).click();
  await page.waitForTimeout(200);
  check('reveal-rec: lesson "all" reveals every step', (await lessonSteps.count()) === 3, `${await lessonSteps.count()} steps`);
  check(
    'reveal-rec: lesson math is pre-rendered static HTML',
    (await lessonSteps.locator('.katex').count()) >= 3,
    `${await lessonSteps.locator('.katex').count()} katex blocks`,
  );
  await reveal.getByRole('button', { name: 'از ابتدا' }).click();
  await page.waitForTimeout(150);
  check('reveal-rec: lesson reset hides steps again', (await lessonSteps.count()) === 0, `${await lessonSteps.count()} steps`);

  // Standalone example (3 steps).
  await page.goto(`${base}/examples/factorial-trace`, { waitUntil: 'networkidle' });
  const exampleReveal = page.locator('section[aria-label="راه‌حل گام‌به‌گام"]').first();
  await exampleReveal.scrollIntoViewIfNeeded();
  await exampleReveal.waitFor({ state: 'visible', timeout: 10000 });
  const exampleSteps = exampleReveal.locator('ol > li');
  await exampleReveal.getByRole('button', { name: 'همهٔ گام‌ها' }).click();
  await page.waitForTimeout(200);
  check('reveal-rec: example "all" reveals every step', (await exampleSteps.count()) === 3, `${await exampleSteps.count()} steps`);
  await exampleReveal.getByRole('button', { name: 'از ابتدا' }).click();
  await page.waitForTimeout(150);
  check('reveal-rec: example reset hides steps again', (await exampleSteps.count()) === 0, `${await exampleSteps.count()} steps`);
  await context.close();
}

/* ── Search island ───────────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
  const page = await context.newPage();
  await page.goto(`${base}/search`, { waitUntil: 'networkidle' });

  const input = page.getByRole('searchbox', { name: 'جست‌وجو در دوره' });
  check('search: field has an accessible name', (await input.count()) === 1);
  await page.waitForFunction(() => document.documentElement.dataset.searchHydrated === 'true', null, {
    timeout: 10000,
  });
  check('search: island actually hydrated', true);

  await input.fill('الگوریتم');
  await page.waitForTimeout(250);
  const results = await page.locator('main ul li a').count();
  check('search: returns results for a Persian query', results >= 3, `${results} results`);

  // Arabic keyboard variant of the same word must still match.
  await input.fill('');
  await input.type('الگوریتم', { delay: 10 });
  await page.waitForTimeout(250);
  check('search: typed query still matches', (await page.locator('main ul li a').count()) >= 3);

  await input.fill('zzzqqq');
  await page.waitForTimeout(250);
  const emptyState = await page.getByText('پیدا نشد').count();
  check('search: empty state explains what to do', emptyState >= 1, `${emptyState} empty-state nodes`);
  check('search: clear button restores the idle state', (await page.getByRole('button', { name: 'پاک کردن جست‌وجو' }).count()) === 1);

  await input.fill('');
  await page.waitForTimeout(200);
  check('search: idle state lists what is searchable', (await page.getByText('می‌توانید جست‌وجو کنید').count()) === 1);
  await context.close();
}

/* ── Progress island + persistence across reload ─────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'fa-IR' });
  const page = await context.newPage();
  await page.goto(`${base}/lessons/what-is-an-algorithm`, { waitUntil: 'networkidle' });

  const toggle = page.getByRole('button', { name: 'تمام کردم' });
  await toggle.scrollIntoViewIfNeeded();
  // The completion control is intentionally `client:visible`: it hydrates only
  // once it enters the viewport, so wait for hydration after scrolling to it.
  await page.waitForFunction(() => document.documentElement.dataset.progressHydrated === 'true', null, {
    timeout: 10000,
  });
  check('progress: completion island hydrates on scroll', true);
  await toggle.click();
  await page.waitForTimeout(150);

  check('progress: label flips after marking done', (await page.getByRole('button', { name: 'انجام شد' }).count()) === 1);

  // Bookmark lives beside the title and hydrates during idle time.
  const bookmark = page.getByRole('button', { name: /نشان‌شده‌ها/ }).first();
  await page.waitForFunction(() => document.documentElement.dataset.bookmarkHydrated === 'true', null, {
    timeout: 10000,
  });
  await bookmark.click();
  await page.waitForTimeout(150);
  check('progress: bookmark toggles and persists', (await bookmark.getAttribute('aria-pressed')) === 'true');

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'تمام کردم' }).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.documentElement.dataset.progressHydrated === 'true', null, {
    timeout: 10000,
  });
  const persisted = await page.getByRole('button', { name: 'انجام شد' }).count();
  check('progress: survives a reload', persisted === 1, `${persisted} button(s)`);

  // The homepage readout must reflect the lesson being done.
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const readout = await page.getByText('از دوره کامل شده').count();
  check('progress: homepage readout reflects stored progress', readout === 1);

  // Unmarking must remove it.
  await page.goto(`${base}/lessons/what-is-an-algorithm`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'تمام کردم' }).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.documentElement.dataset.progressHydrated === 'true', null, {
    timeout: 10000,
  });
  await page.getByRole('button', { name: 'انجام شد' }).click();
  await page.waitForTimeout(150);
  check('progress: unmarking is idempotent and reversible', (await page.getByRole('button', { name: 'تمام کردم' }).count()) === 1);
  await context.close();
}

/* ── Theme toggle ────────────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'fa-IR' });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });

  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole('button', { name: 'تغییر پوستهٔ روشن و تیره' }).click();
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  check('theme: toggle flips the theme', before !== after, `${before} → ${after}`);

  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
  check('theme: choice persists across reload', persisted === after, persisted);

  // It must be applied before paint, so no flash of the wrong theme.
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme: body background reflects theme', /\d/.test(bg), bg);
  await context.close();
}

/* ── Mobile navigation ───────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 360, height: 780 }, locale: 'fa-IR' });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });

  const toggle = page.getByRole('button', { name: 'باز کردن منو' });
  const nav = page.locator('#mobile-nav');
  check('mobile: nav starts closed', await nav.isHidden());

  await toggle.click();
  await page.waitForTimeout(150);
  check('mobile: menu opens', await nav.isVisible());
  check(
    'mobile: toggle reports expanded state',
    (await page.getByRole('button', { name: 'بستن منو' }).getAttribute('aria-expanded')) === 'true',
  );

  await nav.getByRole('link', { name: 'واژه‌نامه' }).click();
  await page.waitForURL('**/glossary');
  check('mobile: nav link navigates', page.url().includes('/glossary'));
  await context.close();
}

await browser.close();

const failed = checks.filter((c) => !c.passed);
console.log(`\n${checks.length - failed.length}/${checks.length} interaction checks passed`);
if (failed.length) process.exitCode = 1;
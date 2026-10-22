const { chromium } = require('@playwright/test');
const { hasAuthState } = require('../lib/auth-state');
const { runDanielJourney } = require('../lib/daniel-journey');
(async () => {
  if (!hasAuthState()) throw new Error('First run: npm run auth:save');
  const browser = await chromium.launch({ headless: true });
  try { await runDanielJourney(browser); console.log('Four PRIVATE screenshots saved to screenshots/.'); }
  finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });

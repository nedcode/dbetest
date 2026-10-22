// Manual sign-in: the Playwright test runner never enters real credentials.
const { chromium } = require('@playwright/test');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const fs = require('node:fs');
const path = require('node:path');
const { authStatePath } = require('../lib/auth-state');
(async () => {
  fs.mkdirSync(path.dirname(authStatePath), { recursive: true, mode: 0o700 });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const io = readline.createInterface({ input: stdin, output: stdout });
  try {
    const page = await context.newPage();
    await page.goto('https://www.dbe.academy/auth/login/', { waitUntil: 'domcontentloaded' });
    console.log('Sign in manually in Chromium. NEVER put your password into chat, scripts or Git.');
    await io.question('Once you see your dashboard, press ENTER here... ');
    if (!/\/user\/(?:lernwelt\/)?dashboard\/?(?:[?#]|$)/.test(page.url())) throw new Error('Dashboard not reached; session was not saved.');
    await context.storageState({ path: authStatePath });
    if (process.platform !== 'win32') fs.chmodSync(authStatePath, 0o600);
    console.log('Session saved locally at playwright/.auth/user.json (PRIVATE).');
  } finally { io.close(); await context.close(); await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });

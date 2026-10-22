const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const base = 'http://127.0.0.1:43871';
const demoPassword = 'demo-only';

async function signIn(page, identifier = 'alice@example.test') {
  await page.goto(`${base}/lab/`);
  await page.getByRole('textbox', { name: 'Email address' }).fill(identifier);
  await page.getByLabel('Password').fill(demoPassword);
  const loginResponse = page.waitForResponse(response => response.url().endsWith('/lab/api/session') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Events you can access' })).toBeVisible();
  return (await loginResponse).json();
}

async function createEvent(page, title, date) {
  await page.getByRole('textbox', { name: 'Event title' }).fill(title);
  await page.getByLabel('Event date').fill(date);
  await page.getByRole('button', { name: 'Create event' }).click();
}

test.describe('Controlled local QE Lab browser journey @ci', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post(`${base}/lab/api/_reset`, {
      headers: { 'x-lab-test-reset': 'test-only' },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('invalid sign-in explains the error without opening the workspace', async ({ page }) => {
    await page.goto(`${base}/lab/`);
    await page.getByRole('textbox', { name: 'Email address' }).fill('alice@example.test');
    await page.getByLabel('Password').fill('wrong-demo-value');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid demo login. Check the account and password.');
    await expect(page.getByRole('heading', { name: 'Events you can access' })).toBeHidden();
  });

  test('sign-out revokes the active token before returning to sign-in', async ({ page, request }) => {
    const { token } = await signIn(page);
    const logoutResponse = page.waitForResponse(response => response.url().endsWith('/lab/api/logout') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Sign out' }).click();
    expect((await logoutResponse).status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Sign in to the lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Events you can access' })).toBeHidden();
    const reuse = await request.get(`${base}/lab/api/events`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(reuse.status()).toBe(401);
    expect(await reuse.json()).toEqual({ error: 'unauthorized' });
  });

  test('member creates an event and can read the persisted result', async ({ page, request }) => {
    await signIn(page);
    await createEvent(page, 'Release review', '2026-11-17');
    await expect(page.getByRole('status')).toHaveText('Created Release review on 2026-11-17.');
    await expect(page.getByRole('list', { name: 'Events' }).getByRole('listitem').filter({ hasText: 'Release review' })).toHaveCount(1);
    await expect(page.getByRole('list', { name: 'Recent activity' })).toContainText('Event created');

    const login = await request.post(`${base}/lab/api/session`, {
      data: { identifier: 'alice@example.test', password: demoPassword },
    });
    expect(login.ok()).toBeTruthy();
    const { token } = await login.json();
    const read = await request.get(`${base}/lab/api/events`, {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(read.ok()).toBeTruthy();
    expect((await read.json()).items).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: 'Release review', date: '2026-11-17', ownerId: 'alice' }),
    ]));
  });

  test('duplicate submission reports a conflict and audit decision', async ({ page }) => {
    await signIn(page);
    await createEvent(page, 'Risk review', '2026-12-03');
    await expect(page.getByRole('status')).toContainText('Created Risk review');
    await createEvent(page, 'Risk review', '2026-12-03');
    await expect(page.getByRole('status')).toContainText('Conflict');
    await expect(page.getByRole('list', { name: 'Events' }).getByRole('listitem').filter({ hasText: 'Risk review' })).toHaveCount(1);
    await expect(page.getByRole('list', { name: 'Recent activity' })).toContainText('Duplicate blocked');
  });

  test('member sees own events while admin can inspect all events', async ({ page, request }) => {
    const login = await request.post(`${base}/lab/api/session`, {
      data: { identifier: 'alice@example.test', password: demoPassword },
    });
    const { token } = await login.json();
    const created = await request.post(`${base}/lab/api/events`, {
      headers: { authorization: `Bearer ${token}` },
      data: { title: 'Alice private review', date: '2026-12-09' },
    });
    expect(created.status()).toBe(201);

    const bobLogin = await request.post(`${base}/lab/api/session`, {
      data: { identifier: 'bob@example.test', password: demoPassword },
    });
    const bobSession = await bobLogin.json();
    const deniedRead = await request.get(`${base}/lab/api/events/${(await created.json()).id}`, {
      headers: { authorization: `Bearer ${bobSession.token}` },
    });
    expect(deniedRead.status()).toBe(403);

    await signIn(page, 'bob@example.test');
    await expect(page.getByRole('list', { name: 'Events' })).not.toContainText('Alice private review');
    await expect(page.getByRole('list', { name: 'Recent activity' })).toContainText('Access denied');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in to the lab' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email address' }).fill('admin@example.test');
    await page.getByLabel('Password').fill(demoPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('list', { name: 'Events' })).toContainText('Alice private review');
    await expect(page.getByRole('list', { name: 'Recent activity' })).toContainText('Event created');
  });

  test('keyboard flow, accessibility and responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}/lab/`);
    const loginViolations = (await new AxeBuilder({ page }).analyze()).violations;
    expect(loginViolations).toEqual([]);

    const email = page.getByRole('textbox', { name: 'Email address' });
    const password = page.getByLabel('Password');
    await email.focus();
    await page.keyboard.type('alice@example.test');
    await page.keyboard.press('Tab');
    await expect(password).toBeFocused();
    await page.keyboard.type(demoPassword);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Events you can access' })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();

    const workspaceViolations = (await new AxeBuilder({ page }).analyze()).violations;
    expect(workspaceViolations).toEqual([]);

    await page.setViewportSize({ width: 1280, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBeTruthy();
    const createPanel = await page.getByRole('heading', { name: 'Plan an event' }).boundingBox();
    const listPanel = await page.getByRole('heading', { name: 'Event list' }).boundingBox();
    expect(createPanel.x).toBeLessThan(listPanel.x);
  });
});

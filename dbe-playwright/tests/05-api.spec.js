const { test, expect } = require('@playwright/test');
const base = 'http://127.0.0.1:43871';
test.describe('Local REST API contracts @ci (not DBE production)', () => {
  test('GET health', async ({ request }) => {
    const r = await request.get(base+'/health');
    expect(r.status()).toBe(200);
    expect(await r.json()).toEqual({ status:'ok', service:'local-dbe-training-api' });
  });
  test('GET events schema', async ({ request }) => {
    const r = await request.get(base+'/api/events?month=2026-10');
    expect(r.status()).toBe(200);
    const v = await r.json();
    expect(v.items).toHaveLength(v.count);
    expect(v.count).toBeGreaterThan(0);
    for (const e of v.items) expect(e).toEqual({
      id: expect.any(String), title: expect.any(String), date: expect.stringMatching(/^2026-10-\d{2}$/)
    });
  });
  test('GET unknown event 404', async ({ request }) => {
    const r = await request.get(base+'/api/events/unknown');
    expect(r.status()).toBe(404);
    expect(await r.json()).toEqual({ error: 'not_found' });
  });
  test('GET invalid month 400', async ({ request }) => {
    const r = await request.get(base+'/api/events?month=2026-99');
    expect(r.status()).toBe(400);
    expect(await r.json()).toEqual({ error: 'invalid_month' });
  });
  test('POST valid event 201', async ({ request }) => {
    const payload = { title:'QA demo', date:'2026-10-30' };
    const r = await request.post(base+'/api/events', { data: payload });
    expect(r.status()).toBe(201);
    expect(await r.json()).toMatchObject(payload);
  });
  test('POST invalid event 422', async ({ request }) => {
    const r = await request.post(base+'/api/events', { data:{ title:'' } });
    expect(r.status()).toBe(422);
    expect(await r.json()).toEqual({ error:'invalid_event' });
  });
  test('POST empty login 400', async ({ request }) => {
    const r = await request.post(base+'/api/login', { data:{ identifier:'', password:'' } });
    expect(r.status()).toBe(400);
    expect(await r.json()).toEqual({ error:'missing_credentials' });
  });
  test('POST invalid demo login 401', async ({ request }) => {
    const r = await request.post(base+'/api/login', { data:{ identifier:'not-real@example.invalid', password:'bad-demo' } });
    expect(r.status()).toBe(401);
    expect(await r.json()).toEqual({ error:'invalid_credentials' });
  });
  test('POST valid local demo login 200', async ({ request }) => {
    const r = await request.post(base+'/api/login', { data:{ identifier:'demo@example.test', password:'local-demo-only' } });
    expect(r.status()).toBe(200);
    expect((await r.json()).authenticated).toBe(true);
  });
});

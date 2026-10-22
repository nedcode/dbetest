const { test, expect } = require('@playwright/test');

const base = 'http://127.0.0.1:43871/lab/api';
const password = 'demo-only';

async function signIn(request, identifier) {
  const response = await request.post(`${base}/session`, { data: { identifier, password } });
  expect(response.status()).toBe(200);
  const session = await response.json();
  expect(session.token).toEqual(expect.any(String));
  return session;
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

test.describe('Local QE lab API @ci (synthetic accounts only)', () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post(`${base}/_reset`, { headers: { 'x-lab-test-reset': 'test-only' } });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ reset: true });
  });

  test('session checks credentials and protected routes require a bearer token', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    expect(alice.user).toEqual({ id: 'alice', role: 'user' });

    const invalid = await request.post(`${base}/session`, { data: { identifier: 'alice@example.test', password: 'wrong' } });
    expect(invalid.status()).toBe(401);
    expect(await invalid.json()).toEqual({ error: 'invalid_credentials' });

    for (const headers of [{}, bearer('invalid-token')]) {
      for (const [method, path, data] of [
        ['get', '/events'],
        ['get', '/events/lab-101'],
        ['get', '/audit'],
        ['post', '/events', { title: 'Unauthorized', date: '2026-11-01' }],
        ['post', '/logout'],
      ]) {
        const response = await request[method](`${base}${path}`, { headers, data });
        expect(response.status()).toBe(401);
        expect(await response.json()).toEqual({ error: 'unauthorized' });
      }
    }
    expect((await request.get(`${base}/events`, { headers: bearer(alice.token) })).status()).toBe(200);
  });

  test('event and audit collections are scoped to owner; admin sees both', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    const bob = await signIn(request, 'bob@example.test');
    const admin = await signIn(request, 'admin@example.test');

    for (const [session, expectedOwnerIds] of [
      [alice, ['alice']],
      [bob, ['bob']],
      [admin, ['alice', 'bob']],
    ]) {
      const eventResponse = await request.get(`${base}/events`, { headers: bearer(session.token) });
      expect(eventResponse.status()).toBe(200);
      const eventList = await eventResponse.json();
      expect(eventList.count).toBe(expectedOwnerIds.length);
      expect(eventList.items.map(item => item.ownerId).sort()).toEqual(expectedOwnerIds);

      const auditResponse = await request.get(`${base}/audit`, { headers: bearer(session.token) });
      expect(auditResponse.status()).toBe(200);
      const auditList = await auditResponse.json();
      expect(auditList.count).toBe(expectedOwnerIds.length);
      expect(auditList.items.map(item => item.actorId).sort()).toEqual(expectedOwnerIds);
    }
  });

  test('logout revokes only the current session token', async ({ request }) => {
    const first = await signIn(request, 'alice@example.test');
    const second = await signIn(request, 'alice@example.test');

    const logout = await request.post(`${base}/logout`, { headers: bearer(first.token) });
    expect(logout.status()).toBe(200);
    expect(await logout.json()).toEqual({ loggedOut: true });

    const revoked = await request.get(`${base}/events`, { headers: bearer(first.token) });
    expect(revoked.status()).toBe(401);
    expect(await revoked.json()).toEqual({ error: 'unauthorized' });
    expect((await request.post(`${base}/logout`, { headers: bearer(first.token) })).status()).toBe(401);

    const stillActive = await request.get(`${base}/events`, { headers: bearer(second.token) });
    expect(stillActive.status()).toBe(200);
  });

  test('owner creates and reads an event with a visible audit entry', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    const payload = { title: '  QA workshop  ', date: '2026-11-05' };
    const created = await request.post(`${base}/events`, { headers: bearer(alice.token), data: payload });
    expect(created.status()).toBe(201);
    const event = await created.json();
    expect(event).toEqual({ id: 'lab-103', title: 'QA workshop', date: '2026-11-05', ownerId: 'alice' });

    const detail = await request.get(`${base}/events/${event.id}`, { headers: bearer(alice.token) });
    expect(detail.status()).toBe(200);
    expect(await detail.json()).toEqual(event);

    const list = await (await request.get(`${base}/events`, { headers: bearer(alice.token) })).json();
    expect(list.count).toBe(2);
    expect(list.items).toContainEqual(event);

    const audit = await (await request.get(`${base}/audit`, { headers: bearer(alice.token) })).json();
    expect(audit.items).toContainEqual(expect.objectContaining({
      actorId: 'alice', action: 'event_created', eventId: event.id, occurredAt: expect.any(String),
    }));
  });

  test('same owner and event values conflict without creating a duplicate', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    const bob = await signIn(request, 'bob@example.test');
    const payload = { title: 'Review meeting', date: '2026-11-07' };
    const first = await request.post(`${base}/events`, { headers: bearer(alice.token), data: payload });
    expect(first.status()).toBe(201);

    const duplicate = await request.post(`${base}/events`, {
      headers: bearer(alice.token), data: { title: ' review meeting ', date: payload.date },
    });
    expect(duplicate.status()).toBe(409);
    expect(await duplicate.json()).toEqual({ error: 'event_conflict' });

    const aliceEvents = await (await request.get(`${base}/events`, { headers: bearer(alice.token) })).json();
    expect(aliceEvents.count).toBe(2);
    const audit = await (await request.get(`${base}/audit`, { headers: bearer(alice.token) })).json();
    expect(audit.items).toContainEqual(expect.objectContaining({
      action: 'event_conflict', actorId: 'alice', eventId: (await first.json()).id,
    }));

    const bobCreatesSameValues = await request.post(`${base}/events`, { headers: bearer(bob.token), data: payload });
    expect(bobCreatesSameValues.status()).toBe(201);
    expect((await bobCreatesSameValues.json()).ownerId).toBe('bob');
  });

  test('cross-user reads are denied and audited; admin can read both', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    const bob = await signIn(request, 'bob@example.test');
    const admin = await signIn(request, 'admin@example.test');

    const forbidden = await request.get(`${base}/events/lab-102`, { headers: bearer(alice.token) });
    expect(forbidden.status()).toBe(403);
    expect(await forbidden.json()).toEqual({ error: 'forbidden' });

    const bobAudit = await (await request.get(`${base}/audit`, { headers: bearer(bob.token) })).json();
    expect(bobAudit.items.some(entry => entry.action === 'event_read_denied')).toBe(false);
    const aliceAudit = await (await request.get(`${base}/audit`, { headers: bearer(alice.token) })).json();
    expect(aliceAudit.items).toContainEqual(expect.objectContaining({ actorId: 'alice', action: 'event_read_denied', eventId: 'lab-102' }));

    for (const id of ['lab-101', 'lab-102']) {
      const response = await request.get(`${base}/events/${id}`, { headers: bearer(admin.token) });
      expect(response.status()).toBe(200);
      expect((await response.json()).id).toBe(id);
    }
    const adminAudit = await (await request.get(`${base}/audit`, { headers: bearer(admin.token) })).json();
    expect(adminAudit.items).toContainEqual(expect.objectContaining({ action: 'event_read_denied', eventId: 'lab-102' }));
  });

  test('unknown event is 404, valid invalid data is 422, malformed JSON is 400', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    const headers = bearer(alice.token);

    const missing = await request.get(`${base}/events/not-here`, { headers });
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ error: 'not_found' });

    for (const data of [null, { title: '', date: '2026-11-10' }, { title: 'Workshop', date: '2026-02-30' }]) {
      const response = await request.post(`${base}/events`, { headers, data });
      expect(response.status()).toBe(422);
      expect(await response.json()).toEqual({ error: 'invalid_event' });
    }

    const malformed = await request.post(`${base}/events`, {
      headers: { ...headers, 'content-type': 'application/json' },
      data: Buffer.from('{broken', 'utf8'),
    });
    expect(malformed.status()).toBe(400);
    expect(await malformed.json()).toEqual({ error: 'invalid_json' });

    const list = await (await request.get(`${base}/events`, { headers })).json();
    expect(list.count).toBe(1);
  });

  test('reset requires the local test header and invalidates sessions', async ({ request }) => {
    const alice = await signIn(request, 'alice@example.test');
    for (const headers of [{}, { 'x-lab-test-reset': 'wrong' }]) {
      const denied = await request.post(`${base}/_reset`, { headers });
      expect(denied.status()).toBe(403);
      expect(await denied.json()).toEqual({ error: 'forbidden' });
    }
    expect((await request.get(`${base}/events`, { headers: bearer(alice.token) })).status()).toBe(200);

    const reset = await request.post(`${base}/_reset`, { headers: { 'x-lab-test-reset': 'test-only' } });
    expect(reset.status()).toBe(200);
    const expired = await request.get(`${base}/events`, { headers: bearer(alice.token) });
    expect(expired.status()).toBe(401);
    const newAlice = await signIn(request, 'alice@example.test');
    const list = await (await request.get(`${base}/events`, { headers: bearer(newAlice.token) })).json();
    expect(list.count).toBe(1);
    expect(list.items[0].id).toBe('lab-101');
  });
});

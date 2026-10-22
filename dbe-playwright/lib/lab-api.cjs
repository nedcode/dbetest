// Isolated, in-memory QE lab. Accounts and data are synthetic and local only.
const { randomBytes } = require('node:crypto');
const { validateEvent, mayReadEvent } = require('./qe-domain.cjs');

const accounts = new Map([
  ['alice@example.test', { id: 'alice', role: 'user' }],
  ['bob@example.test', { id: 'bob', role: 'user' }],
  ['admin@example.test', { id: 'admin', role: 'admin' }],
]);

let events;
let audit;
let sessions;
let nextEventId;
let nextAuditId;

function resetState() {
  events = [
    { id: 'lab-101', title: 'Demo training', date: '2026-10-22', ownerId: 'alice' },
    { id: 'lab-102', title: 'Peer review', date: '2026-10-23', ownerId: 'bob' },
  ];
  audit = [
    { id: 'aud-101', actorId: 'alice', action: 'event_created', eventId: 'lab-101', occurredAt: '2026-10-22T09:00:00.000Z' },
    { id: 'aud-102', actorId: 'bob', action: 'event_created', eventId: 'lab-102', occurredAt: '2026-10-22T09:01:00.000Z' },
  ];
  sessions = new Map();
  nextEventId = 103;
  nextAuditId = 103;
}
resetState();

function log(actor, action, eventId) {
  audit.push({
    id: `aud-${nextAuditId++}`,
    actorId: actor.id,
    action,
    eventId,
    occurredAt: new Date().toISOString(),
  });
}

function tokenFor(req) {
  const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(req.headers.authorization || '');
  return match && match[1];
}

function isLoopback(req) {
  return req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1' || req.socket.remoteAddress === '::ffff:127.0.0.1';
}

function createLabApi({ send, bodyOf }) {
  return async function handleLabApi(req, res, pathname) {
    if (!pathname.startsWith('/lab/api/')) return false;

    if (req.method === 'POST' && pathname === '/lab/api/_reset') {
      if (!isLoopback(req) || req.headers['x-lab-test-reset'] !== 'test-only')
        send(res, 403, { error: 'forbidden' });
      else {
        resetState();
        send(res, 200, { reset: true });
      }
      return true;
    }

    if (req.method === 'POST' && pathname === '/lab/api/session') {
      let body;
      try { body = await bodyOf(req); }
      catch { send(res, 400, { error: 'invalid_json' }); return true; }
      const user = body && typeof body === 'object' && accounts.get(body.identifier);
      if (!user || body.password !== 'demo-only')
        send(res, 401, { error: 'invalid_credentials' });
      else {
        const token = randomBytes(24).toString('base64url');
        sessions.set(token, user);
        send(res, 200, { token, user });
      }
      return true;
    }

    const token = tokenFor(req);
    const actor = token && sessions.get(token);
    if (!actor) { send(res, 401, { error: 'unauthorized' }); return true; }

    if (req.method === 'POST' && pathname === '/lab/api/logout') {
      sessions.delete(token);
      send(res, 200, { loggedOut: true });
      return true;
    }

    if (req.method === 'GET' && pathname === '/lab/api/events') {
      const items = actor.role === 'admin' ? events : events.filter(event => mayReadEvent(actor, event));
      send(res, 200, { items, count: items.length });
      return true;
    }

    if (req.method === 'GET' && pathname.startsWith('/lab/api/events/')) {
      const id = pathname.slice('/lab/api/events/'.length);
      const event = events.find(item => item.id === id);
      if (!event) send(res, 404, { error: 'not_found' });
      else if (!mayReadEvent(actor, event)) {
        log(actor, 'event_read_denied', id);
        send(res, 403, { error: 'forbidden' });
      } else send(res, 200, event);
      return true;
    }

    if (req.method === 'POST' && pathname === '/lab/api/events') {
      let body;
      try { body = await bodyOf(req); }
      catch { send(res, 400, { error: 'invalid_json' }); return true; }
      if (validateEvent(body)) {
        send(res, 422, { error: 'invalid_event' });
        return true;
      }
      const title = body.title.trim();
      const duplicate = events.find(event => event.ownerId === actor.id && event.date === body.date && event.title.toLocaleLowerCase('en') === title.toLocaleLowerCase('en'));
      if (duplicate) {
        log(actor, 'event_conflict', duplicate.id);
        send(res, 409, { error: 'event_conflict' });
        return true;
      }
      const event = { id: `lab-${nextEventId++}`, title, date: body.date, ownerId: actor.id };
      events.push(event);
      log(actor, 'event_created', event.id);
      send(res, 201, event);
      return true;
    }

    if (req.method === 'GET' && pathname === '/lab/api/audit') {
      const items = actor.role === 'admin' ? audit : audit.filter(entry => entry.actorId === actor.id);
      send(res, 200, { items, count: items.length });
      return true;
    }

    send(res, 404, { error: 'not_found' });
    return true;
  };
}

module.exports = { createLabApi };

// Deterministic training API, NOT a real DBE Academy backend. Localhost only.
const http = require('node:http');
const port = 43871;
const events = [
 { id: 'ev-101', title: 'Demo training', date: '2026-10-22' },
 { id: 'ev-102', title: 'Demo review', date: '2026-10-23' }
];
function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}
function bodyOf(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => { raw += c; if (raw.length > 10000) { reject(Error('large body')); req.destroy(); } });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch(e) { reject(e); } });
    req.on('error', reject);
  });
}
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:' + port);
  if (req.method === 'GET' && url.pathname === '/health')
    return send(res, 200, { status: 'ok', service: 'local-dbe-training-api' });
  if (req.method === 'GET' && url.pathname === '/api/events') {
    const m = url.searchParams.get('month');
    if (m && !/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) return send(res, 400, { error: 'invalid_month' });
    const items = m ? events.filter(e => e.date.startsWith(m)) : events;
    return send(res, 200, { items, count: items.length });
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/events/')) {
    const e = events.find(x => x.id === url.pathname.split('/').pop());
    return send(res, e ? 200 : 404, e || { error: 'not_found' });
  }
  if (req.method === 'POST' && url.pathname === '/api/login') {
    try {
      const b = await bodyOf(req);
      if (!b.identifier || !b.password) return send(res, 400, { error: 'missing_credentials' });
      if (b.identifier !== 'demo@example.test' || b.password !== 'local-demo-only') return send(res, 401, { error: 'invalid_credentials' });
      return send(res, 200, { authenticated: true, accessToken: 'mock-token-not-valid-anywhere' });
    } catch { return send(res, 400, { error: 'invalid_json' }); }
  }
  if (req.method === 'POST' && url.pathname === '/api/events') {
    try {
      const b = await bodyOf(req);
      if (typeof b.title !== 'string' || !b.title.trim() || typeof b.date !== 'string' ||
          !/^\d{4}-\d{2}-\d{2}$/.test(b.date) || Number.isNaN(Date.parse(b.date + 'T00:00:00Z')))
        return send(res, 422, { error: 'invalid_event' });
      return send(res, 201, { id: 'ev-created-demo', title: b.title, date: b.date });
    } catch { return send(res, 400, { error: 'invalid_json' }); }
  }
  return send(res, 404, { error: 'not_found' });
}).listen(port, '127.0.0.1', () => console.log('Mock DBE training API listening on localhost:' + port));

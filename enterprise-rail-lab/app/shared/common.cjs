'use strict';
const crypto = require('node:crypto');
const http = require('node:http');
class HttpError extends Error {
  constructor(status, code, message = code) { super(message); this.status = status; this.code = code; }
}
function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(data));
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 32_768) { reject(new HttpError(413, 'PAYLOAD_TOO_LARGE')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new HttpError(400, 'INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', process.env.LAB_SIGNING_KEY).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token) {
  if (typeof token !== 'string') throw new HttpError(401, 'UNAUTHORIZED');
  const [body, mac, extra] = token.split('.');
  if (!body || !mac || extra) throw new HttpError(401, 'UNAUTHORIZED');
  const expected = crypto.createHmac('sha256', process.env.LAB_SIGNING_KEY).update(body).digest();
  let supplied;
  try { supplied = Buffer.from(mac, 'base64url'); } catch { throw new HttpError(401, 'UNAUTHORIZED'); }
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) throw new HttpError(401, 'UNAUTHORIZED');
  let payload;
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { throw new HttpError(401, 'UNAUTHORIZED'); }
  if (!payload || !['traveler','support'].includes(payload.role) || typeof payload.sub !== 'string' || payload.exp < Date.now())
    throw new HttpError(401, 'UNAUTHORIZED');
  return payload;
}
function identity(req) { return verify((req.headers.authorization || '').replace(/^Bearer\s+/i, '')); }
function internal(req) {
  if (req.headers['x-internal-key'] !== process.env.LAB_INTERNAL_KEY) throw new HttpError(403, 'INTERNAL_ONLY');
}
function resetAuthorized(req) {
  if (process.env.LAB_TEST_MODE !== '1' || req.headers['x-lab-reset'] !== 'fixture-only-reset-key')
    throw new HttpError(403, 'TEST_RESET_DISABLED');
}
function listener(handler, port) {
  const server = http.createServer(async (req, res) => {
    try { await handler(req, res, new URL(req.url, `http://127.0.0.1:${port}`)); }
    catch (err) {
      const e = err instanceof HttpError ? err : new HttpError(500, 'SERVICE_ERROR');
      if (e.status >= 500) console.error(`[${port}]`, err);
      if (!res.headersSent) json(res, e.status, { error: e.code, message: e.message });
    }
  });
  server.listen(port, '127.0.0.1', () => console.log(`[${port}] ready`));
}
async function call(port, path, { method = 'GET', body, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { ...(body ? {'content-type':'application/json'} : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(3000)
    });
  } catch { throw new HttpError(503, 'DEPENDENCY_UNAVAILABLE'); }
  const data = await res.json();
  if (!res.ok) throw new HttpError(res.status, data.error || 'DEPENDENCY_FAILED', data.message || data.error);
  return data;
}
const internalHeaders = () => ({ 'x-internal-key': process.env.LAB_INTERNAL_KEY });
module.exports = { HttpError, json, readJson, sign, verify, identity, internal, resetAuthorized, listener, call, internalHeaders };

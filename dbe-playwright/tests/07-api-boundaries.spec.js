const { test, expect } = require('@playwright/test');
const base='http://127.0.0.1:43871';
test.describe('QE Lab REST boundary and contract @ci', () => {
  for (const month of ['2026-00','2026-13','not-a-month','2026-1','2026-12-01']) {
    test('reject invalid month '+month, async ({request}) => {
      const r=await request.get(base+'/api/events?month='+encodeURIComponent(month));
      expect(r.status()).toBe(400);
      expect(await r.json()).toEqual({error:'invalid_month'});
    });
  }
  for (const payload of [
    {title:'',date:'2026-10-22'},
    {title:'  ',date:'2026-10-22'},
    {title:'a'.repeat(101),date:'2026-10-22'},
    {title:'Training',date:'2026-02-30'},
    {title:'Training',date:'2025-02-29'},
    {title:'Training',date:'invalid'},
    {title:'Training',date:null},
    null
  ]) {
    test('reject invalid event '+JSON.stringify(payload)?.slice(0,70), async ({request}) => {
      const r=await request.post(base+'/api/events',{data:payload});
      expect(r.status()).toBe(422);
      expect(await r.json()).toEqual({error:'invalid_event'});
    });
  }
  test('content type JSON',async({request})=>{
    const r=await request.get(base+'/api/events');
    expect(r.headers()['content-type']).toContain('application/json');
  });
  test('no store cache header',async({request})=>{
    const r=await request.get(base+'/api/events');
    expect(r.headers()['cache-control']).toBe('no-store');
  });
  test('unknown route 404',async({request})=>{
    const r=await request.get(base+'/api/missing');
    expect(r.status()).toBe(404);
  });
  test('invalid JSON body 400',async({request})=>{
    // Buffer sends the malformed bytes as-is; Playwright JSON-encodes string data.
    const r=await request.post(base+'/api/events',{data:Buffer.from('{broken','utf8'),headers:{'content-type':'application/json'}});
    expect(r.status()).toBe(400);
    expect(await r.json()).toEqual({error:'invalid_json'});
  });
  test('oversized JSON body returns 400 without resetting the connection',async({request})=>{
    const body = Buffer.from(JSON.stringify({title:'a'.repeat(10_001),date:'2026-10-22'}));
    const r = await request.post(base+'/api/events',{data:body,headers:{'content-type':'application/json'}});
    expect(r.status()).toBe(400);
    expect(await r.json()).toEqual({error:'invalid_json'});
  });
});

const {test,expect}=require('@playwright/test');
const {base,reset,login,api}=require('./helpers');
test.beforeEach(async({request})=>reset(request));
test('API contract: catalog offers priced journeys with explicit inventory',async({request})=>{
 const r=await request.get(`${base}/api/journeys`);expect(r.status()).toBe(200);
 const {journeys}=await r.json();expect(journeys).toHaveLength(2);
 for(const j of journeys){expect(j).toMatchObject({id:expect.any(String),origin:expect.any(String),destination:expect.any(String),priceCents:expect.any(Number),availableSeats:expect.any(Number)});expect(j.priceCents).toBeGreaterThan(0);}
});
test('API workflow: reserve → approved payment → ticket → notification',async({request})=>{
 const token=await login(request);
 const b=await api(request,token,'POST','/bookings',{journeyId:'R-101'});expect(b.status()).toBe(201);
 const booking=(await b.json()).booking;expect(booking.status).toBe('PENDING_PAYMENT');expect(booking.priceCents).toBe(4900);
 const p=await api(request,token,'POST',`/bookings/${booking.id}/pay`,{paymentMethod:'demo-approved'});expect(p.status()).toBe(200);
 const ticket=(await p.json()).booking;expect(ticket.status).toBe('TICKET_ISSUED');expect(ticket.ticketId).toMatch(/^TKT-/);
 const n=await api(request,token,'GET','/notifications');expect((await n.json()).messages).toHaveLength(1);
});
test('API negative: unknown journey returns 404',async({request})=>{
 const token=await login(request);const r=await api(request,token,'POST','/bookings',{journeyId:'R-NOT-REAL'});
 expect(r.status()).toBe(404);expect((await r.json()).error).toBe('JOURNEY_NOT_FOUND');
});
test('API negative: caller cannot override server-calculated price',async({request})=>{
 const token=await login(request);const r=await api(request,token,'POST','/bookings',{journeyId:'R-101',priceCents:1});
 expect(r.status()).toBe(422);expect((await r.json()).error).toBe('INVALID_BOOKING');
});
test('API negative: sold-out inventory returns 409 without overselling',async({request})=>{
 const token=await login(request);
 for(let i=0;i<2;i++)expect((await api(request,token,'POST','/bookings',{journeyId:'R-101'})).status()).toBe(201);
 const r=await api(request,token,'POST','/bookings',{journeyId:'R-101'});expect(r.status()).toBe(409);
 expect((await r.json()).error).toBe('SOLD_OUT');
 const journeys=(await (await request.get(`${base}/api/journeys`)).json()).journeys;
 expect(journeys.find(j=>j.id==='R-101').availableSeats).toBe(0);
});
test('API negative: declined payment leaves reservation unpaid and no ticket',async({request})=>{
 const token=await login(request);const r=await api(request,token,'POST','/bookings',{journeyId:'R-101'});
 const id=(await r.json()).booking.id;
 const decline=await api(request,token,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-declined'});
 expect(decline.status()).toBe(402);expect((await decline.json()).error).toBe('PAYMENT_DECLINED');
 const b=(await (await api(request,token,'GET',`/bookings/${id}`)).json()).booking;
 expect(b.status).toBe('PENDING_PAYMENT');expect(b.ticketId).toBeNull();
 expect((await (await api(request,token,'GET','/notifications')).json()).messages).toHaveLength(0);
});
test('API idempotency: retry does not duplicate payment or notification',async({request})=>{
 const token=await login(request);const id=(await (await api(request,token,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 const first=await api(request,token,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'});
 const second=await api(request,token,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'});
 expect(first.status()).toBe(200);expect(second.status()).toBe(200);
 expect((await first.json()).booking.chargeId).toBe((await second.json()).booking.chargeId);
 const charges=await request.get(`${base}/__test/charges`,{headers:{'x-lab-reset':'fixture-only-reset-key'}});
 expect((await charges.json()).charges).toHaveLength(1);
 expect((await (await api(request,token,'GET','/notifications')).json()).messages).toHaveLength(1);
});
test('API lifecycle: cancel unpaid reservation releases inventory',async({request})=>{
 const token=await login(request);const id=(await (await api(request,token,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 expect((await api(request,token,'POST',`/bookings/${id}/cancel`)).status()).toBe(200);
 const journeys=(await (await request.get(`${base}/api/journeys`)).json()).journeys;
 expect(journeys.find(j=>j.id==='R-101').availableSeats).toBe(2);
 const newBooking=await api(request,token,'POST','/bookings',{journeyId:'R-101'});
 expect(newBooking.status()).toBe(201);
});
test('API invalid transition: ticketed reservation cannot be cancelled',async({request})=>{
 const token=await login(request);const id=(await (await api(request,token,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 await api(request,token,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'});
 const r=await api(request,token,'POST',`/bookings/${id}/cancel`);
 expect(r.status()).toBe(409);expect((await r.json()).error).toBe('INVALID_BOOKING_STATE');
});

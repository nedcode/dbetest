const {test,expect}=require('@playwright/test');
const {base,reset,login,api}=require('./helpers');
test.beforeEach(async({request})=>reset(request));
test('Security: anonymous client cannot create reservations',async({request})=>{
 const r=await request.post(`${base}/api/bookings`,{data:{journeyId:'R-101'}});
 expect(r.status()).toBe(401);expect((await r.json()).error).toBe('UNAUTHORIZED');
});
test('Security: travelers cannot view or pay for another user booking',async({request})=>{
 const alice=await login(request);const bob=await login(request,'bob@example.test');
 const id=(await (await api(request,alice,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 expect((await api(request,bob,'GET',`/bookings/${id}`)).status()).toBe(403);
 expect((await api(request,bob,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'})).status()).toBe(403);
 expect((await (await api(request,bob,'GET','/bookings')).json()).bookings).toHaveLength(0);
});
test('Security: support can audit bookings but cannot create/pay as traveler',async({request})=>{
 const alice=await login(request);const support=await login(request,'support@example.test');
 const id=(await (await api(request,alice,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 expect((await (await api(request,support,'GET','/bookings')).json()).bookings).toHaveLength(1);
 expect((await api(request,support,'POST','/bookings',{journeyId:'R-101'})).status()).toBe(403);
 expect((await api(request,support,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'})).status()).toBe(403);
});
test('Security: manipulated bearer token is rejected',async({request})=>{
 const token=await login(request);const bad=token.slice(0,-3)+'tam';
 const r=await api(request,bad,'GET','/bookings');expect(r.status()).toBe(401);
});
test('Security: direct internal payment endpoint is not exposed by gateway',async({request})=>{
 const r=await request.post(`${base}/api/charges`,{data:{bookingId:'X',amountCents:1,paymentMethod:'demo-approved'}});
 expect(r.status()).toBe(404);
});
test('Security: no notifications leak across traveler accounts',async({request})=>{
 const alice=await login(request);const bob=await login(request,'bob@example.test');
 const id=(await (await api(request,alice,'POST','/bookings',{journeyId:'R-101'})).json()).booking.id;
 await api(request,alice,'POST',`/bookings/${id}/pay`,{paymentMethod:'demo-approved'});
 expect((await (await api(request,bob,'GET','/notifications')).json()).messages).toHaveLength(0);
});

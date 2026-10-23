const crypto=require('node:crypto');
const {HttpError,json,readJson,identity,resetAuthorized,listener,call,internalHeaders}=require('../shared/common.cjs');
const port=43913;
const bookings=new Map();
function accessible(booking,user){if(booking.ownerId!==user.sub&&user.role!=='support')throw new HttpError(403,'FORBIDDEN');}
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{service:'bookings',status:'ok'});
  if(req.method==='GET'&&url.pathname==='/bookings'){
    const user=identity(req);
    return json(res,200,{bookings:[...bookings.values()].filter(b=>b.ownerId===user.sub||user.role==='support')});
  }
  if(req.method==='POST'&&url.pathname==='/bookings'){
    const user=identity(req);
    if(user.role!=='traveler')throw new HttpError(403,'ROLE_NOT_ALLOWED');
    const body=await readJson(req);
    if(!body||Object.keys(body).some(key=>key!=='journeyId')||typeof body.journeyId!=='string'||!body.journeyId)throw new HttpError(422,'INVALID_BOOKING');
    const {journey}=await call(43912,`/journeys/${encodeURIComponent(body.journeyId)}`);
    const id=crypto.randomUUID();
    await call(43912,'/holds',{method:'POST',headers:internalHeaders(),body:{journeyId:journey.id,bookingId:id}});
    const booking={id,ownerId:user.sub,journeyId:journey.id,route:`${journey.origin} → ${journey.destination}`,priceCents:journey.priceCents,status:'PENDING_PAYMENT',chargeId:null,ticketId:null};
    bookings.set(id,booking);
    return json(res,201,{booking});
  }
  const match=url.pathname.match(/^\/bookings\/([^/]+)(?:\/(pay|cancel))?$/);
  if(match){
    const [,id,action]=match;const user=identity(req);
    const booking=bookings.get(id);
    if(!booking)throw new HttpError(404,'BOOKING_NOT_FOUND');
    accessible(booking,user);
    if(req.method==='GET'&&!action)return json(res,200,{booking});
    if(req.method==='POST'&&action==='pay'){
      if(user.role!=='traveler')throw new HttpError(403,'ROLE_NOT_ALLOWED');
      const body=await readJson(req);
      if(!body||Object.keys(body).some(k=>k!=='paymentMethod')||!['demo-approved','demo-declined'].includes(body.paymentMethod))throw new HttpError(422,'INVALID_PAYMENT_METHOD');
      if(booking.status==='TICKET_ISSUED')return json(res,200,{booking}); // Idempotent retry.
      if(booking.status!=='PENDING_PAYMENT')throw new HttpError(409,'INVALID_BOOKING_STATE');
      const charge=await call(43914,'/charges',{method:'POST',headers:internalHeaders(),body:{bookingId:id,amountCents:booking.priceCents,paymentMethod:body.paymentMethod}});
      booking.chargeId=charge.chargeId;booking.status='TICKET_ISSUED';booking.ticketId=`TKT-${id}`;
      await call(43915,'/messages',{method:'POST',headers:internalHeaders(),body:{bookingId:id,ownerId:booking.ownerId,text:`Your demo ticket ${booking.ticketId} is ready.`}});
      return json(res,200,{booking});
    }
    if(req.method==='POST'&&action==='cancel'){
      if(user.role!=='traveler')throw new HttpError(403,'ROLE_NOT_ALLOWED');
      if(booking.status!=='PENDING_PAYMENT')throw new HttpError(409,'INVALID_BOOKING_STATE');
      booking.status='CANCELLED';
      await call(43912,`/holds/${id}`,{method:'DELETE',headers:internalHeaders()});
      return json(res,200,{booking});
    }
  }
  if(req.method==='POST'&&url.pathname==='/__test/reset'){
    resetAuthorized(req);bookings.clear();return json(res,200,{reset:true});
  }
  throw new HttpError(404,'NOT_FOUND');
},port);

const {HttpError,json,readJson,internal,resetAuthorized,listener}=require('../shared/common.cjs');
const port=43914;
const charges=new Map();
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{service:'payments',status:'ok'});
  if(req.method==='POST'&&url.pathname==='/charges'){
    internal(req);
    const data=await readJson(req);
    if(Object.keys(data).some(x=>/card|cvv|iban/i.test(x)))throw new HttpError(422,'REAL_PAYMENT_DATA_FORBIDDEN');
    const {bookingId,amountCents,paymentMethod}=data;
    if(!bookingId||!Number.isInteger(amountCents)||amountCents<=0||!['demo-approved','demo-declined'].includes(paymentMethod))throw new HttpError(422,'INVALID_CHARGE');
    if(charges.has(bookingId))return json(res,200,charges.get(bookingId));
    if(paymentMethod==='demo-declined')throw new HttpError(402,'PAYMENT_DECLINED');
    const charge={chargeId:`CHG-${bookingId}`,bookingId,amountCents,status:'APPROVED'};
    charges.set(bookingId,charge);return json(res,201,charge);
  }
  if(req.method==='GET'&&url.pathname==='/__test/charges'){
    resetAuthorized(req);return json(res,200,{charges:[...charges.values()]});
  }
  if(req.method==='POST'&&url.pathname==='/__test/reset'){
    resetAuthorized(req);charges.clear();return json(res,200,{reset:true});
  }
  throw new HttpError(404,'NOT_FOUND');
},port);

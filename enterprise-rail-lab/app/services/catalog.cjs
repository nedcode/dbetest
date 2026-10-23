const { HttpError,json,readJson,internal,resetAuthorized,listener }=require('../shared/common.cjs');
const port=43912;
const schedule=[
  {id:'R-101',origin:'Berlin',destination:'Hamburg',departure:'2026-11-12T09:30:00',priceCents:4900,totalSeats:2},
  {id:'R-202',origin:'Berlin',destination:'Leipzig',departure:'2026-11-12T11:00:00',priceCents:2900,totalSeats:3}
];
const holds=new Map();
const available=id=>schedule.find(j=>j.id===id).totalSeats-[...holds.values()].filter(x=>x===id).length;
const decorate=j=>({...j,availableSeats:available(j.id)});
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health') return json(res,200,{service:'catalog',status:'ok'});
  if(req.method==='GET'&&url.pathname==='/journeys') return json(res,200,{journeys:schedule.map(decorate)});
  if(req.method==='GET'&&/^\/journeys\/[^/]+$/.test(url.pathname)){
    const journey=schedule.find(j=>j.id===url.pathname.split('/')[2]);
    if(!journey) throw new HttpError(404,'JOURNEY_NOT_FOUND');
    return json(res,200,{journey:decorate(journey)});
  }
  if(req.method==='POST'&&url.pathname==='/holds'){
    internal(req);
    const {journeyId,bookingId}=await readJson(req);
    if(holds.has(bookingId)) return json(res,200,{holdId:bookingId,journeyId:holds.get(bookingId)});
    if(!schedule.some(x=>x.id===journeyId)) throw new HttpError(404,'JOURNEY_NOT_FOUND');
    if(available(journeyId)<=0) throw new HttpError(409,'SOLD_OUT');
    holds.set(bookingId,journeyId);
    return json(res,201,{holdId:bookingId,journeyId});
  }
  if(req.method==='DELETE'&&/^\/holds\/[^/]+$/.test(url.pathname)){
    internal(req);holds.delete(url.pathname.split('/')[2]);return json(res,200,{released:true});
  }
  if(req.method==='POST'&&url.pathname==='/__test/reset'){
    resetAuthorized(req);holds.clear();return json(res,200,{reset:true});
  }
  throw new HttpError(404,'NOT_FOUND');
},port);

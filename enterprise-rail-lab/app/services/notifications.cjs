const {HttpError,json,readJson,identity,internal,resetAuthorized,listener}=require('../shared/common.cjs');
const port=43915;
const messages=[];
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health')return json(res,200,{service:'notifications',status:'ok'});
  if(req.method==='POST'&&url.pathname==='/messages'){
    internal(req);
    const {bookingId,ownerId,text}=await readJson(req);
    if(!bookingId||!ownerId||!text)throw new HttpError(422,'INVALID_NOTIFICATION');
    if(!messages.some(m=>m.bookingId===bookingId))messages.push({id:`MSG-${bookingId}`,bookingId,ownerId,text});
    return json(res,201,{ok:true});
  }
  if(req.method==='GET'&&url.pathname==='/messages'){
    const user=identity(req);
    return json(res,200,{messages:messages.filter(m=>m.ownerId===user.sub||user.role==='support')});
  }
  if(req.method==='POST'&&url.pathname==='/__test/reset'){
    resetAuthorized(req);messages.length=0;return json(res,200,{reset:true});
  }
  throw new HttpError(404,'NOT_FOUND');
},port);

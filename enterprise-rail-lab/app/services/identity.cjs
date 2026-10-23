const { HttpError, json, readJson, sign, identity, listener } = require('../shared/common.cjs');
const port=43911;
const users={
  'alice@example.test': { id:'alice', role:'traveler', password:'demo-pass', displayName:'Alice Demo' },
  'bob@example.test': { id:'bob', role:'traveler', password:'demo-pass', displayName:'Bob Demo' },
  'support@example.test': { id:'support', role:'support', password:'demo-pass', displayName:'Sam Support' }
};
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health') return json(res,200,{service:'identity',status:'ok'});
  if(req.method==='POST'&&url.pathname==='/auth/login'){
    const {email,password}=await readJson(req);
    const user=users[email];
    if(!user||user.password!==password) throw new HttpError(401,'INVALID_CREDENTIALS');
    return json(res,200,{ token:sign({sub:user.id,role:user.role,exp:Date.now()+3600000}), user:{id:user.id,role:user.role,displayName:user.displayName} });
  }
  if(req.method==='GET'&&url.pathname==='/auth/me') return json(res,200,{user:identity(req)});
  throw new HttpError(404,'NOT_FOUND');
},port);

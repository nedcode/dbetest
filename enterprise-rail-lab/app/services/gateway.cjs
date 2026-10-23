const fs=require('node:fs/promises');
const path=require('node:path');
const {HttpError,json,resetAuthorized,listener,call}=require('../shared/common.cjs');
const port=43910;
const web=path.resolve(__dirname,'../web');
const route=(p)=>{
  if(p.startsWith('/api/auth/'))return [43911,p.slice(4)];
  if(p.startsWith('/api/journeys'))return [43912,p.slice(4)];
  if(p.startsWith('/api/bookings'))return [43913,p.slice(4)];
  if(p.startsWith('/api/notifications'))return [43915,p.replace('/api/notifications','/messages')];
  return null;
};
listener(async(req,res,url)=>{
  if(req.method==='GET'&&url.pathname==='/health'){
    const results=await Promise.all([43911,43912,43913,43914,43915].map(p=>call(p,'/health')));
    return json(res,200,{service:'gateway',status:'ok',dependencies:results.length});
  }
  if(url.pathname==='/__test/reset'&&req.method==='POST'){
    resetAuthorized(req);
    for(const p of [43913,43912,43914,43915])await call(p,'/__test/reset',{method:'POST',headers:{'x-lab-reset':'fixture-only-reset-key'}});
    return json(res,200,{reset:true});
  }
  if(url.pathname==='/__test/charges'&&req.method==='GET'){
    resetAuthorized(req);return json(res,200,await call(43914,'/__test/charges',{headers:{'x-lab-reset':'fixture-only-reset-key'}}));
  }
  if(url.pathname.startsWith('/api/')){
    const target=route(url.pathname);if(!target)throw new HttpError(404,'NOT_FOUND');
    const upstreamHeaders={};
    if(req.headers.authorization)upstreamHeaders.authorization=req.headers.authorization;
    if(req.headers['content-type'])upstreamHeaders['content-type']=req.headers['content-type'];
    const chunks=[];for await(const ch of req)chunks.push(ch);
    let response;
    try{response=await fetch(`http://127.0.0.1:${target[0]}${target[1]}${url.search}`,{method:req.method,headers:upstreamHeaders,body:chunks.length?Buffer.concat(chunks):undefined,signal:AbortSignal.timeout(5000)});}
    catch{throw new HttpError(503,'DEPENDENCY_UNAVAILABLE');}
    const bytes=Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status,{'content-type':response.headers.get('content-type')||'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});
    return res.end(bytes);
  }
  if(req.method==='GET'&&['/','/index.html','/app.js','/styles.css'].includes(url.pathname)){
    const file=url.pathname==='/'?'/index.html':url.pathname;
    const contents=await fs.readFile(path.join(web,file));
    res.writeHead(200,{'content-type':file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8','x-content-type-options':'nosniff','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; base-uri 'none'; object-src 'none'; form-action 'self'"});
    return res.end(contents);
  }
  throw new HttpError(404,'NOT_FOUND');
},port);

const { expect }=require('@playwright/test');
const base='http://127.0.0.1:43910';
async function reset(request){const r=await request.post(`${base}/__test/reset`,{headers:{'x-lab-reset':'fixture-only-reset-key'}});expect(r.ok()).toBeTruthy();}
async function login(request,email='alice@example.test',password='demo-pass'){
 const r=await request.post(`${base}/api/auth/login`,{data:{email,password}});
 expect(r.status()).toBe(200);
 return (await r.json()).token;
}
async function api(request,token,method,path,data){
 return request.fetch(`${base}/api${path}`,{method,headers:{authorization:`Bearer ${token}`},...(data!==undefined?{data}:{})});
}
module.exports={base,reset,login,api};

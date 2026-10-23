'use strict';
const { fork }=require('node:child_process');
const path=require('node:path');
const crypto=require('node:crypto');
// Generated per process group: no signing key is stored in source control.
const env={...process.env,LAB_SIGNING_KEY:crypto.randomBytes(32).toString('hex'),LAB_INTERNAL_KEY:crypto.randomBytes(32).toString('hex'),LAB_TEST_MODE:'1'};
const services=['identity','catalog','payments','notifications','bookings','gateway'];
const children=services.map(name=>fork(path.join(__dirname,'services',name+'.cjs'),[],{env,stdio:'inherit'}));
let shuttingDown=false;
function stop(){if(shuttingDown)return;shuttingDown=true;for(const child of children)child.kill('SIGTERM');setTimeout(()=>process.exit(0),150).unref();}
for(const c of children)c.on('exit',(code,signal)=>{if(!shuttingDown){console.error(`Service ${c.pid} exited unexpectedly: ${code||signal}`);stop();process.exitCode=1;}});
process.on('SIGINT',stop);process.on('SIGTERM',stop);

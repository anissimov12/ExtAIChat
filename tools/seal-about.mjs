#!/usr/bin/env node

/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

import {webcrypto as w} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const appPath=process.argv[2]||'js/app.js';
const infoPath=process.argv[3]||path.join(here,'about.json');
const keyPath=path.join(here,'about.key.json');
const S=w.subtle, alg={name:'ECDSA',namedCurve:'P-256'}, sg={name:'ECDSA',hash:'SHA-256'};

const info=JSON.parse(fs.readFileSync(infoPath,'utf8'));
if(!info.n)throw new Error('about.json needs at least "n" (developer name)');
const payload=Buffer.from(JSON.stringify({n:info.n,r:info.r,t:info.t,y:info.y,l:info.l||[]}),'utf8');

let priv,pubRaw;
if(fs.existsSync(keyPath)){
  const j=JSON.parse(fs.readFileSync(keyPath,'utf8'));
  priv=await S.importKey('jwk',j.priv,alg,false,['sign']);
  pubRaw=Buffer.from(j.pub,'base64');
}else{
  const kp=await S.generateKey(alg,true,['sign','verify']);
  pubRaw=Buffer.from(await S.exportKey('raw',kp.publicKey));
  fs.writeFileSync(keyPath,JSON.stringify({priv:await S.exportKey('jwk',kp.privateKey),pub:pubRaw.toString('base64')}),{mode:0o600});
  priv=kp.privateKey;
  console.log('Created private key:',keyPath,'(keep it secret)');
}
const sig=Buffer.from(await S.sign(sg,priv,payload));
const masked=Buffer.from(payload.map((b,i)=>b^pubRaw[i%pubRaw.length]));

const pub=await S.importKey('raw',pubRaw,alg,false,['verify']);
if(!await S.verify(sg,pub,sig,payload))throw new Error('self-check failed');

const lit=`/*ABOUT:BEGIN*/{k:'${pubRaw.toString('base64')}',s:'${sig.toString('base64')}',d:'${masked.toString('base64')}'}/*ABOUT:END*/`;
const src=fs.readFileSync(appPath,'utf8');
if(!/\/\*ABOUT:BEGIN\*\/[\s\S]*?\/\*ABOUT:END\*\//.test(src))throw new Error('ABOUT markers not found in '+appPath);
fs.writeFileSync(appPath,src.replace(/\/\*ABOUT:BEGIN\*\/[\s\S]*?\/\*ABOUT:END\*\//,()=>lit));
const fp=Buffer.from(await S.digest('SHA-256',pubRaw)).subarray(0,8).toString('hex').toUpperCase().replace(/(.{4})(?=.)/g,'$1-');
console.log('Sealed into',appPath,'\nKey fingerprint (publish it somewhere outside the app, e.g. README):',fp);

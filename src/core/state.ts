/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/state.ts - App state (S, chats, cur...) and persistence helpers */
var S={providers:[],pid:'',model:'',sys:'',temp:0.7,topk:'',topp:'',max:'',think:'none'},chats=[],cur='',busy=false,ctl=null,tab='sys',sel=0,P={items:[],msg:''},TI=[],draft='';
function ld(k,d){try{var v=VAULT.get(k);return v?JSON.parse(v):d}catch(e){return d}}
var svWarn=0,ABOK=null;
function sv(k,v){try{VAULT.set(k,JSON.stringify(v))}catch(e){if(!svWarn){svWarn=1;L('err','browser storage is full - history or images may not persist')}}}
Object.assign(S,ld('aichat:cfg',{}));chats=ld('aichat:chats',[]);cur=ld('aichat:cur','');
function saveC(){sv('aichat:cfg',S)}
function listed(){return chats.filter(function(c){return c.msgs&&c.msgs.length})}
function saveH(){sv('aichat:chats',listed().slice(0,100));sv('aichat:cur',cur)}
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function apiOf(p){return p&&EP[p.api]?p.api:'chat'}
function prov(id){id=id||S.pid;return S.providers.filter(function(p){return p.id===id})[0]}
function chat(){return chats.filter(function(c){return c.id===cur})[0]}

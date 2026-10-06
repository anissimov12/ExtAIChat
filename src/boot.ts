/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* boot.ts - start-up */
if(S.newchat!==false){chats.unshift({id:'c'+Date.now(),title:'New chat',ts:Date.now(),msgs:[]});cur=chats[0].id}
else if(!chat())cur=chats[0]?chats[0].id:'';
grow();
renderList();render();drawTok();setBusy(false);
refreshAllCaps();
VAULT.onErr=function(er){L('err','encrypted save failed: '+(er&&er.message||er))};
/* build integrity: the signed developer block must verify and the /about command must still exist */
aboutCheck().then(function(r){
  ABOK=!(r.ok===false||!CMD.some(function(c){return c[0]==='about'}));
  if(!ABOK)L('err','integrity check failed: this build was modified');
});

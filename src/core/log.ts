/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/log.ts - Log panel writer L() */
var lgb=$('lgb');
function L(k,m){
  if(k==='cfg')return; /* config noise stays out of the log */
  var d=document.createElement('div');d.className=k;
  d.innerHTML='<i>'+new Date().toTimeString().slice(0,8)+'</i><u>'+k+'</u>'+esc(m);
  lgb.appendChild(d);while(lgb.children.length>400)lgb.firstChild.remove();lgb.scrollTop=lgb.scrollHeight;
}

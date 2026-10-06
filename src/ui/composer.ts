/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/composer.ts - Busy state of the send button, textarea auto-grow */
function setBusy(b){
  busy=b;
  send.innerHTML=ic(b?'stop':'send',15);
  send.title=b?'Stop (Esc)':'Send';
  send.setAttribute('aria-label',b?'Stop':'Send');
  drawStatus();
  updSend();
}
/* the input drives the row height: the paperclip, the field and Send stay exactly the same size */
function grow(){
  inp.style.height='auto';
  var h=Math.max(28,Math.min(inp.scrollHeight,120));
  inp.style.height=h+'px';
  updSend();
}

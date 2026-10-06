/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/tokens.ts - Token counters */
/* token counters = totals of the open chat: every assistant message keeps its own usage (m.tok),
   the total is re-summed from the messages that still exist, so edits/regenerations/clears are picked up */
function num(n){return n>=1000?(n/1000).toFixed(n>=10000?0:1)+'k':''+n}
var LIVE=null;
function tokSum(){
  var c=chat(),T={i:0,o:0,est:0};if(!c)return T;
  c.msgs.forEach(function(m){if(m.tok){T.i+=m.tok.i||0;T.o+=m.tok.o||0;if(!m.tok.ri||!m.tok.ro)T.est=1}});
  if(LIVE&&LIVE.cid===c.id){T.i+=LIVE.i;T.o+=LIVE.o;if(!LIVE.ri||!LIVE.ro)T.est=1}
  return T;
}
function drawTok(){
  var e=$('tkv'),T=tokSum(),q=T.est?'':'',x=T.est?' (partly estimated)':'';
  e.innerHTML='<b class="in'+(T.i?'':' off')+'" title="'+T.i+' tokens sent in this chat'+x+'">↑'+q+num(T.i)+'</b>'+
              '<b class="out'+(T.o?'':' off')+'" title="'+T.o+' tokens received in this chat'+x+'">↓'+q+num(T.o)+'</b>';
  e.setAttribute('title',T.i+' sent · '+T.o+' received (this chat)');
}
var tokR=0;
function tokPaint(){if(tokR)return;tokR=requestAnimationFrame(function(){tokR=0;drawTok()})}
function estIn(body){
  var j=JSON.stringify(body),im=(j.match(/data:image\//g)||[]).length;
  return Math.ceil(j.replace(/data:[^"]{100,}"/g,'"').length/3.6)+im*800;
}

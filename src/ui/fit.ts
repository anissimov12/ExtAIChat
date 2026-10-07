/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/fit.ts - Keep panels inside the viewport on resize / rotate */
applyUI();

/* keep panels inside the current viewport on resize / rotate */
var rzT=0,lastNarrow=isNarrow();
function fitUI(){
  var nw=isNarrow(),sh=innerHeight<=460;
  if(UI.sbo)clampSb();
  if(sh&&UI.lgo)UI.lgo=false;
  else if(UI.lgo)clampLg();
  if(nw!==lastNarrow){UI.sbo=!nw;if(UI.sbo)clampSb()}
  lastNarrow=nw;
  applyUI();saveU();
}
addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(fitUI,120)});
addEventListener('orientationchange',function(){clearTimeout(rzT);rzT=setTimeout(fitUI,260)});
var fhT=0;
function updFH(){document.documentElement.style.setProperty('--f-h',Math.round($('f').offsetHeight)+'px')}
if(typeof ResizeObserver!=='undefined'){
  new ResizeObserver(function(){cancelAnimationFrame(fhT);fhT=requestAnimationFrame(updFH)}).observe($('f'));
}
updFH();

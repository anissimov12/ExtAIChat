/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/idle.ts - idle animation: when no user activity (no typing, no mouse), the
   background dims and a starfield fades in (staggered per-star twinkle, slow
   drift, occasional meteors). Any input wakes it up with a fast smooth fade-out. */
/* MARK: setup */
var IDLE_MS=2000,idleT=null;
var starBox=document.createElement('div');starBox.id='stars';starBox.setAttribute('aria-hidden','true');
var idleDim=document.createElement('div');idleDim.id='idleDim';idleDim.setAttribute('aria-hidden','true');
/* both layers live inside #mn, behind the message content (z-index 0), and are
   clipped to the visible messages region: from below the header down to the
   composer/logs. Measured via offsetTop/offsetHeight (layout px - immune to the
   root zoom), NOT getBoundingClientRect (which returns zoomed visual px) */
var mn=$('mn');mn.insertBefore(idleDim,mn.firstChild);mn.insertBefore(starBox,idleDim.nextSibling);
function fitIdle(){
  var hd=document.querySelector('#mn header'),ms=$('msgs');
  var hh=hd?hd.offsetHeight:0;
  idleDim.style.top=starBox.style.top=hh+'px';
  idleDim.style.height=starBox.style.height=Math.max(0,ms.offsetHeight-hh)+'px';
}
if(window.ResizeObserver){
  var ro=new ResizeObserver(fitIdle);
  ro.observe($('msgs'));ro.observe(mn);
  var hd=document.querySelector('#mn header');if(hd)ro.observe(hd);
}else addEventListener('resize',fitIdle);
fitIdle();
/* generate the starfield once: ~90 stars + 3 meteors, all randomized via CSS vars:
   --o peak opacity, --d stagger delay, --t twinkle period, --a twinkle phase, --c tint */
(function(){
  var n=999,f=document.createDocumentFragment();
  for(var i=0;i<n;i++){
    var s=document.createElement('i');
    var sz=Math.random()<.85?(Math.random()*.9+.6):(Math.random()*1.2+1.8);
    s.style.left=(Math.random()*100).toFixed(2)+'%';
    s.style.top=(Math.random()*100).toFixed(2)+'%';
    s.style.width=sz.toFixed(2)+'px';s.style.height=sz.toFixed(2)+'px';
    s.style.setProperty('--o',(0.45+Math.random()*0.55).toFixed(2));
    s.style.setProperty('--d',(Math.random()*3.5).toFixed(2)+'s');
    s.style.setProperty('--t',(1.8+Math.random()*4.2).toFixed(2)+'s');
    s.style.setProperty('--a',(-Math.random()*6).toFixed(2)+'s');
    if(Math.random()<.25)s.style.setProperty('--c',Math.random()<.5?'#cfe0ff':'#ffe9c9');
    if(sz>1.6)s.className='big';
    f.appendChild(s);
  }
  for(var j=0;j<3;j++){
    var m=document.createElement('u');m.className='met';
    m.style.setProperty('--md',(9+j*9+Math.random()*6).toFixed(1)+'s');
    m.style.top=(Math.random()*55).toFixed(1)+'%';
    m.style.left=(15+Math.random()*70).toFixed(1)+'%';
    f.appendChild(m);
  }
  starBox.appendChild(f);
})();
/* MARK: idle state */
function setIdle(on){document.body.classList.toggle('idle',on)}
function idleEnter(){
  /* don't dim while a response is streaming */
  if(typeof busy!=='undefined'&&busy){idleT=setTimeout(idleEnter,5000);return}
  setIdle(true);
}
function idleKick(){setIdle(false);clearTimeout(idleT);idleT=setTimeout(idleEnter,IDLE_MS)}
['pointermove','pointerdown','keydown','wheel','touchstart','input','focus'].forEach(function(ev){
  addEventListener(ev,idleKick,{capture:true,passive:true});
});
addEventListener('scroll',idleKick,{capture:true,passive:true});
idleKick();
/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/layout.ts - Sidebar / log panel layout, resizing, sidebar tabs */
/* MARK: panels */
function updSend(){send.disabled=!(busy||inp.value.trim()!==''||AT.length>0)}
var UI=Object.assign({sbw:210,sbo:null,lgh:150,lgo:null,tab:'chats'},ld('aichat:ui',{}));
function isWide(){return innerWidth>=1000}
function isNarrow(){return innerWidth<=760}
var wide=isWide();
if(UI.sbo===null)UI.sbo=wide;
if(UI.lgo===null)UI.lgo=wide&&matchMedia('(min-height:640px)').matches;
if(UI.tab!=='system')UI.tab='chats';
if(isNarrow()&&UI.sbo)UI.sbo=false;
function clampSb(){
  var mx=Math.min(520,innerWidth*(isNarrow()?.78:.7));
  UI.sbw=Math.round(Math.min(Math.max(UI.sbw,140),Math.max(140,mx)));
}
function clampLg(){
  var mx=Math.max(80,$('mn').clientHeight*.6);
  UI.lgh=Math.round(Math.min(Math.max(UI.lgh,80),mx));
}
function saveU(){sv('aichat:ui',UI)}
function setTab(t){
  UI.tab=t==='system'?'system':'chats';
  $('tb').querySelectorAll('.ti').forEach(function(b){
    var on=b.dataset.tab===UI.tab;
    b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false');
  });
  $('tpC').classList.toggle('on',UI.tab==='chats');
  $('tpS').classList.toggle('on',UI.tab==='system');
  saveU();
}
function applyUI(){
  $('sb').style.width=UI.sbo?UI.sbw+'px':'0';$('sb').classList.toggle('off',!UI.sbo);
  $('lg').style.height=UI.lgo?UI.lgh+'px':'0';$('lg').classList.toggle('off',!UI.lgo);
  document.documentElement.style.setProperty('--lg-cut',UI.lgo?UI.lgh+'px':'0px');
  document.body.classList.toggle('sbo',!!UI.sbo);document.body.classList.toggle('lgo',!!UI.lgo);
  setTab(UI.tab);
}
function setSb(w){var mx=Math.min(520,innerWidth*(isNarrow()?.78:.7));if(w<80)UI.sbo=false;else{UI.sbo=true;UI.sbw=Math.round(Math.min(Math.max(w,140),Math.max(140,mx)))}applyUI();saveU()}
function setLg(h){var mx=$('mn').clientHeight*0.6;if(h<50)UI.lgo=false;else{UI.lgo=true;UI.lgh=Math.round(Math.min(Math.max(h,80),mx))}applyUI();saveU()}
function toggle(k){
  if(k==='v'){UI.sbo=!UI.sbo;if(UI.sbw<140)UI.sbw=210}
  else{UI.lgo=!UI.lgo;if(UI.lgh<80)UI.lgh=150}
  applyUI();saveU();
}
function drag(h,k){
  h.addEventListener('pointerdown',function(e){
    e.preventDefault();h.setPointerCapture(e.pointerId);
    var x0=e.clientX,y0=e.clientY,moved=false;
    h.classList.add('act');document.body.classList.add('drag',k);
    function mv(ev){
      if(!moved&&Math.abs(ev.clientX-x0)+Math.abs(ev.clientY-y0)<4)return;
      moved=true;
      if(k==='v')setSb(ev.clientX-$('sb').getBoundingClientRect().left);
      else setLg($('lg').getBoundingClientRect().bottom-ev.clientY);
    }
    function up(){
      h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);
      h.classList.remove('act');document.body.classList.remove('drag',k);
      if(moved)saveU();else toggle(k);
    }
    h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);
  });
  h.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle(k)}});
}
/* version badge: tiny v{APPVER} in the bottom-right corner of the app */
(function(){
  var v=document.createElement('div');
  v.id='ver';v.textContent='v'+APPVER;v.title='ExtChat version';
  document.getElementById('app').appendChild(v);
})();

drag($('rsb'),'v');drag($('rlg'),'h');
/* sidebar tabs: chats | system (left panel) */
$('tb').addEventListener('click',function(e){
  var b=e.target.closest('.ti');if(!b)return;
  setTab(b.dataset.tab);L('cfg','sidebar tab: '+UI.tab);
});

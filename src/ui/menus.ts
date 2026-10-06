/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/menus.ts - Thinking menu and model menu */
/* thinking menu - same behaviour as the model menu */
var tsel=0;
function closeThink(){$('tm').classList.remove('on')}
function drawThink(){
  $('tm').innerHTML='<div class="th" title="'+esc(thinkInfo().note)+'">Thinking Effort</div>'+rows(TI,tsel);
  var a=$('tm').querySelector('.on');if(a)a.scrollIntoView({block:'nearest'});
}
$('bt').onclick=function(){
  var tm=$('tm');
  if(tm.classList.contains('on')){closeThink();return}
  closeModelMenu();ensureCaps();
  var b=thinkItems('');TI=b.items;tsel=typeof b.sel==='number'&&b.sel>0?b.sel:0;
  drawThink();tm.classList.add('on');
};
$('tm').addEventListener('click',function(e){
  var r=e.target.closest('.pi');if(!r)return;
  e.preventDefault();e.stopPropagation();
  var d=inp.value;TI[+r.dataset.i].act();inp.value=d;grow();showPal();
});
document.addEventListener('keydown',function(e){
  var tm=$('tm');
  if(!tm.classList.contains('on'))return;
  if(e.target.closest('#mmq')||e.target.tagName==='TEXTAREA')return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();e.stopPropagation();
    if(TI.length)tsel=(tsel+(e.key==='ArrowDown'?1:TI.length-1))%TI.length;
    drawThink();
  }else if(e.key==='Enter'&&TI[tsel]){e.preventDefault();e.stopPropagation();TI[tsel].act()}
});
/* model menu - the searchable panel, same look as the thinking menu */
var MI=[],msel=0,mmenuHook=null,mmSetQ=null;
/* the panel stays open while the pointer is on the button or inside the panel */
function modelMenu(focus){
  var tm=$('mm');
  if(tm.classList.contains('on')){if(focus&&$('mmq'))$('mmq').focus();return}
  closeThink();
  tm.classList.add('on');
  tm.innerHTML='<div class="th"><input id="mmq" placeholder="Search models…" aria-label="Search models" autocomplete="off" spellcheck="false"></div><div class="mfl" id="mml"></div>';
  var q=$('mmq'),box=$('mml');
  function sel(){msel=Math.min(msel,MI.length-1);if(msel<0)msel=0;
    box.innerHTML=rows(MI,msel);
    var a=box.querySelector('.on');if(a)a.scrollIntoView({block:'nearest'});
  }
  function upd(){
    var v=q.value.trim(),b=modelItems(v);
    MI=b.items;msel=typeof b.sel==='number'&&b.sel>0?b.sel:0;sel();
  }
  mmenuHook=upd;
  mmSetQ=function(v){q.value=v;upd()};
  q.addEventListener('input',upd);
  q.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();if(MI.length)msel=(msel+(e.key==='ArrowDown'?1:MI.length-1))%MI.length;sel();return}
    if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(MI[msel])MI[msel].act();return}
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeModelMenu();$('bm').focus()}
  });
  box.addEventListener('click',function(e){
    var r=e.target.closest('.pi');if(!r)return;
    e.preventDefault();e.stopPropagation();
    var it=MI[+r.dataset.i];if(!it)return;
    it.act();closeModelMenu();
  });
  upd();
  if(focus)q.focus();
}
function closeModelMenu(){$('mm').classList.remove('on');mmenuHook=null;mmSetQ=null}
/* the mouse only highlights the row under it; a menu closes on Esc, an outside click or a pick */
function fpMouse(panel){
  panel.addEventListener('mousemove',function(e){
    var r=e.target.closest('.pi');
    panel.querySelectorAll('.pi.hover').forEach(function(x){x.classList.remove('hover')});
    if(r&&!r.classList.contains('on'))r.classList.add('hover');
  });
  panel.addEventListener('mouseleave',function(){panel.querySelectorAll('.pi.hover').forEach(function(x){x.classList.remove('hover')})});
}
fpMouse($('mm'));
fpMouse($('tm'));

/* model chip: click opens (or closes) the menu and puts the cursor in the search field */
$('bm').onclick=function(e){e.stopPropagation();if($('mm').classList.contains('on'))closeModelMenu();else modelMenu(true)};
$('bs').onclick=function(){openSettings()};
$('mb').onclick=function(){if(!busy)toggle('v')};

/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/header.ts - Header status line and in-place chat title rename */
function drawStatus(){
  var p=prov(),t=thinkNow();
  drawTitle();
  $('bm').textContent=p&&S.model?p.name+' • '+S.model:'Select model';
  $('bm').classList.toggle('on',!!(p&&S.model));
  $('st').innerHTML=busy?'<b></b>generating… Esc to stop':'';
  $('bt').textContent='Thinking: '+(t==='none'?'none':t);
  $('bt').classList.toggle('on',t!=='none');$('bt').title='Thinking: '+t;
  ensureCaps();
}
/* the chat title lives in the middle of the header and is renamed in place */
function ctTitle(){var c=chat();return c&&c.title?c.title:'New chat'}
function drawTitle(){$('ct').textContent=ctTitle()}
function renameChat(v){
  var c=chat();if(!c)return;
  v=String(v||'').replace(/\s+/g,' ').trim().slice(0,80);
  if(v&&v!=='New chat'){c.title=v;saveH();renderList()}
  drawTitle();
}
$('ct').onclick=function(){
  var b=this;if($('cti'))return;
  var c=chat();if(!c)return;
  var i=document.createElement('input');
  i.className='cti';i.value=ctTitle();i.maxLength=80;i.setAttribute('aria-label','Chat title');
  b.parentNode.insertBefore(i,b);b.style.display='none';
  i.focus();i.select();
  function done(ok){if(!i.parentNode)return;i.remove();b.style.display='';if(ok)renameChat(i.value);else drawTitle()}
  i.addEventListener('keydown',function(e){
    e.stopPropagation();
    if(e.key==='Enter'){e.preventDefault();done(true)}
    else if(e.key==='Escape'){e.preventDefault();done(false)}
  });
  i.addEventListener('blur',function(){done(true)});
};

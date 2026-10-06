/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/chat-actions.ts - Send / copy / edit / regenerate, Esc handling */
function post(t){
  var c=chat()||newChat();
  var att=AT.slice();
  c.msgs.push({role:'user',content:t,att:att});c.ts=Date.now();saveH();
  AT=[];drawAtt();
  render(true);renderList();gen();
}
function copy(t,btn){
  function done(){var o=btn.innerHTML;btn.innerHTML=ic('ok');btn.title='Copied';setTimeout(function(){btn.innerHTML=o;btn.title='Copy'},1200)}
  function fb(){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done()}catch(e){}a.remove()}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fb);else fb();
}
function saveEdit(w){
  var c=chat(),i=+w.dataset.i,v=w.querySelector('textarea').value.trim();
  if(!v||busy)return;
  c.msgs[i].content=v;c.msgs.length=i+1;saveH();render();L('chat','edit message '+(i+1));gen();
}
ms.addEventListener('click',function(e){
  var t=e.target.closest('button[data-a]');if(!t)return;
  var a=t.dataset.a,w=t.closest('.w'),i=+w.dataset.i,c=chat(),m=c&&c.msgs[i];
  if(a==='cp'&&m)return copy(m.content,t);
  if(busy)return;
  if(a==='re'&&m){c.msgs.length=m.role==='user'?i+1:i;saveH();render();L('chat','regenerate from message '+(i+1));gen()}
  if(a==='ed'&&m){
    w.className='w u ing';w.innerHTML='<textarea rows="3"></textarea><div class="ac">'+btnA('sv','ok','Save & regenerate (Enter)')+btnA('cx','x','Cancel (Esc)')+'</div>';
    var ta=w.querySelector('textarea');ta.value=m.content;ta.focus();
  }
  if(a==='sv')saveEdit(w);
  if(a==='cx')render();
});
ms.addEventListener('keydown',function(e){
  if(e.target.tagName!=='TEXTAREA')return;
  if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();saveEdit(e.target.closest('.w'))}
  else if(e.key==='Escape'){e.stopPropagation();render()}
});
document.addEventListener('keydown',function(e){
  if(e.key!=='Escape'||document.querySelector('dialog[open]'))return;
  if($('tm').classList.contains('on')){$('tm').classList.remove('on');return}
  if($('mm').classList.contains('on')){closeModelMenu();return}
  if(busy&&ctl){e.preventDefault();ctl.abort()}
});
document.addEventListener('click',function(e){
  if(!e.target.closest('#tm')&&!e.target.closest('#bt'))$('tm').classList.remove('on');
  if(!e.target.closest('#mm')&&!e.target.closest('#bm'))closeModelMenu();
});
document.addEventListener('pointerdown',function(e){
  if(!isNarrow())return;
  if(UI.sbo&&!e.target.closest('#sb')&&!e.target.closest('#mb')){UI.sbo=false;applyUI();saveU()}
});

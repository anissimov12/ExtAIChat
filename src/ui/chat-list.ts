/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/chat-list.ts - Sidebar chat list actions */
/* MARK: chats */
$('cl').addEventListener('click',function(e){
  var t=e.target.closest('button[data-a]');if(!t||busy)return;
  var id=t.closest('.ci').dataset.id;
  if(t.dataset.a==='open'){hidePal();cur=id;saveH();renderList();render(false,true);if(!isWide()){UI.sbo=false;applyUI()}}
  if(t.dataset.a==='del'){
    chats=chats.filter(function(c){return c.id!==id});
    if(cur===id)cur=chats[0]?chats[0].id:'';
    saveH();renderList();render(false,true);
  }
});
$('nc').onclick=function(){if(!busy)newChat()};
$('lc').onclick=function(){lgb.textContent=''};

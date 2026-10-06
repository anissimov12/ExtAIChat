/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/palette.ts - Slash-command palette, model/thinking items, submit */
/* MARK: palette */
function rows(items,s){return items.map(function(it,i){return '<div class="pi'+(i===s?' on':'')+'" data-i="'+i+'">'+it.html+'</div>'}).join('')}
function hidePal(){P.items=[];$('pal').classList.remove('on')}
function done(){inp.value=draft;draft='';grow();hidePal();$('tm').classList.remove('on');closeModelMenu();inp.focus()}
function cmdItems(v){
  var n=v.length-1;
  return {sel:0,items:CMD.filter(function(c){return c[0].indexOf(v.slice(1).toLowerCase())===0}).map(function(c){
    return {name:c[0],html:'<b><em>/'+c[0].slice(0,n)+'</em>'+c[0].slice(n)+'</b><span>'+c[1]+'</span>',act:function(){run(c[0])}};
  })};
}
function modelItems(q){
  var ql=q.toLowerCase(),ap=prov()||S.providers[0],items=[],cs=-1,exact=false,pq='';
  if(!ap)return {sel:0,items:[{html:'<b class="t">Add a provider in Settings</b>',act:function(){done();openSettings('prov')}}]};
  items.push({html:'<b class="t">↻ Refresh list</b><span class="h">'+esc(P.msg||ap.name)+'</span>',act:async function(){
    P.msg='loading…';showPal(true);if(mmenuHook)mmenuHook();
    try{P.msg=(await loadModels(ap))+' models'}catch(e){L('err',e.message);P.msg='error: '+(e instanceof TypeError?'no connection / CORS':e.message)}
    showPal(true);if(mmenuHook)mmenuHook();
  }});
  S.providers.forEach(function(p){
    var pn=(p.name||'').toLowerCase();
    /* the query is matched against model names *and* provider names/urls */
    var pmatch=!!(ql&&(pn.indexOf(ql)>-1||(p.url||'').toLowerCase().indexOf(ql)>-1)),sub=[];
    (p.models||[]).forEach(function(m){
      if(m===q)exact=true;
      if(ql&&m.toLowerCase().indexOf(ql)<0&&!pmatch)return;
      var on=S.pid===p.id&&S.model===m;
      sub.push({sel:on,html:'<span class="ck">'+(on?'✓':'')+'</span><b class="t">'+esc(m)+'</b><span class="h">'+esc(p.name)+'</span>',act:function(){S.pid=p.id;S.model=m;saveC();drawStatus();L('cfg','model: '+m);done()}});
    });
    if(pmatch&&sub.length){pq=p.name;sub.unshift({html:'<span class="ck">◈</span><b class="t">'+esc(p.name)+'</b><span class="h">provider · '+sub.length+' models</span>',act:function(){if(mmSetQ){mmSetQ(p.name);return}done()}})}
    items=items.concat(sub);
  });
  items.forEach(function(it,i){if(it.sel)cs=i});
  if(ql&&items.length===1)items.push({html:'<b class="t">No models match “'+esc(q)+'”</b>',act:function(){}});
  if(q&&!exact&&!pq)items.push({html:'<span class="ck"></span><b class="t">+ Use "'+esc(q)+'"</b><span class="h">custom · '+esc(ap.name)+'</span>',act:function(){S.pid=ap.id;S.model=q;saveC();drawStatus();L('cfg','custom model: '+q);done()}});
  return {items:items,sel:cs>-1?cs:(q?Math.min(1,items.length-1):0)};
}
/* any effort id the provider accepts can be added; it is remembered for this model only */
function addCustomEffort(v){
  v=String(v||'').trim().toLowerCase().replace(/\s+/g,'-').slice(0,24);
  var p=prov();if(!v||!p||!S.model||v==='none')return;
  var key=customKey(p,S.model),l=S.tcust[key]||(S.tcust[key]=[]);
  if(thinkLevels().indexOf(v)<0)l.push(v);
  S.think=v;saveC();drawStatus();L('cfg','custom thinking: '+v);
}
function thinkItems(q){
  var info=thinkInfo(),lv=info.levels,ql=q.toLowerCase(),cu=thinkNow(),items=[],sl=0;
  (info.mandatory?lv:['none'].concat(lv)).forEach(function(k){
    if(ql&&k!=='none'&&k.indexOf(ql)!==0)return;
    if(k===cu)sl=items.length;
    items.push({html:'<span class="ck">'+(k===cu?'✓':'')+'</span><b class="t">'+esc(k==='none'?'none':k)+'</b>'+
      (k==='none'&&!lv.length?'<span class="h">'+esc(info.note)+'</span>':''),
      act:function(){S.think=k;saveC();drawStatus();L('cfg','thinking: '+k);done()}});
  });
  var can=!!(prov()&&S.model);
  if(can&&ql&&lv.indexOf(ql)<0&&ql!=='none')
    items.push({html:'<span class="ck"></span><b class="t">+ Use “'+esc(ql)+'”</b>',act:function(){addCustomEffort(ql);done()}});
  if(can&&!ql)items.push({html:'<span class="ck"></span><b class="t">+ Custom Effort</b>',act:function(){
    addCustomEffort(window.prompt('Effort id accepted by this model',''));done();
  }});
  return {items:items,sel:q?0:sl};
}
function showPal(keep){
  var v=inp.value,m,b;
  if(/^\/\w*$/.test(v))b=cmdItems(v);
  else if(m=v.match(/^\/(model|thinking)\s+(.*)$/i))b=m[1].toLowerCase()==='model'?modelItems(m[2].trim()):thinkItems(m[2].trim());
  if(!b||!b.items.length){hidePal();return}
  P.items=b.items;
  if(!keep)sel=b.sel||0;
  sel=Math.min(sel,P.items.length-1);
  var el=$('pal');el.innerHTML=rows(P.items,sel);el.classList.add('on');
  var a=el.querySelector('.on');if(a)a.scrollIntoView({block:'nearest'});
}
function run(c){
  if(c==='model'||c==='thinking'){inp.value='/'+c+' ';grow();showPal();inp.focus();return true}
  inp.value='';grow();hidePal();
  if(c==='settings')openSettings();
  else if(c==='about')showAbout();
  else if(c==='version'){var s=document.createElement('span');s.textContent='ExtChat v'+APPVER;$('st').appendChild(s);setTimeout(function(){if(s.parentNode)s.remove()},4000);L('cfg','version: ExtChat v'+APPVER)}
  else if(c==='clear'){var ch=chat();if(ch&&!busy){ch.msgs=[];ch.title='New chat';saveH();render();renderList();L('chat','chat cleared')}}
  else return false;
  return true;
}
$('pal').addEventListener('mousedown',function(e){var r=e.target.closest('.pi');if(r){e.preventDefault();P.items[+r.dataset.i].act()}});
inp.addEventListener('input',function(){P.msg='';if(inp.value.charAt(0)!=='/')draft='';grow();showPal()});
inp.addEventListener('keydown',function(e){
  var open=$('pal').classList.contains('on');
  if(open&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:P.items.length-1))%P.items.length;showPal(true);return}
  if(open&&e.key==='Tab'&&/^\/\w*$/.test(inp.value)){e.preventDefault();inp.value='/'+P.items[sel].name+' ';showPal();return}
  if(open&&e.key==='Escape'){e.stopPropagation();hidePal();return}
  if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(open)P.items[sel].act();else $('f').requestSubmit()}
});
$('f').addEventListener('submit',function(e){
  e.preventDefault();
  if(busy){if(ctl)ctl.abort();return}
  var t=inp.value.trim();
  if(!t&&!AT.length)return;
  inp.value='';draft='';grow();hidePal();
  var m=t.match(/^\/(\w+)\s*$/);
  if(m&&run(m[1].toLowerCase()))return;
  post(t);
});

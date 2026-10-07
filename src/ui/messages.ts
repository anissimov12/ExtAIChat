/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/messages.ts - Message rendering, thinking box, auto-scroll */
function tkLabel(eff){return 'Thinking'+(eff&&eff!=='none'?' · '+eff:'')}
function thinkBox(think,eff,open){
  var d=document.createElement('details');d.className='tk';d.open=!!open;
  var s=document.createElement('summary');
  s.innerHTML='<i class="tki"></i><span class="tkl"></span><em class="tkn"></em>';
  s.querySelector('.tkl').textContent=tkLabel(eff);
  s.querySelector('.tkn').textContent=think.length+' chars';
  var b=document.createElement('div');b.className='tkb';b.innerHTML=md(think);
  d.appendChild(s);d.appendChild(b);return d;
}
function mk(role,text,i,model,think,eff,isErr,isStop,note,att){
  var w=document.createElement('div');w.className='w '+(role==='user'?'u':'a')+(isErr?' e':'')+(isStop?' st':'');
  if(role!=='user'&&model){var l=document.createElement('div');l.className='mn';l.textContent=model+(isStop?' · stopped':'');w.appendChild(l)}
  var b=document.createElement('div');
  if(isErr){b.className='m e';b.textContent=text}
  else{b.className='m';if(role==='user')b.textContent=text;else b.innerHTML=md(text)}
  if(role!=='user'&&think)w.appendChild(thinkBox(think,eff,!!S.tkopen));
  if(role==='user'){var ab=attBlock(att);if(ab)w.appendChild(ab)}
  w.appendChild(b);
  /* a failure after a partial answer stays inside that answer, not a message of its own */
  if(note&&!isErr){var nt=document.createElement('div');nt.className='nt';nt.textContent=note;w.appendChild(nt)}
  if(i!=null){w.dataset.i=i;var a=document.createElement('div');a.className='ac';
    a.innerHTML=btnA('re','re','Regenerate')+(role==='user'?btnA('ed','ed','Edit'):'')+btnA('cp','cp','Copy');w.appendChild(a)}
  return w;
}
/* auto-scroll only follows the stream while the user is at the bottom */
var NEAR=3,anR=0;
function atBottom(){return ms.scrollHeight-ms.scrollTop-ms.clientHeight<=NEAR}
function scrollStop(){if(anR){cancelAnimationFrame(anR);anR=0}}
/* smooth exponential ease-out that keeps chasing the growing stream */
function toBottom(instant){
  scrollStop();
  var tgt=function(){return Math.max(0,ms.scrollHeight-ms.clientHeight)};
  var d=tgt()-ms.scrollTop;
  if(instant||d<=1||d>500){ms.scrollTop=tgt();return}
  var t0=performance.now();
  anR=requestAnimationFrame(function step(){
    var t=tgt(),r=t-ms.scrollTop,e=performance.now()-t0;
    if(Math.abs(r)<.6||e>650){ms.scrollTop=t;anR=0;return}
    ms.scrollTop+=r*Math.min(.32,Math.max(.14,.32-e/1200));
    anR=requestAnimationFrame(step);
  });
}
['wheel','touchstart','pointerdown'].forEach(function(t){ms.addEventListener(t,scrollStop,{passive:true})});
/* an error is a regular assistant message (err:1) - copyable and regenerable */
function err(t){
  var c=chat();if(!c)return;
  var st=atBottom();
  c.msgs.push({role:'assistant',content:t,err:1});c.ts=Date.now();saveH();
  render();renderList();if(st)toBottom();
}
var welcomeReady=false,welcomeToken=0,bootPend=false;
function drawWelcome(){
  var el=$('welcome'),text=String(S.hello==null?"Let's start~":S.hello).slice(0,80);
  el.textContent='';
  Array.from(text).forEach(function(ch,i){
    var span=document.createElement('span');span.textContent=ch;span.style.animationDelay=(i*45)+'ms';el.appendChild(span);
  });
}
function bootReveal(){
  if(bootPend){bootPend=false;drawWelcome()}
  document.body.classList.add('ready');
}
function moveHomeForm(form,from,to){
  if(!form.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var zoom=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
  var dx=(from.left-to.left)/zoom,dy=(from.top-to.top)/zoom;
  if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
  form.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});
}
function syncWelcome(c,instant){
  var mn=$('mn'),form=$('f'),hello=$('welcome'),empty=!c||!c.msgs||!c.msgs.length;
  var was=mn.classList.contains('welcome-mode');
  if(!welcomeReady){welcomeReady=true;mn.classList.toggle('welcome-mode',empty);if(empty){if(document.body.classList.contains('ready'))drawWelcome();else bootPend=true}return}
  if(empty===was)return;
  if(instant){
    ++welcomeToken;
    form.getAnimations().forEach(function(a){a.cancel()});hello.getAnimations().forEach(function(a){a.cancel()});hello.removeAttribute('style');
    mn.classList.toggle('welcome-mode',empty);if(empty)drawWelcome();return;
  }
  var token=++welcomeToken,from=form.getBoundingClientRect(),helloRect;
  form.getAnimations().forEach(function(a){a.cancel()});
  hello.getAnimations().forEach(function(a){a.cancel()});hello.removeAttribute('style');
  if(!empty){
    helloRect=hello.getBoundingClientRect();
    var zoom=parseFloat(getComputedStyle(document.documentElement).zoom)||1;
    Object.assign(hello.style,{position:'fixed',left:helloRect.left/zoom+'px',top:helloRect.top/zoom+'px',width:helloRect.width/zoom+'px',margin:'0',display:'block',zIndex:'9',pointerEvents:'none'});
  }
  mn.classList.toggle('welcome-mode',empty);
  if(empty)drawWelcome();
  var to=form.getBoundingClientRect();moveHomeForm(form,from,to);
  if(!empty){
    if(!hello.animate||matchMedia('(prefers-reduced-motion: reduce)').matches){hello.removeAttribute('style');return}
    var fade=hello.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:280,easing:'ease-out'});
    fade.onfinish=function(){if(token===welcomeToken)hello.removeAttribute('style')};
  }
}
function render(force,instantWelcome){
  var stick=atBottom(),c=chat();ms.textContent='';drawTitle();drawTok();syncWelcome(c,instantWelcome);
  if(!c||!c.msgs.length){toBottom(true);return}
  c.msgs.forEach(function(x,i){ms.appendChild(mk(x.role,x.content,i,x.model,x.think,x.eff,x.err,x.stop,x.note,x.att))});
  if(stick||force)toBottom(!!force);
}
function renderList(){
  var l=$('cl');l.textContent='';
  listed().slice().sort(function(a,b){return b.ts-a.ts}).forEach(function(c){
    var r=document.createElement('div');r.className='ci'+(c.id===cur?' on':'');r.dataset.id=c.id;
    r.innerHTML='<button class="ct" data-a="open">'+esc(c.title)+'</button><button class="cx" data-a="del" title="Delete" aria-label="Delete">'+ic('x',12)+'</button>';l.appendChild(r);
  });
}
function newChat(){var c={id:'c'+Date.now(),title:'New chat',ts:Date.now(),msgs:[]};chats.unshift(c);cur=c.id;renderList();render();inp.focus();L('chat','new chat');return c}

/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/chat.ts - gen(): streaming request and live rendering */
async function gen(){
  var c=chat(),p=prov();
  if(!p||!S.model){L('err','provider or model not selected');err('Set up a provider (/settings) and choose a model (/model) first.');return}
  if(ABOK===false){L('err','build integrity check failed');err('This copy of ExtChat has been modified: the developer signature is invalid, so sending is disabled. Get an original build.');return}
  var model=S.model,th=thinkNow(),w=mk('assistant','',null,model),b=w.querySelector('.m'),stick=atBottom();
  var tk=null,tkb=null,tkN=null,tkUser=false,tkPref=S.tkopen===true;
  function tkShow(){
    if(tk)return;
    tk=thinkBox('',th,tkPref);tk.classList.add('live');
    tk.addEventListener('click',function(e){if(e.target.closest('summary'))tkUser=true});
    tkb=tk.querySelector('.tkb');tkN=tk.querySelector('.tkn');
    w.insertBefore(tk,b);
  }
  if(th!=='none')tkShow();
  b.classList.add('dots');b.style.display=th==='none'?'':'none';ms.appendChild(w);if(stick)toBottom();
  var api=apiOf(p),hist=c.msgs.filter(function(m){return m.role==='user'||m.content}).map(function(m){
    return {role:m.role,content:api==='messages'?cMsgs(m):api==='responses'?cResp(m):cChat(m)}
  }),body;
  if(api==='messages'){
    body={model:model,messages:hist,stream:S.stream!==false,max_tokens:S.max!==''?+S.max:4096};
    if(S.sys)body.system=S.sys;
    if(th==='none'){
      if(S.temp!=='')body.temperature=+S.temp;
      if(S.topp!=='')body.top_p=+S.topp;
      if(S.topk!=='')body.top_k=+S.topk;
    }
  }else if(api==='responses'){
    body={model:model,input:hist,stream:S.stream!==false};
    if(S.sys)body.instructions=S.sys;
    if(S.temp!=='')body.temperature=+S.temp;
    if(S.topp!=='')body.top_p=+S.topp;
    if(S.max!=='')body.max_output_tokens=+S.max;
  }else{
    body={model:model,messages:(S.sys?[{role:'system',content:S.sys}]:[]).concat(hist),stream:S.stream!==false};
    if(S.temp!=='')body.temperature=+S.temp;
    if(S.topp!=='')body.top_p=+S.topp;
    if(S.topk!=='')body.top_k=+S.topk;
    if(S.max!=='')body.max_tokens=+S.max;
  }
  applyThink(api,p,body,th,thinkInfo().cap);
  ctl=new AbortController();var TK=LIVE={cid:c.id,i:estIn(body),o:0,ri:0,ro:0};drawTok();setBusy(true);
  var t0=performance.now(),first=0,out='',think='',failed='',raf=0,rs=0;
  L('req',p.name+' ['+api+'] · '+model+' · '+hist.length+' msgs · T='+(S.temp===''?'—':S.temp)+(S.topk!==''?' · k='+S.topk:'')+(S.topp!==''?' · p='+S.topp:'')+(th!=='none'?' · think='+th:''));
  var tkRaf=0;
  function tkPaint(){
    if(!tk)return;
    tkb.innerHTML=md(think);tkN.textContent=think.length+' chars';
    if(tkRaf)return;
    tkRaf=requestAnimationFrame(function(){tkRaf=0;if(atBottom())toBottom()});
  }
  /* live rendering: markdown is re-rendered from the real stream every frame (no artificial delay);
     characters that appeared recently get a fade-in span whose animation-delay is negative by their
     age, so the fade keeps its progress across re-renders and also works inside any markdown element */
  var segs=[],prevN=0,inst=false,fin=false,FADE=520;
  function tNodes(){
    var r=[],w=document.createTreeWalker(b,NodeFilter.SHOW_TEXT,null);
    while(w.nextNode()){var n=w.currentNode;if(n.parentNode&&n.parentNode.closest&&n.parentNode.closest('.katex'))continue;r.push(n)}
    return r;
  }
  function fade(){
    var nodes=tNodes(),N=0,now=performance.now();
    nodes.forEach(function(n){N+=n.data.length});
    if(N<prevN){while(segs.length&&segs[segs.length-1].end>N)segs.pop();if(N>(segs.length?segs[segs.length-1].end:0))segs.push({end:N,t:now-FADE})}
    else if(N>prevN)segs.push({end:N,t:inst?now-FADE:now});
    prevN=N;
    while(segs.length>1&&now-segs[1].t>=FADE)segs.shift();
    var young=[];
    segs.forEach(function(s,i){if(now-s.t<FADE)young.push({a:i?segs[i-1].end:0,e:s.end,t:s.t})});
    if(!young.length)return;
    var pos=0;
    nodes.forEach(function(n){
      var len=n.data.length,s0=pos,s1=pos+len;pos=s1;
      if(!/\S/.test(n.data))return;
      var hit=young.filter(function(y){return y.e>s0&&y.a<s1});
      if(!hit.length)return;
      var fr=document.createDocumentFragment(),c=s0;
      hit.forEach(function(y){
        var a=Math.max(y.a,s0),e=Math.min(y.e,s1);
        if(a>c)fr.appendChild(document.createTextNode(n.data.slice(c-s0,a-s0)));
        var sp=document.createElement('span');sp.className='wd';
        sp.style.animationDelay=(-(now-y.t))+'ms';
        sp.textContent=n.data.slice(a-s0,e-s0);fr.appendChild(sp);c=e;
      });
      if(c<s1)fr.appendChild(document.createTextNode(n.data.slice(c-s0)));
      n.parentNode.replaceChild(fr,n);
    });
  }
  function draw(){
    if(tk){tkb.innerHTML=md(think);tkN.textContent=think.length+' chars'}
    /* whole words only: an unfinished trailing word waits for its end until the stream completes */
    var txt=fin?out:out.slice(0,out.search(/\S*$/));
    b.classList.toggle('dots',!txt&&!think);
    b.style.display=(txt||!tk)?'':'none';
    var html=txt?md(txt).replace(/\s+$/,''):'';
    b.innerHTML=html;
    if(html&&S.smooth!==false)fade();
  }
  function paint(){
    if(raf)return;
    raf=requestAnimationFrame(function(){raf=0;var st=atBottom();draw();if(st)toBottom()});
  }
  function paintNow(){if(raf){cancelAnimationFrame(raf);raf=0}var st=atBottom();draw();if(st)toBottom()}
  function upd(){paint()}
  /* reasoning is over: stop the live cue and collapse unless the user opened it by hand */
  function tkEnd(){
  if(!tk)return;
  tk.classList.remove('live');
  if(!tkUser&&!tkPref&&tk.open)tk.open=false;
}
  function tick(){if(!first){first=performance.now();tkEnd();L('ok','first token in '+Math.round(first-t0)+' ms')}}
  function addThink(x){if(typeof x==='string'&&x){if(!rs){rs=1;L('think','model is reasoning…')}think+=x;tkShow();tkPaint();estOut()}}
  function addOut(x){if(x){tick();out+=x;upd();estOut()}}
  /* tokens: in = sent to the model, out = received back (all three API shapes) */
  function usage(u,part){
    if(!u)return;
    L('tok',JSON.stringify(u));
    var i=u.prompt_tokens!=null?u.prompt_tokens:u.input_tokens,
        o=u.completion_tokens!=null?u.completion_tokens:u.output_tokens;
    if(typeof i==='number'&&i>0){TK.i=i;TK.ri=1}
    if(!part&&typeof o==='number'){TK.o=o;TK.ro=1}
    drawTok();
  }
  function estOut(){if(!TK.ro){TK.o=Math.ceil((out.length+think.length)/3.6);tokPaint()}}
  function handle(o){
    var t=o.type||'';
    if(api==='messages'){
      if(t==='content_block_delta'&&o.delta){if(o.delta.type==='thinking_delta')addThink(o.delta.thinking);else if(o.delta.type==='text_delta')addOut(o.delta.text)}
      else if(t==='message_start')usage(o.message&&o.message.usage,1);
      else if(t==='message_delta')usage(o.usage);
      else if(t==='error')throw new Error((o.error&&o.error.message)||'stream error');
    }else if(api==='responses'){
      if(t==='response.output_text.delta')addOut(o.delta);
      else if(t==='response.reasoning_summary_text.delta'||t==='response.reasoning_text.delta')addThink(o.delta);
      else if(t==='response.reasoning_summary_part.added'){if(think)think+='\n\n'}
      else if(t==='response.completed')usage(o.response&&o.response.usage);
      else if(t==='response.failed')throw new Error((o.response&&o.response.error&&o.response.error.message)||'response failed');
      else if(t==='response.incomplete')L('err','incomplete: '+((o.response&&o.response.incomplete_details&&o.response.incomplete_details.reason)||'unknown'));
      else if(t==='error')throw new Error(o.message||(o.error&&o.error.message)||'stream error');
    }else{
      if(o.error)throw new Error(o.error.message||JSON.stringify(o.error));
      var dl=o.choices&&o.choices[0]&&o.choices[0].delta;
      var rt=dl&&(dl.reasoning_content!=null?dl.reasoning_content:dl.reasoning);
      addThink(rt);
      if(dl)addOut(dl.content);
      usage(o.usage);
    }
  }
  try{
    var res=await fetch(endpoint(p),{method:'POST',headers:headers(p),body:JSON.stringify(body),signal:ctl.signal});
    L(res.ok?'ok':'err','HTTP '+res.status);
    if(!res.ok){var t=await res.text();throw new Error('HTTP '+res.status+(t?': '+t.slice(0,300):''))}
    var ct=res.headers.get('content-type')||'';
    if(ct.indexOf('json')>-1||!res.body){
      var j=await res.json();
      if(j.error)throw new Error(j.error.message||JSON.stringify(j.error));
      if(api==='messages'){
        (j.content||[]).forEach(function(x){if(x.type==='text')out+=x.text||'';else if(x.type==='thinking')think+=x.thinking||''});
      }else if(api==='responses'){
        (j.output||[]).forEach(function(x){
          if(x.type==='message')(x.content||[]).forEach(function(y){if(y.type==='output_text')out+=y.text||''});
          else if(x.type==='reasoning')(x.summary||[]).forEach(function(y){if(y.text)think+=(think?'\n\n':'')+y.text});
        });
      }else{
        var ch=(j.choices&&j.choices[0]&&j.choices[0].message)||{};
        out=ch.content||'';
        var rt0=ch.reasoning_content!=null?ch.reasoning_content:ch.reasoning;
        if(typeof rt0==='string'&&rt0)think=rt0;
      }
      if(think){tkShow();tkPaint()}
      tick();inst=true;fin=true;b.style.display='';b.classList.remove('dots');draw();
      usage(j.usage);
    }else{
      var rd=res.body.getReader(),dec=new TextDecoder(),buf='';
      for(;;){
        var r=await rd.read();if(r.done)break;
        buf+=dec.decode(r.value,{stream:true});
        var lines=buf.split('\n');buf=lines.pop();
        for(var i=0;i<lines.length;i++){
          var l=lines[i].trim();if(l.indexOf('data:')!==0)continue;
          var d=l.slice(5).trim();if(!d||d==='[DONE]')continue;
          var o;try{o=JSON.parse(d)}catch(e){continue}
          handle(o);
        }
      }
    }
  }catch(e){
    failed=e&&e.name==='AbortError'?'Stopped.':(e instanceof TypeError?'Could not connect. Check the URL, key and server CORS settings.':String(e.message||e));
    if(th!=='none'&&/^HTTP 4\d\d/.test(failed))learnEfforts(failed,p,model,th);
  }
  if(raf){cancelAnimationFrame(raf);raf=0}
  if(tkRaf)cancelAnimationFrame(tkRaf);
  /* the answer is committed only after the animation showed all of it */
  function finish(){
    fin=true;paintNow();
    tkEnd();
    if(tk&&!think)tk.remove();
    /* a stop keeps the partial answer as a normal message (stop:1); no separate error line */
    var stopped=failed==='Stopped.';
    if(out)c.msgs.push({role:'assistant',content:out,think:think,eff:th!=='none'?th:'',model:model,stop:stopped?1:0,note:(failed&&!stopped)?failed:0,tok:{i:TK.i,o:TK.o,ri:TK.ri,ro:TK.ro}});
    c.ts=Date.now();saveH();
    L(failed&&!stopped?'err':stopped?'warn':'done',(failed||'done')+' · '+out.length+' chars'+(think?' · think '+think.length:'')+' · '+Math.round(performance.now()-t0)+' ms');
    LIVE=null;ctl=null;setBusy(false);render();renderList();
    /* only real failures get an error line */
    if(!out){if(failed&&!stopped)err(failed);else if(!failed)err('Empty response.')}
    if(!c.title||c.title==='New chat')genTitle(c,out);
  }
  finish();
}

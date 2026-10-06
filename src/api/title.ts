/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/title.ts - Automatic chat title */
/* after the first answer a tiny non-streaming request asks the model for a 3-6 word title */
function genTitle(c,answer){
  if(c.titled||!prov()||!S.model)return;
  c.titled=1;
  var p=prov(),a=apiOf(p);
  var q=(c.msgs.filter(function(m){return m.role==='user'})[0]||{}).content||'';
  var t=(q+'\n'+(answer||'').slice(0,600)).trim().slice(0,1500);
  if(!t)return;
  /*System promt for title, nd ask*/
  var SYS='You write short chat titles: 3-6 words, no quotes, no trailing punctuation, same language as the message.';
  var ask='Name this chat in 3-6 words. Reply with the title only - no quotes, no trailing punctuation, same language as the text.\n\n'+t;
  var body=function(k){var b;
    if(a==='responses')b={model:S.model,input:ask,max_output_tokens:32};
    else if(a==='messages')b={model:S.model,messages:[{role:'user',content:ask}]};
    else b={model:S.model,messages:[{role:'system',content:SYS},{role:'user',content:t}],max_tokens:32};
    if(k)b[k]=32;
    return b;
  };
  function once(b){
    return fetch(endpoint(p),{method:'POST',headers:headers(p),body:JSON.stringify(b)})
    .then(function(r){return r.text().then(function(tx){
      if(!r.ok)throw new Error('HTTP '+r.status+': '+tx.slice(0,180));
      try{return JSON.parse(tx)}catch(e){throw new Error('unexpected JSON')}
    })});
  }
  function pick(j){
    var s='';
    if(a==='responses'){
      if(typeof j.output_text==='string')s=j.output_text;
      (j.output||[]).forEach(function(x){if(x.type==='message')(x.content||[]).forEach(function(y){if(y.type==='output_text')s+=y.text||''})});
    }else if(a==='messages')(j.content||[]).forEach(function(x){if(x.type==='text')s+=x.text||''});
    else s=((j.choices&&j.choices[0]&&j.choices[0].message)||{}).content||'';
    return String(s||'').split('\n')[0]
      .replace(/^[\s"'“«\-–—:.]+/,'').replace(/[\s"'”».,:;!?…]+$/,'')
      .slice(0,60).trim();
  }
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim().slice(0,60)}
  function apply(s){
    if(!s)return false;
    c.title=s;c.ts=Date.now();saveH();renderList();L('ok','title: '+s);return true;
  }
  L('req','title: '+p.name+' · '+S.model);
  once(body())
  .catch(function(er){
    if(a==='chat'&&/max_tokens|HTTP 400/.test(er.message))return once(body('max_completion_tokens'));
    throw er;
  })
  .then(function(j){if(!apply(pick(j)))throw new Error('empty title')}
  )
  .catch(function(er){
    L('err','title: '+(er instanceof TypeError?'no connection / CORS':er.message));
    apply(clean(q.split('\n')[0]).slice(0,40)+(q.length>40?'…':''));
  });
}

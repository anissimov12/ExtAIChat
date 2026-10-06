/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/settings.ts - Settings dialog (providers, appearance, headers, data) */
/* MARK: settings */
function openSettings(t){
  var d=$('dS'),tab=['app','extra','data'].indexOf(t)>-1?t:'prov';
  function head(){
    return '<div class="dh" role="tablist">'+TABS.map(function(x){
      return '<button class="tab'+(tab===x[0]?' on':'')+'" type="button" data-tab="'+x[0]+'" role="tab" aria-selected="'+(tab===x[0])+'">'+x[1]+'</button>'}).join('')+
      '<button class="tab" data-a="x" type="button" style="margin-left:auto">Close</button></div>';
  }
  function viewProv(){
    var h='<div class="db">';
    h+=S.providers.map(function(p){return '<div class="card" data-id="'+esc(p.id)+'"><div class="row"><input data-f="name" value="'+esc(p.name)+'" placeholder="Name"><button class="btn sec" data-a="del" type="button">Delete</button></div>'+
        '<select data-f="api" aria-label="API">'+APIS.map(function(x){return '<option value="'+x[0]+'"'+(apiOf(p)===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select>'+
        '<input data-f="url" value="'+esc(p.url)+'" placeholder="https://host/v1" spellcheck="false">'+
        '<input data-f="key" type="password" value="'+esc(p.key||'')+'" placeholder="API key (if required)" autocomplete="off">'+
        '<div class="row"><button class="btn sec" data-a="ld" type="button">Load models</button><span class="muted" data-s>'+(p.models&&p.models.length?'Models: '+p.models.length:'')+'</span></div></div>'}).join('')+
        '<div class="row"><select id="pre">'+PRESETS.map(function(x,i){return '<option value="'+i+'">'+esc(x[0])+'</option>'}).join('')+'</select><button class="btn" data-a="add" type="button">Add</button></div>'+
        '<div class="muted">Pick the API your endpoint speaks; the path (/responses, /chat/completions or /messages) is appended automatically. Keys are stored only in this browser.</div>';
    return h+'</div>';
  }
  function viewApp(){
    return '<div class="db">'+
        '<label>Interface font<select data-pf="font" aria-label="Interface font">'+FONTS.map(function(x){return '<option value="'+x[0]+'"'+(S.font===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>'+
        '<label>Colour theme<select data-pf="theme" aria-label="Colour theme">'+THEMES.map(function(x){return '<option value="'+x[0]+'"'+(S.theme===x[0]?' selected':'')+'>'+x[1]+'</option>'}).join('')+'</select></label>'+
        '<label>New chat greeting<input data-pf="hello" type="text" maxlength="80" value="'+esc(String(S.hello==null?'Hello':S.hello))+'" aria-label="New chat greeting"></label>'+
        '<label>Interface size · <span data-pv="scale">'+Math.round(S.scale*100)+' %</span><input data-pf="scale" type="range" min="80" max="160" step="5" value="'+Math.round(S.scale*100)+'" aria-label="Interface size"></label>'+
        '<label>Message size · <span data-pv="fsize">'+S.fsize+' px</span><input data-pf="fsize" type="range" min="12" max="18" step="0.5" value="'+S.fsize+'" aria-label="Message size"></label>'+
        '<label>Message width · <span data-pv="mwidth">'+(S.mwidth?S.mwidth+' px':'auto')+'</span><div class="row"><input data-pf="mwidth" type="range" min="560" max="1040" step="20" value="'+(S.mwidth||720)+'" aria-label="Message width"><button class="ghost" data-a="pfa" type="button">Auto</button></div></label>'+
        '<label class="chk"><input type="checkbox" data-pf="smooth"'+(S.smooth!==false?' checked':'')+'> Typewriter stream animation</label>'+
        '<label class="chk"><input type="checkbox" data-pf="tkopen"'+(S.tkopen?' checked':'')+'> Keep thinking blocks expanded</label>'+
        '<label class="chk"><input type="checkbox" data-pf="ltime"'+(S.ltime!==false?' checked':'')+'> Timestamps in logs</label>'+
        '<label class="chk"><input type="checkbox" data-pf="newchat"'+(S.newchat!==false?' checked':'')+'> Start a new chat on launch</label>'+
        '<div class="row"><button class="btn sec" data-a="pfrs" type="button">Reset appearance</button><span class="muted">Applies instantly</span></div>'+
        '</div>';
  }

  function viewExtra(){
    S.hdr=S.hdr||{};
    return '<div class="db">'+
      HX.map(function(x){return '<label>'+x[1]+'<textarea data-hx="'+x[0]+'" rows="4" spellcheck="false" placeholder="{&quot;X-Title&quot;: &quot;MyService&quot;}">'+esc(typeof S.hdr[x[0]]==='string'?S.hdr[x[0]]:DEFHDR)+'</textarea><span class="muted" data-hs="'+x[0]+'"></span></label>'}).join('')+
      '<div class="row"><button class="btn sec" data-a="hxr" type="button">Reset to default</button></div>'+
      '<div class="muted hx"><b>About headers</b><br>'+
      'HTTP headers are additional parameters sent together with each API request. They tell the server how to process the request, identify the client, provide authentication, or enable provider-specific features.<br><br>'+

      '<b>Common headers</b><br>'+
      '• <code>Referer</code> / <code>HTTP-Referer</code> - indicates the page or application from which the request originated. Some API providers use it for attribution.<br>'+
      '• <code>X-Title</code> - application name/title. OpenRouter commonly uses it together with <code>HTTP-Referer</code> for app attribution.<br>'+
      '</div>'+
      '</div>';
  }

  function setHdr(i){
    var k=i.dataset.hx,s=d.querySelector('[data-hs="'+k+'"]');
    try{hdrParse(i.value);S.hdr=S.hdr||{};S.hdr[k]=i.value.trim();saveC();s.textContent=i.value.trim()?'Saved':'';s.style.color=''}
    catch(er){s.textContent='Invalid JSON: '+er.message+' (not saved)';s.style.color='var(--err)'}
  }
  /* MARK: data - export / import / storage encryption */
  function viewData(){
    var on=VAULT.on(),cr=VAULT.can();
    return '<div class="db">'+
      '<div class="sec0">Export settings</div>'+
      '<label class="chk"><input type="checkbox" id="xk"> Include API keys</label>'+
      '<label class="chk"><input type="checkbox" id="xc"> Include chats</label>'+
      '<input id="xp" type="password" placeholder="Passphrase to encrypt the file (optional)" autocomplete="new-password" aria-label="Export passphrase">'+
      '<div class="row"><button class="btn" data-a="exp" type="button">Export</button><span class="muted" data-ds="exp"></span></div>'+
      '<div class="sec">Import settings</div>'+
      '<select id="im" aria-label="Import mode"><option value="merge">Merge into current settings</option><option value="replace">Replace current settings</option></select>'+
      '<input id="ip" type="password" placeholder="Passphrase (if the file is encrypted)" autocomplete="off" aria-label="Import passphrase">'+
      '<div class="row"><button class="btn sec" data-a="imp" type="button">Import…</button><span class="muted" data-ds="imp"></span></div>'+
      '<div class="sec">Storage encryption · <b class="'+(on?'':'bad')+'">'+(on?'on':'off')+'</b></div>'+
      '<div class="muted">ExtAIChat automatically encrypts everything it keeps in this browser - providers, API keys, chats and settings - with AES-256-GCM. The first encryption uses the built-in default passphrase. If you change it below, the new passphrase is required on the next launch and is never stored.</div>'+
      (cr?'':'<div class="muted bad">WebCrypto is unavailable here - open the app over HTTPS or localhost.</div>')+
      '<input id="v1" type="password" placeholder="New passphrase (min 8 characters)" autocomplete="new-password" aria-label="New passphrase"'+(cr?'':' disabled')+'>'+
      '<input id="v2" type="password" placeholder="Repeat passphrase" autocomplete="new-password" aria-label="Repeat new passphrase"'+(cr?'':' disabled')+'>'+
      '<div class="row"><button class="btn" data-a="vch" type="button"'+(cr?'':' disabled')+'>Change passphrase</button><button class="btn sec" data-a="vlk" type="button">Lock now</button></div>'+
      '<div class="muted" data-ds="v"></div>'+
      '<div class="sec">About</div><div class="row"><button class="ghost" data-a="abt" type="button">About ExtAIChat · /about</button></div>'+
    '</div>';
  }
  function ds(k,m,bad){var s=d.querySelector('[data-ds="'+k+'"]');if(s){s.textContent=m;s.style.color=bad?'var(--err)':''}}
  function fixS(){
    if(!Array.isArray(S.providers))S.providers=[];
    S.providers=S.providers.filter(function(p){return p&&typeof p==='object'&&typeof p.id==='string'&&p.id});
    S.providers.forEach(function(p){p.name=String(p.name||'');p.url=String(p.url||'');p.key=String(p.key||'');if(!EP[p.api])p.api='chat';if(!Array.isArray(p.models))p.models=[];delete p.mmeta;delete p.caps;delete p.capsAt});
    if(typeof S.sys!=='string')S.sys='';
    if(!Array.isArray(S.presets))S.presets=[];
    S.presets=S.presets.filter(function(x){return x&&typeof x.name==='string'&&typeof x.text==='string'});
    ['tcust','tlearn','hdr'].forEach(function(k){if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={}});
    APIS.forEach(function(a){if(typeof S.hdr[a[0]]!=='string')S.hdr[a[0]]=DEFHDR});
    Object.keys(PF).forEach(function(k){if(S[k]==null)S[k]=PF[k]});
    if(S.think==='off')S.think='none';
    if(!prov()){S.pid='';S.model=''}
  }
  async function doExport(){
    try{
      var o=JSON.parse(JSON.stringify(S)),keys=$('xk').checked,pw=$('xp').value;
      o.providers.forEach(function(p){delete p.caps;delete p.capsAt;if(!keys)p.key=''});
      var out={app:'ExtAIChat',type:'settings',v:1,at:new Date().toISOString(),settings:o};
      if($('xc').checked)out.chats=listed();
      if(pw){
        if(!VAULT.can())throw new Error('encryption needs WebCrypto (HTTPS or localhost)');
        ds('exp','Encrypting…');
        out={app:'ExtAIChat',type:'settings',v:1,enc:await VAULT.seal(JSON.stringify(out),pw)};
      }
      var blob=new Blob([JSON.stringify(out,null,1)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=u;a.download='extaichat-settings-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(u)},4000);
      ds('exp','Exported'+(keys&&!pw?' · API keys are in plain text':''));L('cfg','settings exported');
    }catch(er){ds('exp',er.message,1)}
  }
  function doImport(){
    var fi=document.createElement('input');fi.type='file';fi.accept='.json,application/json';
    fi.onchange=async function(){
      var f=fi.files[0];if(!f)return;
      try{
        if(f.size>60*1048576)throw new Error('file is too large');
        var o;try{o=JSON.parse(await f.text())}catch(e){throw new Error('not a valid JSON file')}
        if(!o||o.type!=='settings'||(o.app!=='ExtAIChat'&&o.app!=='ExtChat'))throw new Error('not an ExtAIChat settings file');
        if(o.enc){
          var pw=$('ip').value;
          if(!pw)throw new Error('the file is encrypted - enter its passphrase above, then choose it again');
          if(!VAULT.can()||!(o.enc.it>=1e5&&o.enc.it<=2e6)||typeof o.enc.salt!=='string')throw new Error('cannot decrypt this file here');
          ds('imp','Decrypting…');
          try{o=JSON.parse(await VAULT.unseal(o.enc,pw))}catch(e){throw new Error('wrong passphrase or damaged file')}
        }
        if(!o.settings||typeof o.settings!=='object'||Array.isArray(o.settings))throw new Error('no settings in the file');
        applyImport(o,$('im').value);
      }catch(er){ds('imp',er.message,1)}
    };
    fi.click();
  }
  function applyImport(o,mode){
    var im=o.settings,np=Array.isArray(im.providers)?im.providers.length:0,nc=Array.isArray(o.chats)?o.chats.length:0,bad={'__proto__':1,constructor:1,prototype:1};
    if(!confirm((mode==='replace'?'Replace':'Merge')+' current settings with '+np+' provider(s)'+(nc?' and '+nc+' chat(s)':'')+' from the file?'))return ds('imp','Cancelled');
    if(mode==='replace'){
      Object.keys(S).forEach(function(k){delete S[k]});
      Object.assign(S,{providers:[],pid:'',model:'',sys:'',temp:0.7,topk:'',topp:'',max:'',think:'none'});
      Object.keys(im).forEach(function(k){if(!bad[k])S[k]=im[k]});
    }else{
      Object.keys(im).forEach(function(k){if(!bad[k]&&k!=='providers'&&k!=='presets')S[k]=im[k]});
      (Array.isArray(im.providers)?im.providers:[]).forEach(function(p){
        if(!p||typeof p!=='object'||typeof p.id!=='string')return;
        var i=S.providers.findIndex(function(x){return x.id===p.id});
        if(i>-1){if(!p.key&&S.providers[i].key)p.key=S.providers[i].key;S.providers[i]=p}else S.providers.push(p);
      });
      (Array.isArray(im.presets)?im.presets:[]).forEach(function(x){
        if(!x||typeof x.name!=='string'||typeof x.text!=='string')return;
        var i=S.presets.findIndex(function(y){return y.name===x.name});
        if(i>-1)S.presets[i]=x;else S.presets.push(x);
      });
    }
    fixS();
    if(nc){
      var ok=o.chats.filter(function(c){return c&&typeof c.id==='string'&&Array.isArray(c.msgs)}).map(function(c){c.title=String(c.title||'New chat');c.ts=+c.ts||Date.now();return c});
      if(mode==='replace')chats=ok;
      else ok.forEach(function(c){if(!chats.some(function(x){return x.id===c.id}))chats.push(c)});
      if(!chat())cur=chats[0]?chats[0].id:'';
    }
    saveC();saveH();applyPrefs();drawPar();$('sys').value=S.sys;sysCount();drawPre();drawStatus();renderList();render();fitUI();refreshAllCaps();
    draw();ds('imp','Imported · '+S.providers.length+' provider(s)'+(nc?' · '+chats.length+' chat(s)':''));L('cfg','settings imported ('+mode+')');
  }
  async function doVault(a){
    try{
      if(a!=='vch')return;
      var p1=$('v1').value,p2=$('v2').value;
      if(p1.length<8)throw new Error('The passphrase must be at least 8 characters.');
      if(p1!==p2)throw new Error('The passphrases do not match.');
      if(!confirm('Change the storage encryption passphrase?\n\nThe new passphrase will be required after the next launch. It cannot be recovered if lost.'))return;
      ds('v','Working…');
      await VAULT.enable(p1,false);
      $('v1').value='';$('v2').value='';
      L('cfg','storage encryption passphrase changed');draw();ds('v','Passphrase changed. It will be requested on the next launch.');
    }catch(er){ds('v',er.message||String(er),1)}
  }
  function draw(){d.innerHTML=head()+(tab==='app'?viewApp():tab==='extra'?viewExtra():tab==='data'?viewData():viewProv())}
  function setPref(i){
    var k=i.dataset.pf,v=i.type==='checkbox'?i.checked:i.type==='range'?(k==='scale'?+i.value/100:+i.value):i.value;
    S[k]=v;saveC();applyPrefs();
    var v2=d.querySelector('[data-pv="'+k+'"]');
    if(v2)v2.textContent=k==='mwidth'?(v?v+' px':'auto'):k==='scale'?Math.round(v*100)+' %':v+' px';
    if(k==='tkopen'||k==='smooth')render();
    if(k==='hello')drawWelcome();
    if(k==='scale')fitUI(); /* the panels are clamped in css px, so they have to follow the new scale */
  }
  d.onclick=async function(e){
    var t=e.target.closest('button');if(!t)return;
    if(t.dataset.tab){tab=t.dataset.tab;draw();return}
    var a=t.dataset.a,card=t.closest('.card'),p=card&&prov(card.dataset.id);
    if(a==='exp')return doExport();
    if(a==='imp')return doImport();
    if(a==='vch')return doVault(a);
    if(a==='vlk'){location.reload();return}
    if(a==='abt'){showAbout();return}
    if(a==='hxr'){HX.forEach(function(x){S.hdr[x[0]]=DEFHDR});saveC();draw();return}
    if(a==='x')d.close();
    if(a==='pfa'){S.mwidth=0;saveC();applyPrefs();draw();return}
    if(a==='add'){var x=PRESETS[+$('pre').value];S.providers.push({id:'p'+Date.now(),name:x[0],url:x[1],api:x[2]||'chat',key:'',models:[]});saveC();L('cfg','provider added: '+x[0]);draw();render()}
    if(a==='del'){S.providers=S.providers.filter(function(q){return q!==p});if(S.pid===p.id){S.pid='';S.model=''}saveC();L('cfg','provider removed: '+p.name);drawStatus();draw();render()}
    if(a==='pfrs'){Object.assign(S,PF);saveC();applyPrefs();draw();render()}
    if(a==='ld'){var s=card.querySelector('[data-s]');s.textContent='…';
      try{s.textContent='Models: '+await loadModels(p)}catch(er){L('err',er.message);s.textContent='Error: '+(er instanceof TypeError?'no connection / CORS':er.message)}}
  };
  d.onchange=function(e){
    var i=e.target;
    if(i.dataset.pf)return setPref(i);
    if(i.dataset.hx)return setHdr(i);
    if(i.dataset.f){var q=prov(i.closest('.card').dataset.id);q[i.dataset.f]=i.value;saveC();drawStatus();if(i.dataset.f==='api'){L('cfg',q.name+' api: '+i.value);draw()}}
  };
  d.oninput=function(e){var i=e.target;if(i.dataset.pf&&i.type==='range')setPref(i)};
  draw();if(!d.open)d.showModal();
}

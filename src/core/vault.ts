/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/vault.ts - VAULT: encrypted storage layer (everything under "aichat:*") */
/* MARK: vault - storage layer. Everything under "aichat:*" goes through here.
   Off: plain localStorage. On: AES-256-GCM, key = PBKDF2-SHA256(passphrase, random salt, 250k).
   The key lives only in memory; a reload asks for the passphrase again. Values are cached in MEM so the
   rest of the app can keep reading/writing synchronously; encrypted writes are batched and async. */
var VAULT=(function(){
  var PFX='aichat:',META='aichat:enc',MEM={},KEY=null,dirty={},timer=0,chain=Promise.resolve(),hold=false,IT=250000;
  var V={onErr:function(){}};
  function can(){return !!(window.crypto&&crypto.subtle)}
  function keys(){var r=[];try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(PFX)===0&&k!==META)r.push(k)}}catch(e){}return r}
  function derive(pass,salt,it){
    return crypto.subtle.importKey('raw',te.encode(pass),'PBKDF2',false,['deriveKey']).then(function(m){
      return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:it},m,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    });
  }
  /* "enc1:<iv>:<ciphertext>"; the storage key is bound in as AAD, so values cannot be swapped between keys */
  function enc(key,txt,aad){
    var iv=crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:te.encode(aad)},key,te.encode(txt)).then(function(ct){return 'enc1:'+b64(iv)+':'+b64(new Uint8Array(ct))});
  }
  function dec(key,blob,aad){
    var p=String(blob).split(':');
    if(p[0]!=='enc1'||p.length!==3)return Promise.reject(new Error('bad format'));
    return crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(p[1]),additionalData:te.encode(aad)},key,unb64(p[2])).then(function(b){return td.decode(b)});
  }
  function flush(){
    clearTimeout(timer);
    var p=chain.then(function(){
      if(!KEY||hold)return;
      var key=KEY,ks=Object.keys(dirty);dirty={};
      return Promise.all(ks.map(function(k){
        if(MEM[k]==null)return;
        return enc(key,MEM[k],k).then(function(v){localStorage.setItem(k,v)}).catch(function(e){dirty[k]=1;throw e});
      }));
    });
    chain=p.catch(function(){});
    return p;
  }
  V.get=function(k){var v=MEM[k];return v==null?null:v};
  V.set=function(k,s){
    MEM[k]=s;
    if(KEY||hold){dirty[k]=1;if(KEY&&!hold){clearTimeout(timer);timer=setTimeout(function(){flush().catch(V.onErr)},250)}return}
    localStorage.setItem(k,s); /* may throw (quota) - the caller reports it */
  };
  V.on=function(){return !!KEY};
  V.can=can;
  /* turn encryption on, or change the passphrase: everything is encrypted first, then written in one go */
  V.enable=function(pass,auto){
    if(!can())return Promise.reject(new Error('WebCrypto is unavailable (open the app over HTTPS or localhost)'));
    hold=true;
    var salt=crypto.getRandomValues(new Uint8Array(16)),old={},key;
    return chain.then(function(){return derive(pass,salt,IT)}).then(function(k){
      key=k;
      var ks=Object.keys(MEM).filter(function(x){return MEM[x]!=null});
      return Promise.all([enc(key,'extchat','check')].concat(ks.map(function(x){return enc(key,MEM[x],x)}))).then(function(r){
        var m=JSON.stringify({v:1,it:IT,salt:b64(salt),chk:r[0],auto:!!auto});
        try{
          ks.forEach(function(x,i){old[x]=localStorage.getItem(x);localStorage.setItem(x,r[i+1])});
          old[META]=localStorage.getItem(META);localStorage.setItem(META,m);
        }catch(e){
          Object.keys(old).forEach(function(x){try{if(old[x]==null)localStorage.removeItem(x);else localStorage.setItem(x,old[x])}catch(_){}});
          throw e;
        }
        KEY=key;
      });
    }).then(function(){hold=false;return flush()},function(e){
      hold=false;
      if(KEY)flush().catch(V.onErr);
      else{Object.keys(dirty).forEach(function(k){try{if(MEM[k]!=null)localStorage.setItem(k,MEM[k])}catch(_){}});dirty={}}
      throw e;
    });
  };
  V.disable=function(){
    var key=KEY;KEY=null;dirty={};
    return chain.then(function(){
      Object.keys(MEM).forEach(function(k){if(MEM[k]!=null)localStorage.setItem(k,MEM[k])});
      localStorage.removeItem(META);
    }).catch(function(e){KEY=key;throw e});
  };
  /* passphrase-protected export files use the same primitives with a fresh salt */
  V.seal=function(txt,pass){
    var salt=crypto.getRandomValues(new Uint8Array(16));
    return derive(pass,salt,IT).then(function(k){return enc(k,txt,'export')}).then(function(c){return {it:IT,salt:b64(salt),data:c}});
  };
  V.unseal=function(o,pass){return derive(pass,unb64(o.salt),o.it).then(function(k){return dec(k,o.data,'export')})};
  function unlockAuto(m,ks){
    var key;
    return derive(PASSPHASE,unb64(m.salt),m.it)
      .then(function(k){key=k;return dec(k,m.chk,'check')})
      .then(function(v){
        if(v!=='extchat')throw new Error('default passphrase mismatch');
        return Promise.all(ks.map(function(k){
          var raw=null;try{raw=localStorage.getItem(k)}catch(e){}
          if(raw==null)return;
          if(raw.indexOf('enc1:')!==0){MEM[k]=raw;return;}
          return dec(key,raw,k).then(function(t){MEM[k]=t},function(){throw new Error('could not decrypt '+k)});
        }));
      })
      .then(function(){KEY=key;return true});
  }
  function unlock(m,ks,block){
    return new Promise(function(res){
      var d=document.createElement('dialog');d.id='dU';
      d.innerHTML='<div class="dh"><b>ExtAIChat is locked</b></div><div class="db"><div class="muted">Enter the passphrase to unlock it</div>'+
        '<input id="uP" type="password" placeholder="Passphrase" autocomplete="current-password" aria-label="Passphrase" spellcheck="false">'+
        '<div class="muted bad" id="uE"></div><div class="row"><button class="btn" id="uG" type="button">Unlock</button><button class="btn sec" id="uR" type="button" style="margin-left:auto">Erase all data…</button></div></div>';
      document.body.appendChild(d);
      var P=d.querySelector('#uP'),E=d.querySelector('#uE'),G=d.querySelector('#uG'),work=false;
      d.addEventListener('cancel',function(e){e.preventDefault()});
      if(block){E.textContent=block;G.disabled=true;P.disabled=true}
      function go(){
        if(work||!P.value||block)return;
        work=true;G.disabled=true;E.textContent='';
        var key;
        Promise.resolve().then(function(){return derive(P.value,unb64(m.salt),m.it)}).then(function(k){key=k;return dec(k,m.chk,'check')}).then(function(v){
          if(v!=='extchat')throw new Error('bad');
          return Promise.all(ks.map(function(k){
            var raw=null;try{raw=localStorage.getItem(k)}catch(e){}
            if(raw==null)return;
            if(raw.indexOf('enc1:')!==0){MEM[k]=raw;return}
            return dec(key,raw,k).then(function(t){MEM[k]=t},function(){console.warn('ExtAIChat: could not decrypt '+k)});
          }));
        }).then(function(){KEY=key;d.close();d.remove();res()},function(){work=false;G.disabled=false;E.textContent='Wrong passphrase.';P.select()});
      }
      G.onclick=go;
      P.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();go()}});
      d.querySelector('#uR').onclick=function(){
        if(!confirm('Erase ALL ExtAIChat data in this browser (chats, providers, API keys, settings)? This cannot be undone.'))return;
        keys().concat([META]).forEach(function(k){try{localStorage.removeItem(k)}catch(e){}});
        location.reload();
      };
      d.showModal();P.focus();
    });
  }
  V.open=function(){
    var raw=null,m=null;
    try{raw=localStorage.getItem(META)}catch(e){}
    try{m=raw&&JSON.parse(raw)}catch(e){}
    var ks=keys();

    /* First run / legacy plaintext storage: load it, then immediately encrypt it
       with the built-in default passphrase. */
    if(!raw){
      ks.forEach(function(k){try{MEM[k]=localStorage.getItem(k)}catch(e){}});
      if(!can())return Promise.resolve();
      return V.enable(PASSPHASE,true).catch(function(e){
        console.warn('ExtAIChat: automatic storage encryption failed',e);
      });
    }

    var bad=!(m&&m.salt&&m.chk&&m.it>0),
        block=!can()?'WebCrypto is unavailable here. Open the app over HTTPS or localhost.':
          bad?'The encryption header is damaged. The data cannot be unlocked.':'';

    if(bad)return unlock(null,ks,block);

    /* The built-in passphrase is used automatically only until the user changes it.
       A custom passphrase is never stored, so a changed passphrase is requested. */
    if(m.auto===true){
      return unlockAuto(m,ks).catch(function(){
        return unlock(m,ks,'');
      });
    }
    return unlock(m,ks,block);
  };
  window.addEventListener('pagehide',function(){if(KEY)flush().catch(function(){})});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&KEY)flush().catch(function(){})});
  return V;
})();

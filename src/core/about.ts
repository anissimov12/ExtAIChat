/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/about.ts - Signed developer block + /about dialog (see tools/seal-about.mjs) */
/* about - developer info is signed (ECDSA P-256) and stored masked; see tools/seal-about.mjs */
var AB=/*ABOUT:BEGIN*/{k:'BCo3vmTuVSb7KBGoQGGfiZFygAOW/IuaRUEYgc2dI7S3IV31mh64CUMz6s+LiBdrrucvE8AriSiQvg3iY2jZxpA=',s:'1Hbl6YAmSG5KaQe7jgrXbetR5p0MwwOV3W/7w7S0rlwAGoCTU0CFAJr7E/elSl1Z9UAhFDdEYHKjpb2IXe52SQ==',d:'fwhZnF7MOF+JUXDOKwC/ofAc6XDlleb1M3AqqO+xAcCVG3+6/HjUYC1Wyqrz/HIF3Y5AfewL70finkyrQwuxp+RwQ1nZSsB7BpZNft8+Q7Or6FC6IdGsx7d2byij4b9Plo16Btfdd8xhNlHI46ngYx/elBU870zgXPjLb8wAB7Tp8WpDRM0NgzpQyhoz9R0c'}/*ABOUT:END*/;
function aboutCheck(){
  if(aboutCheck.p)return aboutCheck.p;
  return aboutCheck.p=(async function(){
    try{
      var pk=unb64(AB.k),raw=unb64(AB.d),m=new Uint8Array(raw.length);
      for(var i=0;i<raw.length;i++)m[i]=raw[i]^pk[i%pk.length];
      var info=JSON.parse(td.decode(m));
      if(!window.crypto||!crypto.subtle)return {ok:null,info:info,fp:''};
      var key=await crypto.subtle.importKey('raw',pk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
      if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,unb64(AB.s),m))return {ok:false};
      var h=new Uint8Array(await crypto.subtle.digest('SHA-256',pk));
      var fp=Array.prototype.map.call(h.subarray(0,8),function(x){return ('0'+x.toString(16)).slice(-2)}).join('').toUpperCase().replace(/(.{4})(?=.)/g,'$1-');
      return {ok:true,info:info,fp:fp};
    }catch(e){return {ok:false}}
  })();
}
function showAbout(){
  var d=document.getElementById('dA');
  if(!d){d=document.createElement('dialog');d.id='dA';document.body.appendChild(d)}
  d.innerHTML='<div class="dh"><b>About</b><button class="tab" type="button" data-x style="margin-left:auto">Close</button></div><div class="db ab"><div class="muted">Verifying…</div></div>';
  d.querySelector('[data-x]').onclick=function(){d.close()};
  if(!d.open)d.showModal();
  aboutCheck().then(function(r){
    var b=d.querySelector('.ab');b.textContent='';
    function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
    if(r.ok===false||!r.info){b.appendChild(el('div','bad','This copy of ExtAIChat has been modified: the developer signature is invalid. Get an original build from the developer.'));return}
    var i=r.info;
    b.appendChild(el('h3','','ExtAIChat'));
    if(i.t)b.appendChild(el('div','',i.t));
    function kv(k,v){var w=el('div','kv');w.appendChild(el('span','',k));w.appendChild(el('span','',v));b.appendChild(w)}
    if(i.n)kv('Developer',i.n);
    if(i.y)kv('License',i.y);
    (i.l||[]).forEach(function(l){
      if(!l||!/^https?:\/\//i.test(l[1]))return;
      var w=el('div','kv');w.appendChild(el('span','',l[0]||'Link'));
      var a=el('a','',l[1]);a.href=l[1];a.target='_blank';a.rel='noopener noreferrer';
      var s=el('span','');s.appendChild(a);w.appendChild(s);b.appendChild(w);
    });
    b.appendChild(el('div','sig',r.ok?''+r.fp:'Signature could not be verified (WebCrypto unavailable in this context)'));
  });
}

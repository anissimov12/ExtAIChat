/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* main.ts - entry point. */
(function(){
  var base=document.currentScript?document.currentScript.src.replace(/[^/]*$/,""):"js/";
  var PRE_UNLOCK=[
    'core/crypto',
    'core/vault',
    'core/about'
  ];
  var APP=[
    'core/config',
    'ui/icons',
    'core/state',
    'core/log',
    'ui/layout',
    'core/migrate',
    'ui/prefs',
    'ui/system-panel',
    'ui/fit',
    'ui/markdown',
    'ui/dom',
    'ui/attachments',
    'api/convert',
    'ui/attach-events',
    'ui/messages',
    'api/caps',
    'ui/header',
    'core/tokens',
    'ui/composer',
    'api/request',
    'api/chat',
    'api/title',
    'ui/chat-actions',
    'ui/chat-list',
    'api/models',
    'ui/settings',
    'ui/palette',
    'ui/menus',
    'ui/idle',
    'boot'
  ];
  function loadAll(list){
    return new Promise(function(ok,fail){
      var left=list.length,failed=false;
      if(!left)return ok();
      list.forEach(function(name){
        var s=document.createElement("script");
        s.src=base+name+".js";
        s.async=false;
        s.onload=function(){if(--left===0&&!failed)ok()};
        s.onerror=function(){if(!failed){failed=true;fail(new Error("failed to load "+base+name+".js"))}};
        document.head.appendChild(s);
      });
    });
  }
  function markReady(){
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      if(typeof bootReveal==="function")bootReveal();
      else document.body.classList.add("ready");
    })});
  }
  loadAll(PRE_UNLOCK)
    .then(function(){return VAULT.open()})
    .then(function(){return loadAll(APP)})
    .then(markReady)
    .catch(function(e){
      console.error("ExtAIChat:",e);
      markReady();
      var d=document.createElement("div");
      d.style.cssText="padding:16px;font:14px sans-serif;color:#f66";
      d.textContent="ExtAIChat failed to start: "+(e&&e.message||e);
      document.body.appendChild(d);
    });
})();

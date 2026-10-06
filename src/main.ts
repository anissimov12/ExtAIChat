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
  function load(name){
    return new Promise(function(ok,fail){
      var s=document.createElement("script");
      s.src=base+name+".js";
      s.onload=function(){ok()};
      s.onerror=function(){fail(new Error("failed to load "+s.src))};
      document.head.appendChild(s);
    });
  }
  function seq(list){return list.reduce(function(p,n){return p.then(function(){return load(n)})},Promise.resolve())}
  seq(PRE_UNLOCK)
    .then(function(){return VAULT.open()})
    .then(function(){return seq(APP)})
    .catch(function(e){
      console.error("ExtChat:",e);
      var d=document.createElement("div");
      d.style.cssText="padding:16px;font:14px sans-serif;color:#f66";
      d.textContent="ExtChat failed to start: "+(e&&e.message||e);
      document.body.appendChild(d);
    });
})();

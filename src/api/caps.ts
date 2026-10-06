/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/caps.ts - Thinking: model capabilities, effort levels, request params */
/* levels shown for THIS model come from the provider only: p.caps (GET /models) and
   S.tlearn (the levels the provider itself names in an error). Nothing is hardcoded here. */
/* explicit effort lists published by some providers/proxies */
var EFFKEYS=['supported_reasoning_efforts','supported_efforts','reasoning_efforts','thinking_efforts','efforts'];
function idList(v){
  if(!Array.isArray(v))return null;
  var r=v.map(function(x){return String(typeof x==='string'?x:(x&&(x.id||x.value))||'').toLowerCase()}).filter(Boolean);
  return r.length?r:null;
}
/* one /models entry → {think,levels,mode,bud,mandatory,def}; null = provider says nothing,
   mode 'adaptive'|'budget' (Anthropic), bud = per-level token budget when the provider reports it */
function readCaps(m){
  var c={think:null,levels:null,mode:null,bud:null,mandatory:false,def:null},cp=m.capabilities,r=m.reasoning;
  /* Anthropic: capabilities.thinking / capabilities.effort */
  if(cp&&typeof cp==='object'&&(cp.thinking||cp.effort)){
    var ty=(cp.thinking&&cp.thinking.types)||{};
    c.think=!!(cp.thinking&&cp.thinking.supported);
    if(c.think)c.mode=ty.adaptive&&ty.adaptive.supported?'adaptive':'budget';
    if(cp.effort&&typeof cp.effort==='object'){
      var lv=[],bud={};
      Object.keys(cp.effort).forEach(function(k){
        var e=cp.effort[k];
        if(!e||typeof e!=='object'||!e.supported)return;
        lv.push(k);
        var n=e.budget_tokens!=null?e.budget_tokens:e.budget!=null?e.budget:e.max_budget_tokens;
        if(typeof n==='number')bud[k]=n;
      });
      c.levels=lv.length?lv:null;
      c.bud=Object.keys(bud).length?bud:null;
    }
    return c;
  }
  /* OpenRouter: reasoning = {supported_efforts, default_effort, mandatory}; no block = no effort selection */
  if(r&&typeof r==='object'){
    var se=idList(r.supported_efforts||r.supportedEfforts);
    c.think=true;c.mandatory=!!r.mandatory;
    c.def=String(r.default_effort||r.defaultEffort||'').toLowerCase()||null;
    c.levels=se?se.filter(function(k){return k!=='none'}).reverse():null;
    return c;
  }
  /* explicit effort list (other proxies, gateways) */
  for(var i=0;i<EFFKEYS.length&&!c.levels;i++)c.levels=idList(m[EFFKEYS[i]]);
  if(!c.levels&&m.reasoning_options&&m.reasoning_options.effort)c.levels=idList(m.reasoning_options.effort.values);
  if(c.levels){c.think=true;return c}
  /* only a yes/no: supported_parameters */
  var sp=m.supported_parameters||m.supportedParameters;
  if(Array.isArray(sp))
    c.think=['reasoning','include_reasoning','reasoning_effort'].some(function(k){return sp.indexOf(k)>-1});
  return c;
}
/* OpenAI-style APIs list the accepted efforts in the error text ("Supported values are: …") - remember them */
function learnEfforts(msg,p,model,tried){
  if(!/effort|reasoning/i.test(msg))return;
  msg=msg.replace(/\\/g,'');
  var m=/(?<![a-z])supported values?(?:\s+are)?\s*:\s*([^.]*)/i.exec(msg);if(!m)return;
  var ids=(m[1].match(/['"`]([\w.\-]+)['"`]/g)||[]).map(function(x){return x.slice(1,-1).toLowerCase()}).filter(function(k){return k!=='none'});
  if(!ids.length)return;
  var key=customKey(p,model);
  S.tlearn[key]=ids;
  if(S.tcust[key])S.tcust[key]=S.tcust[key].filter(function(k){return ids.indexOf(k)>-1||k!==tried});
  saveC();drawStatus();L('ok','effort levels learned from API: '+ids.join(', '));
}
/* caps refresh themselves: all providers at start, the current one later when missing or >6 h old;
   a failed attempt is not retried for 5 min, one provider is never loaded twice at once */
function refreshCaps(p,force){
  if(!p||!p.url)return;
  var now=Date.now(),job=refreshCaps.job||(refreshCaps.job={});
  if(job[p.id]&&(job[p.id]===true||now-job[p.id]<5*60e3))return;
  if(!force&&p.caps&&now-(p.capsAt||0)<6*3600e3)return;
  job[p.id]=true;
  loadModels(p).then(function(){
    job[p.id]=0;
    if(p.id===S.pid){
      drawStatus();
      if($('tm').classList.contains('on')){var n=thinkItems('');TI=n.items;drawThink()}
    }
  }).catch(function(er){
    job[p.id]=Date.now();
    L('err',p.name+': capabilities: '+(er instanceof TypeError?'no connection / CORS':er.message));
  });
}
function ensureCaps(){if(S.model)refreshCaps(prov(),false)}
function refreshAllCaps(){S.providers.forEach(function(p){refreshCaps(p,true)})}
function customKey(p,model){return p.id+'|'+model}
function thinkInfo(){
  var p=prov(),model=S.model;
  if(!p||!model)return {levels:[],note:'select a model first',cap:null,mandatory:false,def:null};
  var key=customKey(p,model),c=(p.caps&&p.caps[model])||null,learned=S.tlearn[key],levels,note;
  if(c&&c.think===false){levels=[];note='this model has no reasoning (reported by provider)'}
  else if(c&&c.levels){levels=c.levels.slice();note='levels reported by provider'}
  else if(learned){levels=learned.slice();note='levels learned from API response'}
  else{
    levels=[];
    note=!p.caps?'loading model info…':c&&c.think?'reasoning supported, levels not reported':'provider does not report effort levels for this model';
  }
  (S.tcust[key]||[]).forEach(function(k){if(levels.indexOf(k)<0)levels.push(k)});
  return {levels:levels,note:note,cap:c,mandatory:!!(c&&c.mandatory),def:c&&c.def};
}
function thinkLevels(){return thinkInfo().levels}
/* writes the reasoning part of a request body for the chosen level */
function isOpenRouter(p){try{return /(^|\.)openrouter\.ai$/.test(new URL(p.url).hostname)}catch(e){return false}}
function applyThink(api,p,body,eff,cap){
  if(eff==='none')return;
  if(api==='messages'){
    if(cap&&cap.mode==='adaptive'){body.thinking={type:'adaptive',display:'summarized'};body.output_config={effort:eff};return}
    var bud=cap&&cap.bud?cap.bud[eff]:0;
    if(!bud)return; /* the provider reported no token budget for this level - nothing to send */
    body.thinking={type:'enabled',budget_tokens:bud};body.max_tokens=Math.max(body.max_tokens,bud+1024);
  }else if(api==='responses')body.reasoning={effort:eff,summary:'auto'};
  else if(isOpenRouter(p))body.reasoning={effort:eff};
  else body.reasoning_effort=eff;
}
function thinkNow(){var i=thinkInfo(),lv=i.levels;if(lv.indexOf(S.think)>-1)return S.think;return i.mandatory&&lv.length?(lv.indexOf(i.def)>-1?i.def:lv[Math.floor(lv.length/2)]):'none'}

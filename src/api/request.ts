/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/request.ts - Headers, base URL, endpoint */
var HX=[['responses','Responses API'],['chat','Chat Completions API'],['messages','Messages API (Anthropic)']];
function hdrParse(t){
  t=(t||'').trim();if(!t)return {};
  var o=JSON.parse(t);
  if(!o||typeof o!=='object'||Array.isArray(o))throw new Error('must be a JSON object');
  return o;
}
function headers(p){
  var h={'Content-Type':'application/json'};
  if(apiOf(p)==='messages'){if(p.key)h['x-api-key']=p.key;h['anthropic-version']='2023-06-01';h['anthropic-dangerous-direct-browser-access']='true'}
  else if(p.key)h.Authorization='Bearer '+p.key;
  try{var x=hdrParse((S.hdr||{})[apiOf(p)]);Object.keys(x).forEach(function(k){if(x[k]===null)delete h[k];else h[k]=String(x[k])})}catch(e){}
  return h;
}
function baseUrl(p){return p.url.trim().replace(/\/+$/,'').replace(/\/(chat\/completions|responses|messages)$/,'')}
function endpoint(p){return baseUrl(p)+EP[apiOf(p)]}

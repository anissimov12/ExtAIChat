/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/models.ts - GET /models */
/* per-model capabilities are normalised by readCaps() and kept in p.caps */
async function loadModels(p){
  var base=baseUrl(p),url=base+'/models'+(apiOf(p)==='messages'?'?limit=1000':'');
  L('req','GET '+url);
  var res=await fetch(url,{headers:headers(p)});
  if(!res.ok)throw new Error('HTTP '+res.status);
  var j=await res.json(),a=j.data||j.models||[];
  var caps={};
  p.models=a.map(function(m){
    if(typeof m==='string')return m;
    var id=m.id||m.name;
    if(id)caps[id]=readCaps(m);
    return id;
  }).filter(Boolean).sort();
  p.caps=caps;p.capsAt=Date.now();
  saveC();L('ok','models: '+p.models.length);return p.models.length;
}

/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/migrate.ts - Normalisation of loaded settings + parameter defaults */
/* left panel: prompt, presets, parameters */
if(typeof S.sys!=='string')S.sys='';
/* thinking levels: S.tcust - per provider+model; drop legacy state from older bundles */
if(S.think==='off')S.think='none';
if(!S.tcust||typeof S.tcust!=='object'||Array.isArray(S.tcust))S.tcust={};
delete S.tcusts;
if(!S.tlearn||typeof S.tlearn!=='object'||Array.isArray(S.tlearn))S.tlearn={};
S.providers.forEach(function(p){delete p.mmeta});
if(!Array.isArray(S.presets))S.presets=[];
/* custom headers: every API type starts with the default; an emptied box stays empty */
if(!S.hdr||typeof S.hdr!=='object'||Array.isArray(S.hdr))S.hdr={};
APIS.forEach(function(a){if(typeof S.hdr[a[0]]!=='string')S.hdr[a[0]]=DEFHDR});
var DEF={temp:0.7,topp:'',topk:'',max:''};

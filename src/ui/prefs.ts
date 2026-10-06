/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/prefs.ts - Appearance preferences */
/* MARK: prefs */
var PF={font:'inter',theme:'grey',scale:1.15,fsize:13.5,mwidth:0,tkopen:false,smooth:true,ltime:true,newchat:true,hello:"Let's start~"};
var FONTS=[['inter','Inter'],['plex','IBM Plex Sans'],['system','System UI'],['serif','Georgia'],['mono','IBM Plex Mono']];
var THEMES=[['ink','Ink'],['grey','Grey']];
Object.keys(PF).forEach(function(k){if(S[k]==null)S[k]=PF[k]});
function applyPrefs(){
  var f=S.font,i=FONTS.findIndex(function(x){return x[0]===f});
  var r=document.documentElement;
  r.style.setProperty('--ui-font','"'+(i>-1?FONTS[i][1]:'Inter')+'"');
  r.style.setProperty('--msg-size',S.fsize+'px');
  /* the whole interface scales through one factor on the root, so 100% of it is the window */
  r.style.setProperty('--ui-zoom',(+S.scale||1));
  r.dataset.theme=THEMES.some(function(x){return x[0]===S.theme})?S.theme:PF.theme;
  /* null = follow the viewport defaults; set on <body> so the width media queries on <html> still win */
  document.body.style[S.mwidth?'setProperty':'removeProperty']('--uicw',S.mwidth?S.mwidth+'px':'');
  document.body.classList.toggle('lgt',S.ltime!==false);
}
applyPrefs();

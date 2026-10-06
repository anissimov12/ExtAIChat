/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/system-panel.ts - Left panel: system prompt, presets, sampling parameters */
function sysCount(){$('sysn').textContent=S.sys.length+' chars'}
function drawPre(){
  var i=S.presets.findIndex(function(x){return x.text===S.sys});
  $('spre').innerHTML='<option value="">'+(S.presets.length?'Presets…':'No presets yet')+'</option>'+S.presets.map(function(x,k){return '<option value="'+k+'">'+esc(x.name)+'</option>'}).join('');
  $('spre').value=i>-1&&S.sys?String(i):'';
  $('spd').disabled=!$('spre').value;
}
function setSys(v){S.sys=v;$('sys').value=v;saveC();sysCount();drawPre()}
function drawPar(){
  $('tpS').querySelectorAll('[data-k]').forEach(function(i){i.value=S[i.dataset.k]});
  $('stm').checked=S.stream!==false;
}
$('sys').value=S.sys;sysCount();drawPre();drawPar();
$('sys').addEventListener('input',function(){S.sys=this.value;saveC();sysCount();drawPre()});
$('sys').addEventListener('change',function(){L('cfg','sys = ['+this.value.length+' chars]')});
$('syc').onclick=function(){setSys('');L('cfg','sys cleared');$('sys').focus()};
$('spre').onchange=function(){
  var x=S.presets[+this.value];
  if(!x){drawPre();return}
  setSys(x.text);L('cfg','preset: '+x.name);
};
$('sps').onclick=function(){
  var cu=S.presets[+$('spre').value],n=$('spn').value.trim()||(cu&&cu.name)||'';
  if(!n||!S.sys){$('spn').focus();return}
  var i=S.presets.findIndex(function(x){return x.name===n});
  if(i>-1)S.presets[i].text=S.sys;else S.presets.push({name:n,text:S.sys});
  saveC();$('spn').value='';drawPre();L('cfg','preset saved: '+n);
};
$('spd').onclick=function(){
  var i=+$('spre').value,x=S.presets[i];if(!x)return;
  S.presets.splice(i,1);saveC();drawPre();L('cfg','preset deleted: '+x.name);
};
$('tpS').addEventListener('change',function(e){
  var i=e.target;
  if(i.dataset.k){S[i.dataset.k]=(i.type==='number'&&i.value!=='')?+i.value:i.value;saveC();L('cfg',i.dataset.k+' = '+(i.value===''?'—':i.value))}
  if(i.id==='stm'){S.stream=i.checked;saveC();L('cfg','stream = '+i.checked)}
});
$('prs').onclick=function(){Object.assign(S,DEF,{stream:true});saveC();drawPar();L('cfg','parameters reset')};

/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* api/convert.ts - Message content converters for the 3 API shapes */
function attText(a){return '--- '+a.name+' ---\n'+a.text}
function cChat(m){ /* OpenAI-compatible multimodal */
  if(!m.att||!m.att.length)return m.content||'';
  var o=[{type:'text',text:m.content||''}];
  m.att.forEach(function(a){o.push(a.k==='image'?{type:'image_url',image_url:{url:a.url}}:{type:'text',text:attText(a)})});
  return o;
}
function cMsgs(m){ /* Anthropic: images must be raw base64 */
  if(!m.att||!m.att.length)return m.content||'';
  var o=[{type:'text',text:m.content||''}];
  m.att.forEach(function(a){
    if(a.k==='image'){var d=/^data:([^;]+);base64,([\s\S]*)$/.exec(a.url);
      o.push({type:'image',source:{type:'base64',media_type:d?d[1]:'image/webp',data:d?d[2]:''}});
    }else o.push({type:'text',text:attText(a)});
  });
  return o;
}
function cResp(m){ /* Responses API */
  if(!m.att||!m.att.length)return m.content||'';
  var o=[{type:'input_text',text:m.content||''}];
  m.att.forEach(function(a){o.push(a.k==='image'?{type:'input_image',image_url:a.url}:{type:'input_text',text:attText(a)})});
  return o;
}

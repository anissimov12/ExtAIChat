/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/markdown.ts - Markdown + KaTeX rendering */
/* MARK: markdown */
var MR=/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^\s$](?:[^$\n]*?[^\s$])?)\$(?!\d)/g;
function md(t){
  if(!window.marked)return esc(t).replace(/\n/g,'<br>');
  var M=[];
  t=t.split(/(```[\s\S]*?(?:```|$)|`[^`\n]+`)/).map(function(s,i){
    return i%2?s:s.replace(MR,function(m,a,b,c,d){M.push([a||b||c||d,a!=null||b!=null]);return 'KTXPH'+(M.length-1)+'END'});
  }).join('');
  var h=marked.parse(t,{gfm:true,breaks:true});
  if(window.DOMPurify)h=DOMPurify.sanitize(h);
  h=h.replace(/<a /g,'<a target="_blank" rel="noopener noreferrer" ');
  /* fenced blocks whose language hljs knows get token spans; auto-detection is
     deliberately off - an unlabeled block must not switch language every frame */
  if(window.hljs&&window.hljs.highlight)h=h.replace(/<pre><code class="language-([^"]*)">([\s\S]*?)<\/code><\/pre>/g,function(m,lang,code){
    var l=lang.toLowerCase(),g=null;
    try{g=window.hljs.getLanguage(l)}catch(e){}
    if(!g)return m;
    try{
      var raw=code.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
      var r=window.hljs.highlight(raw,{language:l,ignoreIllegals:true});
      return '<pre><code class="language-'+lang+' hljs">'+r.value+'</code></pre>';
    }catch(e){return m}
  });
  return h.replace(/KTXPH(\d+)END/g,function(_,n){
    var x=M[n];if(!window.katex)return esc(x[0]);
    try{return katex.renderToString(x[0],{displayMode:x[1],throwOnError:false})}catch(e){return esc(x[0])}
  });
}

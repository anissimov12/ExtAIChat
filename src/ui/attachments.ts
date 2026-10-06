/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/attachments.ts - Attachments: add, shrink images, draw chips */
/* MARK: attachments */
var AT=[],ATSEQ=0,MAXATT=6,IMGSIDE=1600,TXTMAX=20000;
var TXT=/\.(txt|md|markdown|json|jsonl|csv|tsv|log|js|mjs|cjs|ts|tsx|jsx|py|rb|go|rs|java|c|h|cpp|hpp|cs|php|sh|bash|zsh|yml|yaml|toml|ini|cfg|conf|env|sql|html|htm|css|scss|less|xml|svg)$/i;
function kb(n){return n<1024?n+' B':n<1048576?Math.round(n/1024)+' KB':(n/1048576).toFixed(1)+' MB'}
function shrink(f,cb){
  var fr=new FileReader();
  fr.onload=function(){
    var im=new Image();
    im.onload=function(){
      var w=im.width,h=im.height,s=Math.min(1,IMGSIDE/Math.max(w,h));
      if(s===1&&f.size<350*1024)return cb(fr.result); /* small png stays as is */
      var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));
      var x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);
      var u='';
      try{u=c.toDataURL('image/webp',.82)}catch(e){}
      if(u.indexOf('data:image/webp')!==0)u=c.toDataURL('image/jpeg',.82);
      cb(u);
    };
    im.onerror=function(){cb(fr.result)};
    im.src=fr.result;
  };
  fr.readAsDataURL(f);
}
function addFiles(list){
  Array.prototype.slice.call(list||[]).forEach(function(f){
    if(!f)return;
    if(AT.length>=MAXATT)return;
    if(/^image\//.test(f.type)){
      shrink(f,function(url){AT.push({id:++ATSEQ,k:'image',name:f.name||'image',url:url,size:f.size});drawAtt();L('att',(f.name||'image')+' · '+kb(f.size))});
    }else if(TXT.test(f.name)||/^text\//.test(f.type)||f.type==='application/json'){
      if(f.size>3*1048576){L('err','too large: '+f.name);return}
      var fr=new FileReader();
      fr.onload=function(){var t=String(fr.result||'');
        if(AT.length>=MAXATT)return;
        AT.push({id:++ATSEQ,k:'text',name:f.name,text:t.slice(0,TXTMAX),size:f.size});
        drawAtt();L('att',f.name+' · '+t.length+' chars');
      };
      fr.onerror=function(){L('err','could not read: '+f.name)};
      fr.readAsText(f);
    }else L('err','unsupported type: '+(f.name||f.type));
  });
  inp.focus();
}
function drawAtt(){
    var b=$('atb');b.textContent='';updSend();
  AT.forEach(function(a){
    var d=document.createElement('div');d.className='at';
    d.innerHTML=(a.k==='image'?'<img src="'+a.url+'" alt="">':'')+
      '<b></b><i></i><button type="button" title="Remove" aria-label="Remove '+esc(a.name)+'">×</button>';
    d.querySelector('b').textContent=a.name;
    d.querySelector('i').textContent=a.k==='image'?kb(a.size):a.text.length+' ch';
    d.querySelector('button').onclick=function(){AT=AT.filter(function(x){return x.id!==a.id});drawAtt()};
    b.appendChild(d);
  });
  $('ba').classList.toggle('on',AT.length>0);
}
function attBlock(att){
  if(!att||!att.length)return null;
  var d=document.createElement('div');d.className='uatt';
  att.forEach(function(a){
    if(a.k==='image'){
      var im=document.createElement('img');im.src=a.url;im.alt=a.name;im.title=a.name;
      im.onclick=function(){window.open(a.url,'_blank','noopener')};
      d.appendChild(im);
    }else{
      var f=document.createElement('div');f.className='f';f.textContent='file · '+a.name+' · '+a.text.length+' ch';d.appendChild(f);
    }
  });
  return d;
}

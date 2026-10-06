/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* ui/attach-events.ts - Attachment input events: button, paste, drag & drop */
$('ba').onclick=function(){$('fp').click()};
$('fp').onchange=function(){addFiles(this.files);this.value=''};
inp.addEventListener('paste',function(e){
  var it=e.clipboardData&&e.clipboardData.items;if(!it)return;
  var fs=[];
  for(var i=0;i<it.length;i++)if(it[i].type.indexOf('image')===0){var f=it[i].getAsFile();if(f)fs.push(f)}
  if(fs.length){e.preventDefault();addFiles(fs)}
});
addEventListener('dragover',function(e){
  var t=e.dataTransfer;if(!t)return;
  for(var i=0;i<t.types.length;i++)if(t.types[i]==='Files'){e.preventDefault();document.body.classList.add('dz');return}
});
addEventListener('dragleave',function(e){if(!e.relatedTarget)document.body.classList.remove('dz')});
addEventListener('dragend',function(){document.body.classList.remove('dz')});
addEventListener('drop',function(e){
  var t=e.dataTransfer;if(!t||!t.files||!t.files.length)return;
  e.preventDefault();document.body.classList.remove('dz');addFiles(t.files);
});

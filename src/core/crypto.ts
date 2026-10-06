/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/crypto.ts - Byte/base64 helpers and the default storage passphrase */
var te=new TextEncoder(),td=new TextDecoder();
/* Default storage passphrase. Used only for first-run automatic encryption. */
var PASSPHASE='any_text';
function b64(u){var s='';for(var i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)}
function unb64(s){var r=atob(s),u=new Uint8Array(r.length);for(var i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return u}

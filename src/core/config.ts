/*   Copyright (C) 2026 myryafka     .
.  Please preserve the attribution   .
.      github.com/anissimov12       */

// @ts-nocheck
/* core/config.ts - config.*/
var $=function(i){return document.getElementById(i)};
var PRESETS=[['OpenAI','https://api.openai.com/v1','responses'],['Anthropic','https://api.anthropic.com/v1','messages'],['Google AI','https://generativelanguage.googleapis.com/v1beta/openai','chat'],['OpenRouter','https://openrouter.ai/api/v1','chat'],['Groq','https://api.groq.com/openai/v1','chat'],['Ollama','http://localhost:11434/v1','chat'],['Custom endpoint','','chat']];
var APIS=[['responses','Responses'],['chat','Chat Completions'],['messages','Messages (Anthropic)']];
var EP={chat:'/chat/completions',responses:'/responses',messages:'/messages'};
var DEFHDR='{\n  "X-Title": "ExtAIChat"\n}';
/* app version: taken from manifest.json at runtime, falls back to the constant below */
var APPVER=(function(){try{var m=(typeof chrome!=='undefined'&&chrome.runtime&&chrome.runtime.getManifest)?chrome.runtime.getManifest():null;if(m&&m.version)return m.version}catch(e){}return '0.0.1'})();
var CMD=[['model','choose model'],['thinking','reasoning effort'],['clear','clear chat'],['about','developer info'],['version','show version']];
var TABS=[['prov','Providers'],['app','Appearance'],['extra','Extra'],['data','Data']];

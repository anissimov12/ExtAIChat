'use strict';
browser.browserAction.onClicked.addListener(function(){
  browser.tabs.create({url:browser.runtime.getURL('chat.html')});
});

'use strict';
browser.action.onClicked.addListener(function(){
  browser.tabs.create({url:browser.runtime.getURL('chat.html')});
});

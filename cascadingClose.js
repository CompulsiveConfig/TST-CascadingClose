'use strict';

async function getTSTWindowList() {
    const windowResult = await browser.runtime.sendMessage(TST_ID, {
      type:   'get-tree',
      window: await browser.windows.getCurrent().id,
      tabs:   '*'
    })
    console.log(windowResult);
    return windowResult;
}

async function getTrimmedList(windowList) {
    const fullList = await windowList;
    const activeTabIndex = fullList.find(element =>
      element.active === true)["index"];

    console.log(activeTabIndex);

    const trimmedList = fullList.slice(activeTabIndex);
   
    trimmedList.shift();

    console.log(trimmedList);
    
    return trimmedList; 
}

async function closeWindows(windowList) {
    const closeList = await windowList; 

    for (let i = 0, l = closeList.length; i < l; i++) {
        browser.tabs.remove(closeList[i].id);
    }
}
    
function executeClose() {
    getTSTWindowList().then((initialList) =>
        getTrimmedList(initialList).then((processedList) =>
            closeWindows(processedList)
        )
    );
}


function handleMessage(request, sender, sendResponse) {
  console.log("Message from the content script: " +
    request.greeting);
    executeClose();
  sendResponse({response: "executeClose executed"});
}

/*
 This is a boilerplate to implement a helper addon for Tree Style Tab
 based on its API.
 https://github.com/piroor/treestyletab/wiki/API-for-other-addons

 license: The MIT License, Copyright (c) 2020 YUKI "Piro" Hiroshi
 original:
   http://github.com/piroor/treestyletab/blob/trunk/doc/boilerplate-helper-background.js
*/


const TST_ID = 'treestyletab@piro.sakura.ne.jp';

async function registerToTST() {
  try {
    const result = await browser.runtime.sendMessage(TST_ID, {
      type: 'register-self',

      // Basic information of your addon.
      // name:  browser.i18n.getMessage('tst-cascadingclose@comp.moe'),
      // icons: browser.runtime.getManifest().icons,

      // The list of listening message types. (optional)
      // Available message types are listed at:
      // https://github.com/piroor/treestyletab/wiki/API-for-other-addons#notified-message-types
      listeningTypes: [
        'wait-for-shutdown', // This is required to trigger teardown process for this addon on TST side.
        'ready'
      ]

    });
  }
  catch(_error) {
      console.log("Could not register to TST")
  }
}
registerToTST();

async function uninitFeaturesForTST() {
  // Put codes to deactivate special features for TST here.
}
async function waitForTSTShutdown() {
  try {
    // https://github.com/piroor/treestyletab/wiki/API-for-other-addons#wait-for-shutdown-type-message
    await browser.runtime.sendMessage(TST_ID, { type: 'wait-for-shutdown' });
  } catch (error) {
    // Extension was disabled before message was sent:
    if (error.message.startsWith('Could not establish connection. Receiving end does not exist.'))
      return true;
    // Extension was disabled while we waited:
    if (error.message.startsWith('Message manager disconnected'))
      return true;
    // Probably an internal Tree Style Tab error:
    throw error;
  }
}
waitForTSTShutdown().then(uninitFeaturesForTST);

browser.runtime.onMessageExternal.addListener((message, sender) => {
  if (sender.id == TST_ID) {
    switch (message && message.type) {
      // Triggers initialization process when TST is reloaded after this addon.
      // https://github.com/piroor/treestyletab/wiki/API-for-other-addons#auto-re-registering-on-the-startup-of-tst
      case 'ready':
        registerToTST();
        break;

      // Triggers teardown process for this addon on TST side.
      // https://github.com/piroor/treestyletab/wiki/API-for-other-addons#unregister-from-tst
      case 'wait-for-shutdown':
        return new Promise(() => {});

      // ...
    }
  }
})

browser.runtime.onMessage.addListener(handleMessage);

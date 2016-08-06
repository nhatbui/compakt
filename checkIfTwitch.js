chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.twitchChat) {
      chrome.pageAction.show(sender.tab.id);
      chrome.pageAction.setTitle({tabId: sender.tab.id, title: "Compakting..."});
      sendResponse({registered: true});
    }
  });

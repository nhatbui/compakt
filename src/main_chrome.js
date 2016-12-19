var $ = require('jquery');
var Compakt = require('./compakt.js');

var compakt = new Compakt(50);

// configuration of the observer:
var config = {attributes: false, childList: true, characterData: false};

// The chat, particularly the element ".chat-lines", is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We hijack MutationObserver as a way to check if an added, the chat.
var htmlBody = $('body')[0];
var chatLoadedObserver = new MutationObserver(function(mutations, observer) {
    mutations.forEach(function(mutation) {
        var chatSelector = $(twitchChatUlClass);
        if (chatSelector.length > 0) {
            // Select the node element.
            var target = chatSelector[0];

            // Pass in the target node, as well as the observer options
            compakt.observe(target, config);

            // Alert page action that we found a chat and we're going to get to work.
            chrome.runtime.sendMessage({twitchChat: true}, function(response) {
              if (response.registered) {
                console.log('Twitch Chat found.');
              }
            });

            // Unregister chatLoadedObserver. We don't need to check for the chat element anymore.
            observer.disconnect();
        }
    });
});

chatLoadedObserver.observe(htmlBody, config);

var Compakt = require("./compakt.js");
var vars = require("./twitchvars.js");
var compakt = new Compakt(50);

// configuration of the observer:
var config = {attributes: false, childList: true, characterData: false};

// The chat, particularly the element ".chat-lines", is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We hijack MutationObserver as a way to check if an added element is the chat.

// Grab the HTML body element.
var htmlBody = $("body")[0];

// Define the behavior of the observer. As nodes are added, check if Twitch
// chat is finally loaded and attach 'compakt' to it.
var chatLoadedObserver = new MutationObserver(function (mutations, observer) {
    // For each node...
    mutations.forEach(function (mutation) {
        // ...check if the chat has been added.
        var chatSelector = $(vars.chatULSelector);
        if (chatSelector.length > 0) {
            // Select the node element.
            var target = chatSelector[0];

            // Pass in the target node, as well as the observer options
            compakt.observe(target, config);

            // Alert page action that we found a chat and we're going to get to work.
            chrome.runtime.sendMessage({twitchChat: true}, function (response) {
              if (response.registered) {
                console.log("Twitch Chat found.");
              }
            });
        }
    })
});

chatLoadedObserver.observe(htmlBody, config);

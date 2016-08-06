// Ordered Dictionary class


// Helper Methods
function replaceMessageText(element, newMsg) {
  element.text(newMsg);
}

function wrapInRepeatedWordClass(str) {
  return "<span class='repeated-word'>" + str + "</span>";
}

// Simple compression. Adjacent, repeated strings are compressed to one instance
// followed by "x [n]" where n is the number of times it is repeated.
function compressMessage(msg) {
  var msgArray = msg.split(" ");
  var prevString = msgArray[0];
  var count = 1;
  var newStr = "";
  for(var i = 1; i < msgArray.length; i++) {
    var word = msgArray[i];
    if(word === "" || word === "\n"){
      // Newlines and blank spaces are HTML we skipped.
      // We won't need this if we handle them correctly.
      continue;
    }
    if(prevString === word) {
      count += 1;
    } else {
      if(count === 1) {
        newStr += prevString + " ";
      } else {
        newStr += wrapInRepeatedWordClass(prevString + " x" + count) + " ";
      }
      count = 1;
      prevString = word;
    }
  }
  if(count === 1) {
    newStr += prevString;
  } else {
    newStr += wrapInRepeatedWordClass(prevString + " x" + count);
  }

  return newStr;
}

// Attach listener that acts when a new chat message appears.
var chatObserver = new MutationObserver(function (mutations) {
  // For each mutation object, we want the addedNode object
  mutations.forEach(function (mutation) {
    // Chat message should be the added node
    mutation.addedNodes.forEach(function (addedNode) {
      var chatMessage = $(addedNode);
      // Grab the actual span element with the message content
      var messageElement = chatMessage.children(".message");

      // TODO: We lose emotes (e.g. kappa). Fix!
      var newMessage = compressMessage(messageElement.text());
      replaceMessageText(messageElement, "");
      messageElement.append(newMessage);
      messageElement.append("&#10003;");
    })
  })
});

// configuration of the observer:
var config = { attributes: false, childList: true, characterData: false };

// The chat, particularly the element ".chat-lines", is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We hijack MutationObserver as a way to check that when a child is added if
// the chat now exists.
var htmlBody = $("body")[0];
var chatLoadedObserver = new MutationObserver(function (mutations, observer) {
  mutations.forEach(function (mutation) {
    var chatSelector = $(".chat-lines");
    if(chatSelector.length > 0) {
      // This is the class name for the chat side-panel on Twitch
      var target = chatSelector[0];

      // pass in the target node, as well as the observer options
      chatObserver.observe(target, config);

      // Alert page action that we found a chat and we're going to get to work.
      chrome.runtime.sendMessage({twitchChat: true}, function(response) {
        if(response.registered) {
          console.log("Twitch Chat found.");
        }
      });

      // Unregister chatLoadedObserver. We don't need to check for the chat element.
      observer.disconnect();
    }
  })
})
chatLoadedObserver.observe(htmlBody, config);

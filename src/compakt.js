var $ = require("jquery");
var clib = require("./compress.js");
var twitch = require("./twitchvars.js");
var MinHash = require("libminhash");

function checkMessageSimilarity(key, dict, minhash) {
  if (key in dict) {
    return { 'repeated': true, 'key': key };
  } else {
    return { 'repeated': false };
  }
}

function checkIfMessageRepeated(key, dict, order, cache_size, messageElement,
  chatMessage, minhash) {
  var similarityResult = checkMessageSimilarity(key, dict, minhash);
  if (similarityResult['repeated']) {
    var accessKey = similarityResult['key'];
    // Update cached message
    var msgEle = $(dict[accessKey].ele);

    // If this is the first repeat, we need to add some elements.
    if (dict[accessKey].count === 1) {
      // Add count element.
      msgEle.append("<span class='count'></span>");
    }

    // Display new count.
    dict[accessKey].count += 1;
    var countEle = msgEle.children(".count");
    countEle.text(dict[accessKey].count);

    // Don't show it, it's a repeat.
    // Note: we would like to .remove() it but this causes errors with
    // the ember framework Twitch uses.
    chatMessage.hide();
  } else {
    // Add unique message to cache.

    // Sanitize the message.
    // Method does this "in-place" (edits existing DOM element).
    var newMsgEle = clib.getCompressedHTML(messageElement);
    if(newMsgEle) {
      messageElement.replaceWith(newMsgEle);
    }

    // Update the ordered dictionary
    dict[key] = {
      ele: chatMessage,
      count: 1,
      signatures: minhash.computeSignature(key)
    };
    order.push(key);

    // Pop old messages if we're over the size limit.
    if (order.length > cache_size) {
      // Add a check-mark to distinguish that the message has expired.
      var oldChatMessage = dict[order[0]].ele;
      oldChatMessage.append("&#10003;");

      // now delete.
      var deleteKey = order.shift();
      delete dict[deleteKey];
    }
  }
}

// Compakt
function Compakt(cache_size) {
    // Ordered Dictionary objects
    var dict = {};
    var order = [];

    // Generate a & b for x Hash functions.
    var numHashes = 10;
    var shingle_size = 9;
    var minhash = MinHash(shingle_size, numHashes);

    // Attach listener that acts when a new chat message appears.
    return new MutationObserver(function (mutations) {
        // For each mutation object, we want the addedNode object
        mutations.forEach(function (mutation) {
            // Chat message should be the added node
            mutation.addedNodes.forEach(function (addedNode) {
                // At this point it's potentially a chatMessage object.
                var chatMessage = $(addedNode);
                if (!chatMessage.is(twitch.chatMsgClass1, twitch.chatMsgClass2)) {
                    // this isn't a chat message, skip processing.
                    return;
                }
                // Grab the actual span element with the message content
                var messageElement = chatMessage.children(twitch.chatMsgContent);

                // Make key from message.
                var key = clib.getKey(messageElement);
                checkIfMessageRepeated(key, dict, order, cache_size,
                  messageElement, chatMessage, minhash);
            });
        });
    });
}

module.exports = Compakt;

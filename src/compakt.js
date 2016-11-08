var $ = require("jquery");
var clib = require("./compress.js");
var twitch = require("./twitchvars.js");

function checkMessageSimilarity(key, dict) {
  if (key in dict) {
    return true;
  } else {
    return false;
  }
}

function checkIfMessageRepeated(key, dict, order, size, messageElement, chatMessage) {
  if (checkMessageSimilarity(key, dict)) {
    // Update cached message
    var msgEle = $(dict[key].ele);

    // If this is the first repeat, we need to add some elements.
    if (dict[key].count === 1) {
      // Add count element.
      msgEle.append("<span class='count'></span>");

      // Add a dropdown menu of people who have said this repeated msg.
      var originalMsgFrom = msgEle.children(".from");
      // Add this write after the username and before the colon.
      originalMsgFrom.after("<div class='compakt-dropdown'><button class='compakt-dropbtn'>&#9660;</button><div class='compakt-dropdown-content'></div></div>");
    }

    // Display new count.
    dict[key].count += 1;
    var countEle = msgEle.children(".count");
    countEle.text(dict[key].count);

    // Add user to dropdown menu of a repeated message.
    var dropdownMenu = msgEle.find(".compakt-dropdown-content");
    var userEle = chatMessage.children(".from");
    dropdownMenu.append(userEle);

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
    dict[key] = {ele: chatMessage, count: 1};
    order.push(key);

    // Pop old messages if we're over the size limit.
    if (order.length > size) {
      // Add a check-mark to distinguish that the message has expired.
      var oldChatMessage = dict[order[0]].ele;
      oldChatMessage.append("&#10003;");

      // now delete.
      delete dict[order.shift()];
    }
  }
}

// Compakt
function Compakt(size) {
    // Ordered Dictionary objects
    var dict = {};
    var order = [];

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
                checkIfMessageRepeated(key, dict, order, size, messageElement, chatMessage);
            });
        });
    });
}

module.exports = Compakt;

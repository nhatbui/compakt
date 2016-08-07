// Compakt

// These are variables for Twitch elements related to chat.
// We expose them here so changes can be easily made if Twitch changes them.
twitchChatUlClass = ".chat-lines";
twitchChatMessageClass1 = ".message-line";
twitchChatMessageClass2 = ".chat-line";
twitchChatMessageContent = ".message";

// Ordered Dictionary class
dict = {};
order = [];
size = 25;

// Helper Methods
function wrapInRepeatedWordClass(str) {
  return "<span class='repeated-word'>" + str + "</span>";
}

function compressStr(msg) {
  // Simple compression. Adjacent, repeated strings are compressed to one instance
  // followed by "x [n]" where n is the number of times it is repeated.
  var msgArray = msg.split(" ");
  var prevString = msgArray[0];
  var count = 1;
  var newStr = "";
  for (var i = 1; i < msgArray.length; i++) {
    var word = msgArray[i];

    if (prevString === word) {
      count += 1;
    } else {
      if (count === 1) {
        newStr += prevString + " ";
      } else {
        newStr += wrapInRepeatedWordClass(prevString + " x" + count) + " ";
      }
      count = 1;
      prevString = word;
    }
  }
  if (count === 1) {
    newStr += prevString;
  } else {
    newStr += wrapInRepeatedWordClass(prevString + " x" + count);
  }
  return newStr;
}

function compressMessageReadable(messageElement) {
  // Takes a Twitch chat message element and makes a Compakt version.
  // For a message, each node type is handled differently.
  //   1.Text nodes with repeated, consecutive words are replaced with an element
  // showing the word once and a multiplier.
  //   2. Comment nodes are skipped.
  //   3. Repeated, consecutive element nodes are replaced with an element showing
  // the element once next to a multplier equal to the number of times it's shown.

  // Note: we assume if we ever encounter any element nodes that they are
  // Twitch emoticons.

  var chatLine = messageElement.contents();

  var prevElement = null;
  var count = 0;

  for (var i = 0; i < chatLine.length; i++) {
    var type = chatLine[i].nodeType;
    if (type === 3) {
      // Text node
      if (chatLine[i].data.trim() === "") {
        // Gotta skip those weird nodes that are not rendered on screen but
        // exist in the HTML doc.
        continue;
      }

      // Replaces repeated, consecutive words with the multiplier element.
      // HTML will be injected here. We assume it's safe because we wrote
      // compressStr()
      var newMsg = compressStr(chatLine[i].data.trim());

      // Replaces text node with element node.
      // TODO: we make a text node into HTML. CHECK FOR SCRIPT INJECTION!
      var temp = document.createElement('span');
      temp.innerHTML = newMsg;
      while (temp.firstChild) {
          chatLine[i].parentNode.insertBefore(temp.firstChild, chatLine[i]);
      }
      chatLine[i].parentNode.removeChild(chatLine[i]);
      prevElement = null;
    } else if (type === 8) {
      // Comment Node
      continue;
      prevElement = null;
    } else if (type === 1) {
      var ele = $(chatLine[i]);
      var eleText = ele.text().trim();
      // Node should be an emoticon
      if (prevElement) {
        if (prevElement === eleText ){
          // This is a repeated element. Remove it.
          ele.remove();
          count += 1;
        } else {
          // The end of a run. (could be a run of length 1!)
          if(count > 1) {
            ele.append(" x" + count);
            ele.addClass("repeated-word");
          }
          prevElement = eleText;
          count = 1;
        }
      } else {
        // This is the first emoticon we see. Set it and continue.
        prevElement = eleText;
        count = 1;
      }
    }
  }
}

function removeRepeatedWords(msg) {
  var msgArray = msg.split(" ");
  var prevString = msgArray[0];
  var newStr = "";
  for(var i = 1; i < msgArray.length; i++) {
    var word = msgArray[i];
    if(prevString != word) {
      newStr += prevString + " ";
      prevString = word;
    }
  }
  newStr += prevString;

  return newStr;
}

function makeKeyFromChatMessage(messageElement) {
  // Takes a Twitch chat message element and creates a key.
  // The objective is that the key uniquely identifies this message.
  // For a message, each node type is handled differently.
  // Text nodes have repeated, consecutive words removed.
  // Comment nodes are ignored.
  // Element nodes are checked if they are repeated in series.
  // Note: we assume if we ever encounter any element nodes that they are
  // Twitch emoticons.

  var chatLine = messageElement.contents();

  var prevEmote = null;
  var key = "";

  for (var i = 0; i < chatLine.length; i++) {
    var type = chatLine[i].nodeType;
    if (type === 3) {
      // Text node
      var txt = chatLine[i].textContent;
      if (txt.trim() === "") {
        continue;
      }
      var newMsg = removeRepeatedWords(txt.trim());
      key += newMsg + " ";
      prevEmote = null;
    } else if (type === 8) {
      // skip comment nodes
      prevEmote = null;
      continue;
    } else if (type === 1) {
      // Element node, should be an emoticon
      // ele.text() should be the Twitch name for the emoticon
      var ele = $(chatLine[i]);
      var emoticonName = ele.text().trim();
      if (prevEmote) {
        if (prevEmote != emoticonName) {
          key += prevEmote + " ";
          prevEmote = emoticonName;
        }
      } else {
        prevEmote = emoticonName;
      }
    }
  }

  // Lower case it!
  return key.toLowerCase();
}

// Attach listener that acts when a new chat message appears.
var chatObserver = new MutationObserver(function (mutations) {
  // For each mutation object, we want the addedNode object
  mutations.forEach(function (mutation) {
    // Chat message should be the added node
    mutation.addedNodes.forEach(function (addedNode) {
      // At this point it's potentially a chatMessage object.
      var chatMessage = $(addedNode);
      if(!chatMessage.is(twitchChatMessageClass1, twitchChatMessageClass2)) {
        // this isn't a chat message, skip processing.
        return;
      }
      // Grab the actual span element with the message content
      var messageElement = chatMessage.children(twitchChatMessageContent);

      // Make key from message.
      var key = makeKeyFromChatMessage(messageElement);
      if(key in dict) {
        // Update cached message
        var msgEle = $(dict[key].ele);

        // If this is the first repeat, we need to add some elements.
        if(dict[key].count === 1) {
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
        // Add unique message to cacheh.

        // Sanitize the message.
        // Method does this "in-place" (edits existing DOM element).
        compressMessageReadable(messageElement);

        // Update the ordered dictionary
        dict[key] = {ele: chatMessage, count: 1};
        order.push(key);

        // Pop old messages if we're over the size limit.
        if(order.length > size) {
          // Add a checkmark to distinguish that the message has expired.
          var oldChatMessage = dict[order[0]].ele;
          oldChatMessage.append("&#10003;");

          // now delete.
          delete dict[order.shift()];
        }
      }
    })
  })
});

// configuration of the observer:
var config = { attributes: false, childList: true, characterData: false };

// The chat, particularly the element ".chat-lines", is dynamically loaded.
// We need to wait until the page is done loading everything in order to be
// able to grab it.
// We hijack MutationObserver as a way to check if an added, the chat.
var htmlBody = $("body")[0];
var chatLoadedObserver = new MutationObserver(function (mutations, observer) {
  mutations.forEach(function (mutation) {
    var chatSelector = $(twitchChatUlClass);
    if(chatSelector.length > 0) {
      // Select the node element.
      var target = chatSelector[0];

      // Pass in the target node, as well as the observer options
      chatObserver.observe(target, config);

      // Alert page action that we found a chat and we're going to get to work.
      chrome.runtime.sendMessage({twitchChat: true}, function(response) {
        if(response.registered) {
          console.log("Twitch Chat found.");
        }
      });

      // Unregister chatLoadedObserver. We don't need to check for the chat element anymore.
      observer.disconnect();
    }
  })
})
chatLoadedObserver.observe(htmlBody, config);

// Ordered Dictionary class
dict = {};
order = [];
size = 25;

// Helper Methods
function wrapInRepeatedWordClass(str) {
  return "<span class='repeated-word'>" + str + "</span>";
}

function compressStr(msg) {
  var msgArray = msg.split(" ");
  var prevString = msgArray[0];
  var count = 1;
  var newStr = "";
  for (var i = 1; i < msgArray.length; i++) {
    var word = msgArray[i];
    if (word === "" || word === "\n") {
      // Newlines and blank spaces are HTML we skipped.
      // We won't need this if we handle them correctly.
      continue;
    }

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

// Simple compression. Adjacent, repeated strings are compressed to one instance
// followed by "x [n]" where n is the number of times it is repeated.
function compressMessage(msg) {
  var msgArray = msg.split(" ");
  var prevString = msgArray[0];
  var count = 1;
  var newStr = [];
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
      newStr.push({str: prevString, count: count});
      count = 1;
      prevString = word;
    }
  }
  if(count > 1) {
    count += 1;
  }
  newStr.push({str: prevString, count: count});

  return newStr;
}

function compressMessageReadable(messageElement) {
  var chatLine = messageElement.contents();

  var prevElement = null;
  var count = 0;

  for (var i = 0; i < chatLine.length; i++) {
    var type = chatLine[i].nodeType;
    var ele = $(chatLine[i]);
    if (type === 3) {
      // Text node
      if (chatLine[i].data.trim() === "") {
        continue;
      }

      var newMsg = compressStr(chatLine[i].data.trim());
      var temp = document.createElement('span');
      temp.innerHTML = newMsg;
      while (temp.firstChild) {
          chatLine[i].parentNode.insertBefore(temp.firstChild, chatLine[i]);
      }
      chatLine[i].parentNode.removeChild(chatLine[i]);
    } else if (type === 8) {
      // Comment Node
      continue;
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
    if(word === "" || word === "\n") {
      // Newlines and blank spaces are HTML we skipped.
      // We won't need this if we handle them correctly.
      continue;
    }
    if(prevString != word) {
      newStr += prevString;
      prevString = word;
    }
  }
  newStr += prevString;

  return newStr;
}

function makeKeyFromChatMessage(messageElement) {
  var chatLine = messageElement.contents();

  var prevElement = null;
  var key = "";

  for (var i = 0; i < chatLine.length; i++) {
    var type = chatLine[i].nodeType;
    var ele = $(chatLine[i]);
    if (type === 3) {
      // Text node
      if (ele.text().trim() === "") {
        continue;
      }
      var newMsg = removeRepeatedWords(ele.text().trim());
      key += newMsg + " ";
    } else if (type === 8) {
      // Comment Node
      continue;
    } else if (type === 1) {
      // Node should be an emoticon
      if (prevElement) {
        if (prevElement != ele.text()) {
          key += prevElement + " ";
          prevElement = ele.text();
        }
      } else {
        prevElement = ele.text();
      }
    }
  }
  return key.toLowerCase();
}

// Attach listener that acts when a new chat message appears.
var chatObserver = new MutationObserver(function (mutations) {
  // For each mutation object, we want the addedNode object
  mutations.forEach(function (mutation) {
    // Chat message should be the added node
    mutation.addedNodes.forEach(function (addedNode) {
      var chatMessage = $(addedNode);
      if(!chatMessage.hasClass("message-line")) {
        return;
      }
      // Grab the actual span element with the message content
      var messageElement = chatMessage.children(".message");

      var key = makeKeyFromChatMessage(messageElement);
      if(key in dict) {
        // Update Cached Message
        var msgEle = $(dict[key].ele);
        if(dict[key].count === 1) {
          // First repeat found. Add count element.
          msgEle.append("<span class='count'></span>");

          // Add user to dropdown menu of people who have said this repeated msg.
          var originalMsgFrom = msgEle.children(".from");
          originalMsgFrom.after("<div class='compakt-dropdown'><button class='compakt-dropbtn'>&#9660;</button><div class='compakt-dropdown-content'></div></div>");
        }
        // Display new count.
        dict[key].count += 1;
        var countEle = msgEle.children(".count");
        countEle.text(dict[key].count);

        var dropdownMenu = msgEle.find(".compakt-dropdown-content");
        var userEle = chatMessage.children(".from");
        dropdownMenu.append(userEle);

        // Don't show it, it's a repeat.
        chatMessage.hide();
      } else {
        // add unique message to buffer.

        // Sanitize the message.
        // Method does this "in-place" (edits existing DOM element).
        compressMessageReadable(messageElement);

        // Update the ordered dictionary
        dict[key] = {ele: chatMessage, count: 1};
        order.push(key);

        // pop old ones if necessary.
        if(order.length > size) {
          // Add a checkmark to distinguish that the message has expired.
          var oldChatMessage = dict[order[0]].ele;
          //var oldMsg = oldChatMessage.children(".count");
          //oldMsg.append("&#10003;");
          oldChatMessage.append("&#10003;");

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

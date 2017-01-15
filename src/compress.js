var libhrc = require("libhrc");
var loadBTTVEmotes = require("./bttvemotes.js");

var NODE_TYPE_TEXT = 3;
var NODE_TYPE_ELEMENT = 1;

var bttvEmotes = loadBTTVEmotes();

//<img class="emoticon" src="//static-cdn.jtvnw.net/emoticons/v1/139945/1.0" srcset="//static-cdn.jtvnw.net/emoticons/v1/139945/2.0 2x" alt="tattedLOL">

// Define sentenceArray: a mapping to take a phrase to a Twitch chat
// message element.

// Twitch chat message element: rich with media.

var msgHTMLToSentenceArray = function (msgHTML) {
  // The sentence array is a minimal structure containing the words of
  // a chat message. A dictionary is provided that maps any words that
  // manifests as an emote.
  var sentenceArray = [], emoteDictionary = {};
  var contents = msgHTML.contents();
  for (var i = 0; i < contents.length; i++) {
    var nodeType = contents[i].nodeType;
    if(nodeType === NODE_TYPE_TEXT) {
      // Text Node
      // Trim, split, and push each word onto the sentence array
      // Trimming is important here. We remove all the white spaces from
      // the HTML doc.
      var txt = contents[i].textContent.trim();
      if(txt != "") {
        var txtArray = txt.split(" ");
        for(var j = 0; j < txtArray.length; j++) {
          sentenceArray.push(txtArray[j]);
        }
      }
    } else if(nodeType === NODE_TYPE_ELEMENT) {
      // Element node, assume native Twitch emote
      // Note: could be an injected emote by another extension e.g. BetterTTV
      // TODO: Compatibility with other extensions!

      // Extract the name for the emote.
      var element = $(contents[i]);
      var emoteName = element.text().trim();
      sentenceArray.push(emoteName);

      emoteDictionary[emoteName] = element.html();
    }
  }

  return {
    array: sentenceArray,
    emotes: emoteDictionary
  }
};

var sentenceArrayToString = function(sentenceArray) {
  // Given an array of strings, create a sentence with one whitespace between
  // each string.
  var str = "";
  for(var i = 0; i < sentenceArray.length - 1; i++) {
    str += sentenceArray[i] + " ";
  }
  str += sentenceArray[i];
  return str;
};

var constructHTMLFromSentenceArray = function (sentenceArr) {
  var newHTML = "";
  for(var i = 0; i < sentenceArr.array.length - 1; i++) {
    var word = sentenceArr.array[i];
    if(word in sentenceArr.emotes) {
      newHTML += sentenceArr.emotes[word] + " ";
    } else if(word in bttvEmotes.bttvEmotes) {
      var imgURL = bttvEmotes.bttvEmotes[word].url;
      var imgTag = '<img class="emoticon" src="' + imgURL + '" alt="' + word + '"';
      newHTML += imgTag + " "; 
    } else {
      newHTML += sentenceArr.array[i] + " ";
    }
  }

  // Append the last word.
  var word = sentenceArr.array[i];
  if(word in sentenceArr.emotes) {
    newHTML += sentenceArr.emotes[word];
  } else if(word in bttvEmotes.bttvEmotes) {
      var imgURL = bttvEmotes.bttvEmotes[word].url;
      var imgTag = '<img class="emoticon" src="' + imgURL + '" alt="' + word + '"';
      newHTML += imgTag; 
  } else {
    newHTML += word;
  }

  return "<span class='message' style>" + newHTML + "</span>";
};

var compressedHTML = function (msgEle) {
  // msgEle is a chat message HTML element from Twitch.
  // Take a chat message HTML element, compress the content, and return the
  // new chat message HTML element.

  // The sentence array is a necessary intermediate data structure.
  // We want to give the "getLongestRepeatedSubString()" a clean sentence,
  // one with just words, punctuations and spaces. NO HTML fragments.
  // The sentence array also allows us to map words back to HTML elements,
  // mostly for emotes.
  var sentenceArray = msgHTMLToSentenceArray(msgEle);
  var sentence = sentenceArrayToString(sentenceArray.array);
  // Add end-of-text marker.
  var newSentence = libhrc.greedy_compress(
    sentence,
    ' ',
    true,
    " x",
    "<span class='repeated-word'> ",
    " </span>"
  );
  sentenceArray.array = newSentence.split(" ");
  return constructHTMLFromSentenceArray(sentenceArray);
};

var key = function (msgEle) {
  // msgEle is a chat message HTML element from Twitch.
  var sentenceArray = msgHTMLToSentenceArray(msgEle);
  return sentenceArrayToString(sentenceArray.array).toLowerCase();
};

module.exports.getKey = key;
module.exports.getCompressedHTML = compressedHTML;

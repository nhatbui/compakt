var libhrc = require("libhrc");
var loadBTTVEmotes = require("./bttvemotes.js");

// Variables for Node types.
var NODE_TYPE_TEXT = 3;
var NODE_TYPE_ELEMENT = 1;

// Load all our BTTV emotes.
var bttvEmotes = loadBTTVEmotes();

/**
 * The sentence array is a minimal structure containing the words of
 * a chat message. A dictionary is provided that maps any words that
 * manifests as an emote.
 * @param {node} msgHTML - JQuery node element for Twitch's .chat-line/.message-line.
 * @return {Object} An array of token and a dictionary of tokens to emotes.
 */
var msgHTMLToSentenceArray = function (msgHTML) {
  var sentenceArray = [], emoteDictionary = {};
  var contents = msgHTML.contents();
  for (var i = 0; i < contents.length; i++) {
    var nodeType = contents[i].nodeType;
    if(nodeType === NODE_TYPE_TEXT) {
      // Text Node
      // Trim, split, and push each word onto the sentence array
      // Trimming is important here. We remove all the white spaces from
      // the HTML doc.
      sentenceArray = sentenceArray.concat(
        contents[i].textContent.trim().split(' ').filter(
          function (x) { return x.length > 0; }
        )
      );
    } else if(nodeType === NODE_TYPE_ELEMENT) {
      // Element node, assume native Twitch emote
      // Note: could be an injected emote by another extension e.g. BetterTTV

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

/**
 * Given an array of tokens, create a sentence with one whitespace between 
 * each string.
 * @param {tokens} tokens - array of tokens.
 * @return {string} string of tokens delimited by one white space.
 */
var sentenceArrayToString = function(tokens) {
  return tokens.join(' ');
};

/**
 * @param {Object} sentenceObj - Object with an array of tokens and a dictionary
 * of tokens to emotes.
 * @return {string} string containing HTML element.
 */
var constructHTMLFromSentenceArray = function (sentenceObj) {
  var checkIfEmote = function (token) {
    if(token in sentenceObj.emotes) {
      return sentenceObj.emotes[token];
    } else if(token in bttvEmotes.bttvEmotes) {
      var imgURL = bttvEmotes.bttvEmotes[token].url;
      var imgTag = '<img class="emoticon" src="' + imgURL + '" alt="' + token + '"';
      return imgTag;
    } else {
      return token;
    }
  };

  return sentenceObj.array.reduce(function (a, b) {
    return checkIfEmote(a) + " " + checkIfEmote(b);
  });
};

/**
 * msgEle is a chat message HTML element from Twitch.
 * Take a chat message HTML element, compress the content, and return the
 * new chat message HTML element.
 
 * The sentence array is a necessary intermediate data structure.
 * We want to give the "getLongestRepeatedSubString()" a clean sentence,
 * one with just words, punctuations and spaces. NO HTML fragments.
 * The sentence array also allows us to map words back to HTML elements,
 * mostly for emotes.
 * @param {Object} msgEle - JQuery node object for .chat-line/.message-line.
 * @return {string} - New HTML element.
 */
var compressedHTML = function (msgEle) {
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

/**
 * Reduce the chat line to a key. Used to find repeated messages.
 * @param {Object} msgEle - JQuery node object for .chat-line/.message-line.
 * @return {string} - compressed string representing the chat line.
 */
var key = function (msgEle) {
  // msgEle is a chat message HTML element from Twitch.
  var sentenceObj = msgHTMLToSentenceArray(msgEle);
  var sentence = sentenceArrayToString(sentenceObj.array).toLowerCase();
  return libhrc.greedy_compress(sentence, ' ', false, '', '', '');
};

module.exports.getKey = key;
module.exports.getCompressedHTML = compressedHTML;

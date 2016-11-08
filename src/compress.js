var $ = require("jquery");
var SuffixArray = require("./suffixarray.js");

var NODE_TYPE_TEXT = 3;
var NODE_TYPE_ELEMENT = 1;

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

var longestCommonPrefix =  function (s1, s2) {
  // Given 2 strings, find the longest common prefix.
  'use strict';
  var l1 = s1.length, l2 = s2.length;
  var min = l1 < l2 ? l1 : l2;
  for (var i = 0; i < min; i++) {
    if (s1[i] != s2[i]) {
      return s1.slice(0, i);
    }
  }
  return s1.slice(0, min);
};

var getLongestRepeatedSubString = function(sentence) {
  // Iterates through a suffix array and finds the longest common prefix.
  var suffixArray = SuffixArray(sentence);
  var size = suffixArray.length;

  var best = "";  // longest, repeated, non-overlapping substring.
  var minLen = 2; // length of the best match. Initialize to determine a min.

  for(var i = 1; i < size; i++) {
    var s1 = sentence.slice(suffixArray[i]);
    var s2 = sentence.slice(suffixArray[i - 1]);

    // If the string isn't long enough, skip it.
    // A string less than minLen has no change of having a prefix
    // of, at minimum, length minLen.
    if(s1.length < minLen || s2.length < minLen) {
      continue;
    }

    var distance = Math.abs(s1.length - s2.length);
    // make sure suffixes further apart than current best.
    // if not, a new longest repeated NON-OVERLAPPING substring
    // is not possible.
    if (distance < minLen) {
      continue;
    }

    // if there was a prefix match of length minLen, make sure
    // that it is not overlapping.
    if((suffixArray[i-1] + minLen) > suffixArray[i]) {
      continue;
    }

    // if neighboring suffixes don't even match as far as
    // the best match, don't need to check more carefully.
    if (s1.slice(0, minLen) != s2.slice(0, minLen)) {
      continue;
    }

    // check if match is not overlapping.
    var possibleMatch = longestCommonPrefix(s1, s2);
    if((suffixArray[i-1] + possibleMatch.length) <= suffixArray[i]) {
      best = possibleMatch;
      minLen = best.length + 1;
    }
  }

  return best;
};

var RabinKarpTagRepeats = function(pattern, document) {
  // Using Rabin Karp, find the pattern in the document and tag each
  // repeated instance of the pattern.
  var hash = {};
  hash[pattern] = true; // TODO: needs to be a rolling hash!
  var count = 0;
  var newDoc = "";
  var foundInstance = false;
  var startIter = 0;
  var endIter = pattern.length;
  for (;endIter <= document.length;) {
    var checkSubstring = document.slice(startIter, endIter);
    var match = checkSubstring in hash;
    if(match && foundInstance) {
      // if this is the 2nd or more occurrence...
      // ...don't add to new str.
      count += 1;
      startIter += pattern.length;
      endIter += pattern.length;
    } else if (match) {
      // Found first instance of the repeated substring.
      count = 1;
      foundInstance = true;
      startIter += pattern.length;
      endIter += pattern.length;
    } else {
      if(count > 1 && foundInstance) {
        // The end of a repeated match.
        newDoc += "<span class='repeated-word'> " + pattern + " x" + count + "</span> ";
      } else if(foundInstance) {
        // One match
        newDoc += pattern;
      }
      newDoc += document[startIter];
      count = 0;
      foundInstance = false;
      startIter++;
      endIter++;
    }
  }

  if(count > 1 && foundInstance) {
    // The end of a repeated match.
    newDoc += "<span class='repeated-word'> " + pattern + " x" + count + "</span> ";
  } else if(foundInstance) {
    // One match
    newDoc += pattern;
  }

  newDoc += document.slice(startIter, document.length);
  return newDoc;
};

var constructHTMLFromSentenceArray = function (sentenceArr) {
  var newHTML = "";
  for(var i = 0; i < sentenceArr.array.length - 1; i++) {
    if(sentenceArr.array[i] in sentenceArr.emotes) {
      newHTML += sentenceArr.emotes[sentenceArr.array[i]] + " ";
    } else {
      newHTML += sentenceArr.array[i] + " ";
    }
  }

  // Append the last word.
  if(sentenceArr.array[i] in sentenceArr.emotes) {
    newHTML += sentenceArr.emotes[sentenceArr.array[i]];
  } else {
    newHTML += sentenceArr.array[i];
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
  var repeated = getLongestRepeatedSubString(sentence + "$");
  if(repeated.length > 1) {
    var newSentence = RabinKarpTagRepeats(repeated, " " + sentence);
    sentenceArray.array = newSentence.split(" ");
    return constructHTMLFromSentenceArray(sentenceArray);
  } else {
    // No repetitions. Return null.
    return null;
  }
};

var key = function (msgEle) {
  // msgEle is a chat message HTML element from Twitch.
  var sentenceArray = msgHTMLToSentenceArray(msgEle);
  return sentenceArrayToString(sentenceArray.array).toLowerCase();
};

module.exports.getKey = key;
module.exports.getCompressedHTML = compressedHTML;

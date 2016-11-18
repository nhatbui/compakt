// Longest Repeated Substring
var ShuffixArray = require("./shuffixArray.js");

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

var getLongestRepeatedSubString = function(str) {
  var sentence = " " + str + "$";
  // Iterates through a suffix array and finds the longest common prefix.
  var shuffixArray = ShuffixArray(sentence);
  var size = shuffixArray.length;

  var best = "";  // will hold longest, repeated, non-overlapping substring.
  var minLen = 1; // length of the best match. Initialize to determine a min.

  for(var i = 1; i < size; i++) {
    var s1 = sentence.slice(shuffixArray[i]);
    var s2 = sentence.slice(shuffixArray[i - 1]);
    //console.log("'" + s1 + "' '" + s2 + "'");

    // If the string isn't long enough, skip it.
    // A string less than minLen has no change of having a prefix
    // of, at minimum, length minLen.
    if(s1.length < minLen || s2.length < minLen) {
      //console.log("failed string length test");
      continue;
    }

    var distance = Math.abs(s1.length - s2.length);
    // make sure suffixes further apart than current best.
    // if not, a new longest repeated NON-OVERLAPPING substring
    // is not possible.
    if (distance < minLen) {
      //console.log("failed min. overlap test");
      continue;
    }

    // if there was a prefix match of length minLen, make sure
    // that it is not overlapping.
    if(shuffixArray[i-1] < shuffixArray[i]) {
      if((shuffixArray[i-1] + minLen) > shuffixArray[i]) {
        //console.log("failed overlapping test");
        continue;
      }
    } else {
      if((shuffixArray[i] + minLen) > shuffixArray[i-1]) {
        //console.log("failed overlapping test");
        continue;
      }
    }

    // if neighboring suffixes don't even match as far as
    // the best match, don't need to check further.
    if (s1.slice(0, minLen) != s2.slice(0, minLen)) {
      //console.log("failed min. suffix test");
      continue;
    }

    var possibleMatch = longestCommonPrefix(s1, s2).trim();

    // check if match ends on word boundaries for both suffixes
    try {
      var b_re = new RegExp(possibleMatch + "\\b");
    } catch (e) {
      console.log("Bad regex: " + possibleMatch);
      console.error("Shingling", e.message);
    }

    if(b_re.exec(s1) == null) {
      continue;
    } else if(b_re.exec(s2) == null) {
      continue;
    }

    // check if match is not overlapping.
    if(shuffixArray[i-1] < shuffixArray[i]) {
      if((shuffixArray[i-1] + possibleMatch.length) === shuffixArray[i] - 1) {
        best = possibleMatch;
        minLen = best.length + 1;
      }
    } else {
      if((shuffixArray[i] + possibleMatch.length) === shuffixArray[i-1] - 1) {
        best = possibleMatch;
        minLen = best.length + 1;
      }
    }
  }

  return best;
};

module.exports = getLongestRepeatedSubString;

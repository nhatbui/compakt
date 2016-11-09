// Longest Repeated Substring
var SuffixArray = require("./suffixarray.js");

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

module.exports = getLongestRepeatedSubString;

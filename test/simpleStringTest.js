var getLRS = require("../src/lrs.js");
var tagRepeats = require("../src/tagRepeats.js");
var ShuffixArray = require("../src/shuffixArray.js");

var testString = function(s) {
  console.log("Test: '" + s + "'");
  var lrs = getLRS(s);
  if (lrs.length > 0) {
    console.log("Result: '" + tagRepeats(lrs, s, "<", ">") + "'");
  }
}

// Twitch chat characteristics:
// - trimmed (no white space(s) at beginning and end)
// - single spaces between words
testString("simple repeat simple repeat simple repeat");
testString("extra words at the start simple repeat simple repeat simple repeat");
testString("simple repeat simple repeat simple repeat extra words at the end");
testString("wrapped at start simple repeat simple repeat simple repeat and at the end")
testString("simple repeat simple repeat simple repeat.");
testString("you youngings");
testString("this is the best");
testString("kung fu fun");

var getLRS = require("../src/lrs.js");
var tagRepeats = require("../src/tagRepeats.js");
var ShuffixArray = require("../src/shuffixArray.js");

var s = process.argv[2];
console.log("Test: '" + s + "'");
var lrs = getLRS(s);
console.log("LRS: '" + lrs + "'");
if (lrs.length > 0) {
    console.log("Result: '" + tagRepeats(lrs, s, "<", ">") + "'");
} else {
  console.log("Not tagging repeats.");
}

// Peek at ShuffixArray
console.log("Peek at ShuffixArray");
a = ShuffixArray(s);
console.log(a);

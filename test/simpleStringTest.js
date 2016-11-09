var getLRS = require("../src/lrs.js");
var tagRepeats = require("../src/tagRepeats.js");

var s = process.argv[2];
console.log("Test: '" + s + "'");
var lrs = getLRS(s);
console.log("LRS: '" + lrs + "'");
console.log("Result: '" + tagRepeats(lrs, s, "<", ">") + "'");

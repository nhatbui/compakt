var MinHash = require("../src/minhash.js");

var compareDocs = function(doc1, doc2) {
  // Compute MinHash
  var sig1 = minhash.computeSignature(doc1);
  var sig2 = minhash.computeSignature(doc2);
  return compareSignatures(sig1, sig2);
}

var compareSignatures = function(sig1, sig2) {
  // Compare against all other MinHashes in the cached
  var percent = 0;
  var count = 0;
  // Each signature of the messages.
  for (var k = 0; k < numHashes; k++) {
    count += count + (sig1[k] == sig2[k]);
  }
  // Compute percent
  var percent = count/numHashes;
  return percent;
}

var numHashes = 10;
var shingle_size = 9;
var minhash = MinHash(shingle_size, numHashes);

console.log(compareDocs(
  "is this almost the same.",
  "is this almost the sane."
));

console.log(compareDocs(
  "Not even close.",
  "Ton never lose."
));

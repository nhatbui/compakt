var MinHash = require("../src/minhash.js");
var numHashes = 10;
var shingle_size = 9;
var minhash = MinHash(shingle_size, numHashes);

var doc1 = "is this almost the same.";
var doc2 = "is this almost the sane.";

// Compute MinHash
var sig1 = minhash.computeSignature(doc1);
var sig2 = minhash.computeSignature(doc2);

// Compare against all other MinHashes in the cached
var percent = 0;
var count = 0;
// Each signature of the messages.
for (var k = 0; k < numHashes; k++) {
  count += count + (sig1[k] == sig2[k]);
}
// Compute percent
var percent = count/numHashes;
console.log(percent);

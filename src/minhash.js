var shinglify = require("./shingling.js");

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var nextPrime = 4294967311;

var minhash = function(shingle_size, numHashes) {
  var hashVars = [];
  for (var x = 0; x < numHashes; x++) {
    var a = getRandomIntInclusive(0, numHashes - 1);
    var b = getRandomIntInclusive(0, numHashes - 1);
    hashVars.push({a: a, b: b});
  }

  function computeMinHash(shingles, coeffA, coeffB) {
    var minHashCode = nextPrime + 1;
    for (var j = 0; j < shingles.length; j++) {
      var hashCode = (coeffA*shingles[j] + coeffB) % nextPrime;

      if (hashCode < minHashCode) {
        minHashCode = hashCode;
      }
    }
    return minHashCode;
  }

  function computeSignature(doc) {
    var shingles = shinglify(doc, shingle_size);
    var signature = [];
    for (var i = 0; i < hashVars.length; i++) {
      var minHashCode = computeMinHash(
        shingles, hashVars[i]['a'], hashVars[i]['b']
      );
      signature.push(minHashCode);
    }
    return signature;
  }

  return {
    'computeSignature': computeSignature,
    'numHashes': numHashes,
    'shingle_size': shingle_size
  }
}

module.exports = minhash;

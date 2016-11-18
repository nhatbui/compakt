
function computeMinHash(shingles, coeffA, coeffB, modulus) {
  var minHashCode = modulus + 1;
  for (var j = 0; j < shingles.length; j++) {
    var hashCode = (coeffA*shingles[j] + coeffB) % modulus;

    if (hashCode < minHashCode) {
      minHashCode = hashCode;
    }
  }
  return minHashCode;
}

function computeSignature(hashVars, shingles, modulus) {
  var signature = [];
  for (var i = 0; i < hashVars.length; i++) {
    var minHashCode = computeMinHash(
      shingles, hashVars[i]['a'], hashVars[i]['b'], modulus
    );
    signature.push(minHashCode);
  }
  return signature;
}

module.exports = computeSignature;

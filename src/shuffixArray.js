// Shuffix: Shingle + suffix.
// Shuffix Array: suffix arrays but with word grams (shingles), not character grams

var ShuffixArray = function(s) {
  array = [];
  for (var i = 0; i < s.length; i++) {
    if(s[i] === " " && (i+1) < s.length) {
      array.push(i+1);
    }
  }
  return array.sort(function (a, b) {
    if(s.slice(a) < s.slice(b)) {
      return -1;
    } else {
      return 1;
    }
    // no possibility for equality.
  });
}

module.exports = ShuffixArray;

var tagRepeats = function(pattern, document, tagStart, tagEnd) {
  // Using Rabin Karp, find the pattern in the document and tag each
  // repeated instance of the pattern.
  var re = new RegExp(pattern, 'g');
  var count = 0;
  var matchIndex = [];

  while ((match = re.exec(document)) != null) {
    // We assume that the matches are consecutive a la suffix array routine
    // earlier.
    count += 1;
    matchIndex.push(match.index);
  }

  if (count > 1) {
    var newDoc = document.slice(0, matchIndex[0]);
    newDoc += tagStart + pattern + " x" + count + tagEnd;
    newDoc += document.slice(
      matchIndex[matchIndex.length - 1] + pattern.length,
      document.length
    );
    return newDoc;
  } else {
    return document;
  }
};

module.exports = tagRepeats;

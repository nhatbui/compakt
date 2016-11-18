var crc32 = require("../node_modules/crc/lib/crc32.js");

/**
* Make w-shingles from a source string or array.
* @param  {string} collection The collection (array or string) to shingle.
* @param  {string} size The shingle size (4 for 4-shingles, etc.)
* @return {array} An array of shingles.
*/
function shingle(collection, size) {
  var shingles = [];
  for (var i=0; i<collection.length-size+1; i++) {
    try {
      shingles.push(crc32(collection.slice(i, i+size)));
    } catch (e) {
      console.log("Bad slice: " + collection.slice(i, i+size));
      console.error("Shingling", e.message);
    }
  }
  return shingles;
}

// Credit to @inactivist (https://gist.github.com/inactivist/7614182)

module.exports = shingle;

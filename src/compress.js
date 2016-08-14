var $ = require("jquery");
var SuffixArray = require("./suffixarray.js");


var longestCommonPrefix =  function(s1, s2) {
    var l1 = s1.length;
    var l2 = s2.length;
    var min = l1 < l2 ? l1 : l2;
    for (var i = 0; i < min; i++) {
        if (s1[i] != s2[i]) {
            return s1.slice(0, i);
        }
    }
    return s1.slice(0, min);
};

var getLongestRepeatedSubString = function(sentence) {
    var suffixArray = SuffixArray(sentence);
    var size = suffixArray.length;

    var best = "";  // longest, repeated, non-overlapping substring.
    var minLen = 2; // length of the best match. Initialize to determine a min.

    for(var i = 1; i < size; i++) {
        var s1 = sentence.slice(suffixArray[i]);
        var s2 = sentence.slice(suffixArray[i - 1]);

        // If the string isn't long enough, skip it.
        // A string less than minLen has no change of having a prefix
        // of, at minimum, length minLen.
        if(s1.length < minLen || s2.length < minLen) {
            continue;
        }

        var distance = Math.abs(s1.length - s2.length);
        // make sure suffixes further apart than current best.
        // if not, a new longest repeated NON-OVERLAPPING substring
        // is not possible.
        if (distance < minLen) {
            continue;
        }

        // if there was a prefix match of length minLen, make sure
        // that it is not overlapping.
        if((suffixArray[i-1] + minLen) > suffixArray[i]) {
            continue;
        }

        // if neighboring suffixes don't even match as far as
        // the best match, don't need to check more carefully.
        if (s1.slice(0, minLen) != s2.slice(0, minLen)) {
            continue;
        }

        // check if match is not overlapping.
        var possibleMatch = longestCommonPrefix(s1, s2);
        //console.log("possible match: '" + possibleMatch + "' (" + possibleMatch.length + ")");
        //console.log("sentence index at 'i': " + suffixArray[i]);
        //console.log("sentence index at 'i-1': " + suffixArray[i-1]);
        if((suffixArray[i-1] + possibleMatch.length) <= suffixArray[i]) {
            //console.log("match");
            best = possibleMatch;
            minLen = best.length + 1;
        }
    }

    return best;
};

/*
var getLongestRepeatedSubString = function(sentence) {
    var suffixArray = SuffixArray(sentence);
    var size = suffixArray.length;

    var best = "";  // longest, repeated, non-overlapping substring.
    var minLen = 2; // length of the best match. Initialize to determine a min.
    var neighbors_to_check = 1;

    for(var i = 1; i < size; i++) {
        var s1 = sentence.slice(suffixArray[i]);
        for(var j = neighbors_to_check; j > 0; j--) {
            var s2 = sentence.slice(suffixArray[i - j]);
            var distance = Math.abs(s1.length - s2.length);
            // make sure suffixes further apart than current best.
            // if not, a new longest repeated NON-OVERLAPPING substring
            // is not possible.
            if (distance < minLen) {
                if (s1.length >= minLen &&
                    s2.length >= minLen &&
                    s1.slice(0, minLen) === s2.slice(0, minLen)) {
                    neighbors_to_check = Math.max(neighbors_to_check, j + 1);
                } else {
                    neighbors_to_check = j;
                }
                continue;
            }

             // if there was a prefix match of length minLen, make sure
             // that it is not overlapping.
             if((suffixArray[i-1] + minLen) > suffixArray[i]) {
                continue;
             }

            // if neighboring suffixes don't even match as far as
            // the best match, don't need to check more carefully.
            if (s1.slice(0, minLen) != s2.slice(0, minLen)) {
                neighbors_to_check = j;
                continue;
            }

            best = longestCommonPrefix(s1, s2);
            minLen = best.length + 1;
            if (best.length === distance) {
                neighbors_to_check = Math.max(neighbors_to_check, j + 1);
            } else {
                neighbors_to_check = j;
            }
        }
    }

    return best;
}
*/

var sentenceArrayToString = function(sentenceArray) {
    var str = "";
    for(var i = 0; i < sentenceArray.length - 1; i++) {
        str += sentenceArray[i] + " ";
    }
    str += sentenceArray[i];
    return str;
};

var msgHTMLToSentenceArray = function(msgHTML) {
    var sentenceArray = [];
    var emoteDictionary = {};
    var contents = msgHTML.contents();
    for (var i = 0; i < contents.length; i++) {
        var nodeType = contents[i].nodeType;
        if(nodeType === 3) {
            // Text Node
            // Trim, split, and push each word onto the sentence array
            var txt = contents[i].textContent.trim();
            if(txt != "") {
                var txtArray = txt.split(" ");
                for(var j = 0; j < txtArray.length; j++) {
                    sentenceArray.push(txtArray[j]);
                }
            }
        } else if(nodeType === 1) {
            // Element node, assume native Twitch emote
            // Note: could be an injected emote by another extension e.g. BetterTTV
            // TODO: Compatibility with other extensions!

            // Extract the name for the emote.
            var element = $(contents[i]);
            var emoteName = element.text().trim();
            sentenceArray.push(emoteName);

            emoteDictionary[emoteName] = element.html();
        }
    }

    return {
        array: sentenceArray,
        emotes: emoteDictionary
    }
};

var RabinKarpRemoveRepeats = function(pattern, document) {
    var hash = {};
    hash[pattern] = true;
    var newDoc = "";
    var foundInstance = false;
    var startIter = 0;
    var endIter = pattern.length;
    for (;endIter <= document.length;) {
        var checkSubstring = document.slice(startIter, endIter);
        var match = checkSubstring in hash;
        if(match && foundInstance) {
            // if this is the 2nd or more occurrence...
            // ...don't add to new str.
            startIter += pattern.length;
            endIter += pattern.length;
        } else if (match) {
            // Found first instance of the repeated substring.
            foundInstance = true;
            newDoc += checkSubstring;
            startIter += pattern.length;
            endIter += pattern.length;
        } else {
            foundInstance = false;
            newDoc += document[startIter];
            startIter++;
            endIter++;
        }
    }
    newDoc += document.slice(startIter, document.length);
    return newDoc;
};

var RabinKarpTagRepeats = function(pattern, document) {
    var hash = {};
    hash[pattern] = true;
    var count = 0;
    var newDoc = "";
    var foundInstance = false;
    var startIter = 0;
    var endIter = pattern.length;
    for (;endIter <= document.length;) {
        var checkSubstring = document.slice(startIter, endIter);
        var match = checkSubstring in hash;
        if(match && foundInstance) {
            // if this is the 2nd or more occurrence...
            // ...don't add to new str.
            count += 1;
            startIter += pattern.length;
            endIter += pattern.length;
        } else if (match) {
            // Found first instance of the repeated substring.
            count = 1;
            foundInstance = true;
            startIter += pattern.length;
            endIter += pattern.length;
        } else {
            if(count > 1 && foundInstance) {
                // The end of a repeated match.
                newDoc += "<span class='repeated-word'> " + pattern + " x" + count + "</span> ";
            } else if(foundInstance) {
                // One match
                newDoc += pattern;
            }
            newDoc += document[startIter];
            count = 0;
            foundInstance = false;
            startIter++;
            endIter++;
        }
    }
    if(count > 1 && foundInstance) {
        // The end of a repeated match.
        newDoc += "<span class='repeated-word'> " + pattern + " x" + count + "</span> ";
    } else if(foundInstance) {
        // One match
        newDoc += pattern;
    }
    newDoc += document.slice(startIter, document.length);
    return newDoc;
};

var constructHTMLFromSentenceArray = function (sentenceArr) {
    var newHTML = "";
    for(var i = 0; i < sentenceArr.array.length - 1; i++) {
        if(sentenceArr.array[i] in sentenceArr.emotes) {
            newHTML += sentenceArr.emotes[sentenceArr.array[i]] + " ";
        } else {
            newHTML += sentenceArr.array[i] + " ";
        }
    }
    if(sentenceArr.array[i] in sentenceArr.emotes) {
        newHTML += sentenceArr.emotes[sentenceArr.array[i]];
    } else {
        newHTML += sentenceArr.array[i];
    }
    return "<span class='message' style>" + newHTML + "</span>";
};

var compressedHTML = function (msgEle) {
    // msgEle is a chat message HTML element from Twitch.
    var sentenceArray = msgHTMLToSentenceArray(msgEle);
    var sentence = sentenceArrayToString(sentenceArray.array);
    // Add end-of-text marker.
    var repeated = getLongestRepeatedSubString(sentence + "$");
    if(repeated.length > 1) {
        var newSentence = RabinKarpTagRepeats(repeated, " " + sentence);
        sentenceArray.array = newSentence.split(" ");
        return constructHTMLFromSentenceArray(sentenceArray);
    } else {
        // No repetitions. Return null.
        return null;
    }
};

var compressedKey = function (msgEle) {
    // msgEle is a chat message HTML element from Twitch.
    var sentenceArray = msgHTMLToSentenceArray(msgEle);
    var sentence = sentenceArrayToString(sentenceArray.array);
    // Add end-of-text marker.
    var repeated = getLongestRepeatedSubString(sentence + "$");
    if(repeated.length > 1) {
        return RabinKarpRemoveRepeats(repeated, " " + sentence);
    } else {
        return sentence;
    }
};

var key = function (msgEle) {
    // msgEle is a chat message HTML element from Twitch.
    var sentenceArray = msgHTMLToSentenceArray(msgEle);
    return sentenceArrayToString(sentenceArray.array).toLowerCase();
};

module.exports.getCompressedKey = compressedKey;
module.exports.getKey = key;
module.exports.getCompressedHTML = compressedHTML;
//module.exports.getLongestRepeatedSubString = getLongestRepeatedSubString;
//module.exports.removeRepeats = RabinKarpRemoveRepeats;
//module.exports.sentenceArrayToHTML = constructHTMLFromSentenceArray;
//module.exports.sentenceArrayToString = sentenceArrayToString;

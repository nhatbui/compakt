var $ = require("jquery");
var SuffixTree = require("./suffixtree.js");


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
    sentence += " ";
    var suffixTree = new SuffixTree(sentence);
    var repeated = suffixTree.node.getLongestRepeatedSubString();
    if(repeated.length > 1) {
        var newSentence = RabinKarpTagRepeats(repeated, sentence);
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
    // This is a helper space.
    sentence += " ";
    var suffixTree = new SuffixTree(sentence);
    var repeated = suffixTree.node.getLongestRepeatedSubString();
    if(repeated.length > 1) {
        return RabinKarpRemoveRepeats(repeated, sentence);
    } else {
        return sentence;
    }
};

module.exports.getKey = compressedKey;
module.exports.getCompressedHTML = compressedHTML;
//module.exports.removeRepeats = RabinKarpRemoveRepeats;
//module.exports.sentenceArrayToHTML = constructHTMLFromSentenceArray;
//module.exports.sentenceArrayToString = sentenceArrayToString;

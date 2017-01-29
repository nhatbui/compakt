var emojilib = require('emojilib'), 
    twemoji = require('twemoji');

var loadBTTVEmotes = function() {
    console.log('Loading BetterTTV Emoticons');
    var bttv = {'bttvEmotes': {}};

    var generate = function(data) {
        // data = {
        //   emotes: [emote, ...],
        //   emojis: [emoji, ...]
        // }

        // emote = {
        //   urlTemplate: string,
        //   url: string,
        //   type: string,
        //   code: string 
        // }
        if ('emotes' in data) {
            data.emotes.forEach(function(emote) {
                emote.urlTemplate = data.urlTemplate.replace('{{id}}', emote.id);
                emote.url = emote.urlTemplate.replace('{{image}}', '1x');
                emote.type = 'global';

                bttv.bttvEmotes[emote.code] = emote;
            });
        }

        // emoji = {
        //   type: string
        // }
        if ('emojis' in data) {
            data.emojis.forEach(function(emoji) {
                emoji.type = 'emoji';

                bttv.bttvEmotes[emoji.code] = emoji;
            });
        }
    };
    // END generate()

    // There is a bug in twemoji /w emojilib. Emojis returned by emojilib
    // sometimes return two emojis in twemoji. This counts the number
    // of parsed emotes being returned in twemoji so we can not load them.
    var countEmojis = function(emoji) {
        var count = 0;
        twemoji.parse(emoji.char, function(d) {
            count += d.split('-').length;
        });
        return count;
    };

    $.getJSON('https://api.betterttv.net/2/emotes', function(data) {
        data.emojis = Object.keys(emojilib.lib).filter(function(key) {
            var emoji = emojilib.lib[key];
            if (!emoji || !emoji.char) return false;
            var emojiCount = countEmojis(emoji);
            return emoji.category !== '_custom' &&
                emojiCount === 1;
        }).map(function(key) {
            return {
                code: ':' + key + ':',
                char: emojilib.lib[key].char,
                imageType: 'png',
                channel: null,
                id: 'emoji_' + key
            };
        });

        generate(data);
        console.log('BTTV Emotes loaded.');
    })
        .fail(function() {
            console.log('https://api.betterttv.net/2/emote failed.');
        });
    
    return bttv;
};

module.exports = loadBTTVEmotes;
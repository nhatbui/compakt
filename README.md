# ![compakt](chrome/assets/icon_128.png) Twitch compakt
Twitch Chat streamlining.

Compress long messages and condense repeated messages.

Let Twitch chat be Twitch chat. Don't miss any more buried messages. Reduce clutter on the screen.

## Features
* Compresses longest repeated, non-overlapping "phrase" e.g. "Kappa Yolo Kappa Yolo" becomes "Kappa Yolo x2".
* Similar messages are grouped together.
* BetterTTV Emotes!

## Get it!
compakt is a Chrome extension (so far). [Install it](https://chrome.google.com/webstore/detail/twitch-compakt/gfjfndigkjbiabgckjpngijjdkmebeje?hl=en-US) and visit a Twitch stream to see it in action.

## Developers
Pull requests always welcome!

### Developing

#### Dependencies
You'll need [NodeJS+NPM](https://nodejs.org/en/download/).

#### Build
```
mkdir /path/to/compakt
cd /path/to/compakt
git clone https://github.com/nhatbui/compakt.git
npm install
make chrome
```

#### Developing/Testing
[Load the extension into Chrome.](https://developer.chrome.com/extensions/getstarted#unpacked)

### Publishing
The "official" Chrome Extension is published [here](https://chrome.google.com/webstore/detail/twitch-compakt/gfjfndigkjbiabgckjpngijjdkmebeje?hl=en-US). Official pushes of this repo to the Chrome Web Store are done as needed.

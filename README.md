# ![Compakt](assets/icon_128.png) Twitch Compakt
Twitch Chat streamlining. Condenses repeated words, emotes, and messages.

Let Twitch chat be Twitch chat. Don't miss any more buried messages. Reduce clutter on the screen.

[Compakt in action! (youtube)](https://www.youtube.com/watch?v=twy-K8oruDc)

## Features
* Compresses repeated words e.g. "kappa kappa kappa" = "kappa x3"
* Compresses repeated emotes similar to how words are compressed.
* Repeated messages are grouped together.
* Hover to see a list of all the users who uttered the same message.

## How to use it
* Just install and visit a Twitch stream to see it in action.
* (Options menu coming soon!)

## Developers
Pull requests always welcome!

### Developing

#### Dependencies
You'll need [NodeJS+NPM](https://nodejs.org/en/download/).

#### Build
```
cd /path/to/compakt
git clone https://github.com/nhatbui/compakt.git
npm install
browserify ./src/main.js -o contentscript.js
```

#### Developing/Testing
[Load the extension into Chrome.](https://developer.chrome.com/extensions/getstarted#unpacked)

### Publishing
The "official" Chrome Extension is published [here](https://chrome.google.com/webstore/detail/twitch-compakt/gfjfndigkjbiabgckjpngijjdkmebeje?hl=en-US). Official pushes of this repo to the Chrome Web Store are done as needed.

### Trello
Some development discussion/planning/designing are done on [Trello](https://trello.com/compakt). Feel free to message us to get added! Trello is not required for contributions: you can still just submit pull requests :)

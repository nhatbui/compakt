chrome: chrome_compakt.js compaktstyles.css jquery.min.js checkIfTwitch.js manifest.json
	mkdir -p build
	zip build/compakt.zip \
	    compakt.js \
	    assets/*.png \
	    checkIfTwitch.js \
	    manifest.json \
	    jquery.min.js \
	    compaktstyles.css
	rm compaktstyles.css jquery.min.js compakt.js checkIfTwitch.js manifest.json
safari: safari_compakt.js compaktstyles.css jquery.min.js
	cp compakt.js safari/compakt/compakt_ext/script.js;
	cp compaktstyles.css safari/compakt/compakt_ext/;
	cp jquery.min.js safari/compakt/compakt_ext/jquery.min.js
	cp safari/assets/icon_web.pdf safari/compakt/compakt_ext/ToolbarItemIcon.pdf;
compaktstyles.css:
	cp css/compaktstyles.css . 
jquery.min.js:
	cp src/jquery.min.js . 
chrome_compakt.js: gulpfile.js
	gulp --type=production --main=./src/main_chrome.js
safari_compakt.js: gulpfile.js
	gulp --type=production --main=./src/main_safari.js
checkIfTwitch.js:
	cp chrome/checkIfTwitch.js .
manifest.json:
	cp chrome/manifest.json .
clean:
	rm compaktstyles.css jquery.min.js compakt.js checkIfTwitch.js manifest.json build/compakt.zip

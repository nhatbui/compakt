chrome: compakt.js compaktstyles.css jquery.min.js checkIfTwitch.js manifest.json
	zip compakt.zip \
	    compakt.js \
	    assets/*.png \
	    checkIfTwitch.js \
	    manifest.json \
	    jquery.min.js \
	    compaktstyles.css
	rm compaktstyles.css jquery.min.js compakt.js checkIfTwitch.js manifest.json
compaktstyles.css:
	cp css/compaktstyles.css . 
jquery.min.js:
	cp src/jquery.min.js . 
compakt.js: gulpfile.js
	gulp --type=production --main=./src/main_chrome.js
checkIfTwitch.js:
	cp chrome/checkIfTwitch.js .
manifest.json:
	cp chrome/manifest.json .
clean:
	rm compaktstyles.css jquery.min.js compakt.js checkIfTwitch.js manifest.json compakt.zip

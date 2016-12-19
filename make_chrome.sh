gulp --production --gulpfile gulpfile_chrome.js;
# Copy global assets into chrome folder
cp css/compaktstyles.css build/chrome/
cp contentscript.js build/chrome/
zip build/chrome/compakt \
    build/chrome/contentscript.js \
    build/chrome/assets/*.png \
    build/chrome/checkIfTwitch.js \
    build/chrome/manifest.json \
    build/chrome/compaktstyles.css

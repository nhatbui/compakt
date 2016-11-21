gulp --type=production --gulpfile gulpfile_chrome.js;
# Copy global assets into chrome folder
cp css/compaktstyles.css chrome/
cp contentscript.js chrome/
zip chrome/compakt \
    chrome/contentscript.js \
    chrome/assets/*.png \
    chrome/checkIfTwitch.js \
    LICENSE.txt \
    chrome/manifest.json \
    chrome/compaktstyles.css

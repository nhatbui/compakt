gulp --type=production --gulpfile gulpfile_chrome.js;
# Copy global assets into chrome folder
cp css/compaktstyles.css chrome/
cp src/jquery.min.js chrome/
cp compakt.js chrome/
pushd chrome/
zip compakt.zip \
    compakt.js \
    assets/*.png \
    checkIfTwitch.js \
    manifest.json \
    jquery.min.js \
    compaktstyles.css
popd
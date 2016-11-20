gulp --type=production;
cp css/compaktstyles.css chrome/
zip chrome/compakt \
    contentscript.js \
    chrome/assets/*.png \
    chrome/checkIfTwitch.js \
    LICENSE.txt \
    chrome/manifest.json \
    chrome/compaktstyles.css

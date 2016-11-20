gulp --type=production;
zip chrome/compakt \
    contentscript.js \
    assets/*.png \
    chrome/checkIfTwitch.js \
    LICENSE.txt \
    chrome/manifest.json \
    css/compaktstyles.css

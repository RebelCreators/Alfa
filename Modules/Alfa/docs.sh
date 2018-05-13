#!/bin/bash

rm -Rf docs && jsdoc -c jsdoc.conf

browserify --standalone ethereumjs index.js > ethereumjs-wallet.bundle.js

minify --output ethereumjs-wallet.bundle.min.js ethereumjs-wallet.bundle.js             


qrcode -o testqrcode.svg "https://www.google.com/search?q=qr+code+generator&oq=qrcodegen&aqs=chrome.1.69i57j0l5.8295j0j7&sourceid=chrome&ie=UTF-8"
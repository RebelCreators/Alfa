#!/bin/bash

rm -Rf docs && jsdoc ./models -r ./lib -r ./routes/index.js ./node_modules/afimport/index.js ./server.js -d ./docs -R ../../README.md

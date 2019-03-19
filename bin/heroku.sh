#!/bin/sh
meteor npm install --no-audit && node ./.reaction/waitForMongo.js && node --experimental-modules ./.reaction/run/setup.mjs

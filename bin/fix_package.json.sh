#!/bin/bash

# Copyright (C) 2016 Tracktunes Inc

# Originally based on package.json at:
#     https://github.com/lathonez/clicker/blob/master/package.json

NLINES_CUT=4
NLINES="`wc -l package.json | awk '{print $1}'`"
NLINES_NEW="`echo $NLINES - $NLINES_CUT | bc`"
TMPFILE=.tmp$RANDOM

head -n $NLINES_NEW package.json > $TMPFILE

cat << EOF >> $TMPFILE
  "description": "ionic-recorder: Ionic2 / WebAudio hybrid app",
  "license": "GPL-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/tracktunes/ionic-recorder.git"
  },
  "scripts": {
    "build": "bin/gulp --gulpfile test/gulpfile.ts --cwd ./ ionic.build",
    "e2e": "bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.build.e2e && ./node_modules/protractor/bin/protractor test/protractor.conf.js",
    "karma": "bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.karma.debug",
    "start": "ionic serve --browser chromium-browser",
    "test": "find ./app -type f | xargs sed -i 's/[ \t]*$//' ; bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test",
    "test.watch": "bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.watch.build",
    "webdriver-update": "webdriver-manager update"
  }
}
EOF

mv $TMPFILE package.json

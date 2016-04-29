#!/bin/bash

# Copyright (C) 2016 Tracktunes Inc

# Originally based on package.json at:
#     https://github.com/lathonez/clicker/blob/master/package.json

# NOTE: Run this from the project home directory, not from where it is
#       (bin/) or anywhere else.
# NOTE: Make sure you have latest ionic cli installed

echo "COMMIT FIRST (WITH TAG)" && ./bin/commit.sh

echo "UPGRADING ALL PACKAGES FOR ionic-recorder VERISION: `cat VERSION`"

APP_NAME="ionic-recorder"
GITHUB_PATH="tracktunes/$APP_NAME"

if [ -e $APP_NAME ]; then
    echo "ERROR: ./$APP_NAME already exists"
    exit 1
fi

ionic start $APP_NAME --v2 --ts

# copy over some stuff from the current repository to the newly
# created one, overriding old files
mkdir -p tmp
cd tmp
git clone https://github.com/$GITHUB_PATH
cd ..

for copy in \
    CHANGELOG.md \
    CONTRIBUTING.md \
    LICENSE \
    README.md \
    TODO.md \
    VERSION \
    www/favicon.ico \
    www/img \
    app \
    bin \
    test
do
    /bin/rm -fr $APP_NAME/$copy
    cp -fr tmp/$APP_NAME/$copy $APP_NAME/$copy
done
/bin/rm -fr tmp

cd $APP_NAME

# change package.json to add some
cp package.json package.json.ORIG

./bin/modify_package_json.py

# install npm packages

echo "ADDING SOME NPM PACKAGES ..."

./bin/install_npm_packages.sh
/bin/rm -fr tslint.json
./bin/tslint --init

# next line assumes first occurrence of the string "double" in tslint.json
# is indeed in the "quotemark" section of tsling.json.  this next line makes
# sure we continue to comfortably work with only single quotes (reduces left
# pinky stress from reduced left-shift key clicks the single quote saves us). 
perl -pi -e 's/\"double\"/\"single\"/' tslint.json

# install typings definitions
./bin/install_typings.sh

# patches to fix some type complaints by the Typescript compiler
./bin/fix_typings.sh

# install package.json (ionic) packages
npm install

# run the main gulp test task, which runs other tasks in order
# NOTE: seems like we can't run these tasks in order from the
# command line but we have to group them under this general task 'test'
# because of the globals being tracked in the gulp.ts file ...

./bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test

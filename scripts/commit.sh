#!/bin/bash

# this is the only way we will commit from now on!
# it automatically increments version numbers and automatically
# tags each time.

# path to file containing the version
VERSIONFILE="VERSION"
CONFIGFILE="config.xml"
ABOUTFILE="src/pages/about-page/about-page.ts"

# run unit tests 
if [ "$1" == "--no-tests" ]; then
    echo "Running commit script with no tests!"
else
    echo "Running unit tests ..."
    TEST_ERRORS="`npm test`"
    if [ $? -eq 0 ]; then
        echo "UNIT TESTS PASSED!"
    else
        echo "UNIT TESTS FAILED! FIX AND TRY AGAIN. EXITING."
        exit 1
    fi
fi

# grab a commit message
echo "Please enter commit message text now:"
read MESSAGE

# Throwing this one here to avoid developers introducing tabs in files.
#
# replace all tabs in text files in ./src with spaces.  (see:
# stackoverflow.com/questions ...
# ... /4767396/linux-command-how-to-find-only-text-files)
find ./src -type f -exec grep -Iq . {} \; -and -print \
    | xargs sed -i 's/[ \t]*$//'

if [ ! -e $VERSIONFILE ]; then
    echo "No VERSION file - are you running this from the project home dir?"
    echo "Exiting ..."
    exit 1
fi

VERSION="`cat $VERSIONFILE`"
NUM="`echo $VERSION | sed 's/.*\.//'`"

NEWNUM="`echo $NUM "+1" | bc`"
NEWVERSION="`echo $VERSION | perl -pe 's/(.*)\.\d+$/$1/'`.$NEWNUM"

echo "Bumping up version #: $VERSION -> $NEWVERSION"

SEDSTR="s/$VERSION/$NEWVERSION/"

# change version in config.xml, about.ts & package.json
sed -i.bak $SEDSTR $CONFIGFILE
sed -i.bak $SEDSTR $ABOUTFILE
sed -i.bak $SEDSTR package.json

echo "Pre-commit git status:\n----------------------"
git status

echo -e "\n\nCommitting with comment:\n\n" $MESSAGE "\n\n"

git add -A
git commit -m "$MESSAGE"
git push

# now change VERSION and commit
echo $NEWVERSION > VERSION
git add VERSION
git commit -m "$NEWVERSION"
git push

# now tag all with that version
git tag -a "v$NEWVERSION" -m "See CHANGELOG.md for major version tag changes"
# push tags to cloud
git push --tags

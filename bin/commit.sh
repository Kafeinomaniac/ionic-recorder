#/bin/sh

# this is the only way we will commit from now on!
# it automatically increments version numbers and automatically
# tags each time.

# path to file containing the version
VERSIONFILE="VERSION"
CONFIGFILE="config.xml"
ABOUTFILE="app/pages/about/about.ts"

read MESSAGE

if [ ! -e $VERSIONFILE ]; then
    echo "No VERSION file - are you running this from the project home dir?"
    echo "Exiting ..."
    exit 1
fi

VERSION="`cat $VERSIONFILE`"
NUM="`echo $VERSION | sed 's/.*\.//'`"

NEWNUM="`echo $NUM "+1" | bc`"
NEWVERSION="`echo $VERSION | perl -pe 's/(.*)\.\d+$/$1/'`.$NEWNUM"

echo "$VERSION -> $NEWVERSION"

# change version in config.xml
cat $CONFIGFILE | sed 's/$VERSION/$NEWVERSION/' > $CONFIGFILE

# change version in about.ts
cat $ABOUTFILE | sed 's/$VERSION/$NEWVERSION/' > $ABOUTFILE

echo "STATUS:"
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
git push --tags

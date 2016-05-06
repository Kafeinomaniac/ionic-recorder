#/bin/sh

# this is the only way we will commit from now on!
# it automatically increments version numbers and automatically
# tags each time.

# path to file containing the version
VERSIONFILE="VERSION"

read MESSAGE

if [ ! -e $VERSIONFILE ]; then
    echo "No VERSION file - are you running this from the project home dir?"
    echo "Exiting ..."
    exit 1
fi

VERSION="`cat $VERSIONFILE | sed 's/.*VERSION\s*=\s(.*)\s*;*//'`"
NUM="`echo $VERSION | sed 's/.*\.//'`"

NEWNUM="`echo $NUM "+1" | bc`"
NEWVERSION="`echo $VERSION | perl -pe 's/(.*)\.\d+$/$1/'`.$NEWNUM"

echo "$VERSION -> $NEWVERSION"

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

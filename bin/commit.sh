#/bin/sh

# this is the only way we will commit from now on!
# it automatically increments version numbers and automatically
# tags each time.

# path to file containing the version
VERSIONFILE="VERSION"
CONFIGFILE="config.xml"
ABOUTFILE="app/pages/about/about.ts"

# run unit tests 
TESTRESULT=`npm test 2>&1  | grep -e Finished | egrep "karma|unit-test"`
echo $TESTRESULT
exit 1


# grab a commit message
read MESSAGE

# replace all tabs in text files in ./app with spaces.  (see:
# stackoverflow.com/questions/4767396/linux-command-how-to-find-only-text-files)
find ./app -type f -exec grep -Iq . {} \; -and -print \
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

echo "$VERSION -> $NEWVERSION"

SEDSTR="s/$VERSION/$NEWVERSION/"

# change version in config.xml
sed -i.bak $SEDSTR $CONFIGFILE

# change version in about.ts
sed -i.bak $SEDSTR $ABOUTFILE

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

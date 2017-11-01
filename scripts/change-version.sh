#!/bin/bash

VERSIONFILE="VERSION"
VERSION="`cat $VERSIONFILE`"
NEWVERSION="$1"

# FILES_WITH_VERSION="`rgrep -l $VERSION`"
FILES_WITH_VERSION="package.json VERSION src/pages/about-page/about-page.ts"

PERL_CMD="s/$VERSION/$NEWVERSION/g"
PERL_CMD="`echo $PERL_CMD | sed 's/\./\\\./g'`"

if [ "$NEWVERSION" == "" ]; then
    echo "ERROR: must supply new version name as argument, exiting ..."
    exit 1
fi

for i in $FILES_WITH_VERSION; do
    perl -pi -e $PERL_CMD $i
done

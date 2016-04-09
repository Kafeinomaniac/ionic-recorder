#!/bin/bash

# Copyright (C) 2016 Tracktunes Inc

# assumes we're in project root directory when we run this

echo "Fixing typings ..."

GREP="`grep 'expand:' node_modules/rxjs/*.d.ts 2>&1 | grep -v ': Is a directory' | grep 'concurrent: number, scheduler: Scheduler' | nl`"
NFILES="`echo $GREP | awk '{print $1}'`"

if [ "$NFILES" != "1" ]; then
    echo "./fix_typings.sh patch does not match exactly 1 file. Grep reult:"
    echo "$GREP"
    exit 0
fi

FILE="`echo $GREP | awk '{print $2}' | sed 's/://'`"

cp "$FILE" "${FILE}.ORIG" > /dev/null 2>&1

sed -i 's/concurrent:/concurrent?:/' ${FILE}
sed -i 's/scheduler:/scheduler?:/' ${FILE}


# fix the warning for promise.d.ts
#
# PROMISEFILE="node_modules/angular2/src/facade/promise.d.ts"
# FIRST_LINE="declare var Promise: PromiseConstructor;"
#
# cp $PROMISEFILE "${PROMISEFILE}.ORIG"
#
# TMPFILE=.tmp$RANDOM
# echo  $FIRST_LINE > $TMPFILE
# cat $PROMISEFILE >> $TMPFILE
# mv $TMPFILE $PROMISEFILE

#!/bin/bash


# this script does global code formatting

# fix multiline problem of lines showing up like:
#
# ...           <
#      any > ...
#
# assumes flush-trailing-whitespace already happened
find src -name \*\.ts -exec \
     perl -i -0777pe \
     's/<\n( +)(\w+)\s*>\s*/\n$1<$2>/sg' \
     '{}' \;

find src -name \*\.ts -exec \
     perl -i -pe \
     's/([^\s])\s*<\s*(\w+)\s*>\s*/$1<$2>/g' \
     '{}' \;

# find src -name \*\.ts -exec \
#      perl -i -pe \
#      's\a+/>= /> = /g' \
#      '{}' \;

find src -name \*\.ts -exec \
     perl -i -pe \
     's/>\{/> \{/g' \
     '{}' \;

find src -name \*\.ts -exec \
     perl -i -pe \
     's/ \? :/\?:/' \
     '{}' \;

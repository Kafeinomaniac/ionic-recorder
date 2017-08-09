#!/bin/bash

# this script does global code formatting
find src -name \*\.ts -exec perl -pi -e 's/ *< *([^ ]*) *> */<$1>/' '{}' \;

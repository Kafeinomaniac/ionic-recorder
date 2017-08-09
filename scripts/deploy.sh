#!/bin/bash

DEST_HOST="tracktunes.org"




DEST_DIR="tracktunes-homepage/platforms/browser/www/ionic-recorder"
SRC_DIR="platforms/browser/www"
RSYNC_DEST="${DEST_HOST}:${DEST_DIR}/"

# cd to project (parent) folder - everything gets done from root from now on
cd "${0%/*}/.."

echo "SRC: `hostname -s`:`pwd`"
echo "DEST: $RSYNC_DEST"

npm run build

# TODO: commit here

# remove destination dir remotely first
ssh "$DEST_HOST" "/bin/rm -fr $DEST_DIR/*"

# copy destination dir to remote
rsync -avz "${SRC_DIR}/" "$RSYNC_DEST"

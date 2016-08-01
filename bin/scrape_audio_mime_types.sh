#!/bin/bash

URL="https://www.sitepoint.com/web-foundations/mime-types-complete-list/"

curl $URL 2>&1 | grep 'audio/' | sed 's/^<td .*">//' | sed 's/<\/td>$//' | sort -u

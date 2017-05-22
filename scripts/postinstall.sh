#!/bin/bash

/bin/rm -fr platforms/browser && \
cordova platform add browser && \
cordova build && \
webdriver-manager update

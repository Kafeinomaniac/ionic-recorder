#!/bin/bash

# "postinstall": "ionic cordova platform add browser && cordova prepare && webdriver-manager update",

/bin/rm -fr platforms/browser
ionic cordova platform add browser
cordova prepare 
cordova build 
webdriver-manager update



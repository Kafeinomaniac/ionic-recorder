#!/bin/bash

# Copyright (C) 2016 Tracktunes Inc

mkdir -p typings
/bin/rm -fr typings.json typings/*

APP_NAME="ionic-recorder"
GITHUB_PATH="tracktunes/$APP_NAME"

# created/modified typings from this project/app's repo
for typing in \
    local=github:$GITHUB_PATH/typings/globals/local/index.d.ts \
    waa=github:$GITHUB_PATH/typings/globals/waa/index.d.ts \
    MediaStream=github:$GITHUB_PATH/typings/globals/MediaStream/index.d.ts
do
    ./bin/typings install --global --save $typing
done

# dt (definitely typed) source typings
for typing in \
    angular-protractor bluebird chalk del es6-shim express \
    express-serve-static-core glob gulp gulp-load-plugins gulp-typescript \
    gulp-util jasmine karma log4js mime minimatch node orchestrator q \
    run-sequence selenium-webdriver serve-static through2 vinyl
do
    ./bin/typings install --global --no-insight --save-dev dt~$typing
done

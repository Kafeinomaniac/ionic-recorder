#!/bin/bash

# Copyright (C) 2016 Tracktunes Inc

mkdir -p typings
/bin/rm -fr typings.json typings/*

APP_NAME="ionic-recorder"
GITHUB_PATH="tracktunes/$APP_NAME"

# locally created typings in the repo are global
for typing in \
    local=github:$GITHUB_PATH/typings/globals/local/index.d.ts \
    waa=github:$GITHUB_PATH/typings/globals/waa/index.d.ts
do
    ./bin/typings install -G -SG $typing
done

# globalDevDependencies typings
# for typing in \
#     angular-protractor bluebird chalk del es6-shim express \
#     express-serve-static-core glob gulp gulp-load-plugins gulp-typescript \
#     gulp-util jasmine karma log4js mime minimatch node orchestrator q \
#     run-sequence selenium-webdriver serve-static through2 vinyl
# do
#     ./bin/typings install --global --no-insight --save-dev dt~$typing
# done

# globalDependencies typings
for typing in \
    es6-shim
do
    ./bin/typings install -G -SG dt~$typing
done

# globalDevDependencies typings
for typing in \
    angular-protractor \
    jasmine \
    node \
    selenium-webdriver
do
    ./bin/typings install -G -DG dt~$typing
done

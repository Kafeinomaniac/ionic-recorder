#!/bin/bash

GREPV='main\.ts|\.spec\.ts|\.d.ts|test\.ts|polyfills\.ts|mocks\.ts|index\.ts|\.mock\.ts'

find . -name \*\.ts | egrep -v $GREPV

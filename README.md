# ionic-recorder

Sound recording mobile / browser hybrid app, based on the Ionic framework,
the Web Audio Interface and IndexedDB.

## Introduction

This app combines
* [Ionic 2.x](http://ionicframework.com/docs/v2/)
* [Web Audio Interface](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and 
  [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API)
* [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

to build
* A simple recording app (hybrid app that can run either in your browser or 
  as an ios/android native app)
* Useful real-time visualizations, stats and data-analysis of the recorded 
  audio signal

## Requirements
* This apps runs only in browsers that implement
  [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API).
  and a late version of IndexedDB that supports the `onupgradeended` event.
  
## Installation and getting started
* Get the latest versions of npm and nodejs (we use 'n' to manage nodejs version):

        sudo npm install -g npm
        sudo npm install -g n
        sudo n stable
* First, you need some global npm packages, in a shell, type
 
        sudo npm install -g ionic@beta
        sudo npm install -g cordova
* In a shell, type

        git clone https://github.com/tracktunes/ionic-recorder
        cd ionic-recorder
* Install the npm packages needed by this project

        npm install
* Typescript will complain about some missing types at a couple of spots in the node_modules packages just installed.  To avoid those, execute:

        ./bin/fix_typings.sh

* You should be good to go.  The app will pop up in a 'chromium-browser' if you have that installed on your linux box, after you type 'npm start' - you can check the script section of 'package.json' to find a few other useful global commands - for testing, for example. 

## Version
The current version is maintained [in the VERSION file at the project's home directory](https://github.com/tracktunes/ionic-recorder/blob/master/VERSION).

It corresponds to a git tag by the same name, with a 'v' prefix added in the git tag name.

## License

This software is licensed under the [GNU General Public License, version 2 (GPL-2.0)](https://opensource.org/licenses/GPL-2.0)

## Copyright

Copyright (C) 2015, 2016 Tracktunes Inc.

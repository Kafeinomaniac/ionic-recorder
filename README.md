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

## Live demo
A live demo, though completely unoptimized (this code is still in alpha so anything goes!) exists on 

[https://tracktunes.org/ionic-recorder](https://tracktunes.org/ionic-recorder)

This app asks for permission to use  your microphone (obviously).

This app runs 100% locally - nothing, no audio ever gets transmitted over the internet with this app.

## Requirements for running the app
This apps runs only in browsers that implement
[MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API).
and a late version of IndexedDB that supports the `onupgradeended` event.

The only browsers on which we successfully tested the above link is
* Chrome 49.0.2623.105 running on Android 6.0.1
* Firefox 45 on Ubuntu
  
## For developers: installing the development environment and getting started
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

* You should be good to go.  Check the Getting Started Coding page or the Getting Started Using page (neither page exists yet). You can open the root directory 'ionic-recorder' in VSCode.  All the code is under subdirectory 'app'.

* The 'package.json' file has some useful high level commands at the 'scripts' subsection.  Sample useful commands in there:

        npm test - runs through tests
        npm start - starts a server and pops up a browser running the app

## Version
The current version is maintained [in the VERSION file at the project's home directory](https://github.com/tracktunes/ionic-recorder/blob/master/VERSION).

It corresponds to a git tag by the same name, with a 'v' prefix added in the git tag name.

## License

This software is licensed under the [GNU General Public License, version 2 (GPL-2.0)](https://opensource.org/licenses/GPL-2.0)

## Copyright

Copyright (C) 2015, 2016 Tracktunes Inc.

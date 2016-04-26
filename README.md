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
A live demo of the app even in its current (sometimes broken) alpha state is up on 

[https://tracktunes.org/ionic-recorder](https://tracktunes.org/ionic-recorder)

This app asks for permission to use  your microphone, for recording and sound monitoring.

But the app runs 100% locally, on your device: nothing (no information about you, no audio) gets transmitted over the internet with this app. 

It is only for you to record from your device's microphone audio tht goes onto your device in an internal database only
accessible when you use this app, unles you use the app's share button (not yet implemented).

Tracktunes Inc currently uses that link for debugging purposes (it's over SSL, which allows us to test more easily on Chrome) so expect it to be broken sometimes, until the beta release.  When beta is released, we'll have a separate staging system with its own SSL certificates elsewhere.

## Requirements for running the app
This apps runs only in browsers that implement
[MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder_API).
and a late version of IndexedDB that supports the `onupgradeended` event.

The only browsers on which we successfully tested the above link is
* Firefox 45.0 on Ubuntu Linux
* That's it for now: Chrome has a problem in `decodeAudioData()`: it cannot
  decode the same blob that the it used to save the file via `MediaRecorder()`!

## DEVELOPMENT

### Roadmap
We will set up a separate page for that.  In the meantime the main high-level goal is 
to make this simple app as stable as possible and not add any features.

## Installing the development environment and getting started
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

* You can develop now.  Check the Getting Started Coding page or the Getting Started Using page (neither page exists yet). You can open the root directory 'ionic-recorder' in VSCode.  All the code is under subdirectory 'app'.

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

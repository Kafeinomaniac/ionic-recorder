# ionic-recorder

`ionic-recorder` is a sound recording hybrid app - "hybrid", meaning the same code works in your browser if served from a web server or as a native app running on any of the platforms: Android, iOS or Windows Phone.

`ionic-recorder` combines
* [Ionic](http://ionicframework.com/docs/v2/)
* [Web Audio API](
        https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## Features
* Simple user interface for recording sounds
* Real-time visualizations, stats and data-analysis of incoming audio
* A file/folder music organizer for recordings and links

## Project Status

This project is still very much a work in progress. As long as its
version is labeled "alpha" (as is the case now), expect lots of bugs
and constantly changing code without all features implemented.  As
soon as the vast majority of features is implemented and some testing
has occurred, we will change to "beta" status and adopt a more stable
change path.

## System Requirements (for running the app)

This apps runs only in browsers that implement
a recent version of the Web Audio Api.

This app wors on recent Chrome and Firefox desktop browser versions.
On Andfoid/iOS, some features are still only partially supported,
specifically, the recording may come out at low quality due to buggy
implementation of `getUserMedia()` on your device, e.g. Samsung Galaxy
S7 - [check this link](http://caniuse.com/#feat=stream) to see if your
browser fully supports `getUserMedia()`.

## Live Demo
The following URL hosts a live demo of the current version of the code:
[https://tracktunes.org/ionic-recorder](https://tracktunes.org/ionic-recorder)

**NOTE:** Until the beta release, expect bugs and 
unimplemented features.

## Development

Feel free to work on whatever you like, of course - but there are specific
places where we feel we need help and those are all the issues marked with
the label 'help wanted' on [the issues page](
        https://github.com/tracktunes/ionic-recorder/issues).
Please refer to the file [CONTRIBUTING.md](
    https://github.com/tracktunes/ionic-recorder/blob/master/CONTRIBUTING.md)
if joining our developer community. Welcome!

### Installing the development environment and running from sources
* Install, on your development machine, the latest stable version of
the following global packages (the first one may be a system package,
the rest are installed via `npm -g` as they are command-line tool but
if you don't like using -g, ensure these command-line tools are on
your path):
  * npm
  * Ionic CLI (`npm install -g ionic@beta`)
  * Cordova (`npm install -g cordova`)
  * Webdriver (`npm install -g webdriver-manager`)
  * node (`npm install -g node`)
* Clone the repository and cd into it

        git clone https://github.com/tracktunes/ionic-recorder
        cd ionic-recorder
* Install the npm packages needed by this project

        npm install
  This last command also performs some postinstall actions.

* You can develop now. As usual, all the code is
under subdirectory './app'. Useful commands from 'package.json': 

        npm start
  which starts a server and pops up a browser tab with the app running in it, or

        npm test
  which runs through the unit tests. Or, you can run

        npm run test-coverage
  which leaves `./coverage/index.html` with a coverage report of your unit tests. Or, you can run

        npm run e2e
  which uses selenium to interact with a real copy of your app running in a browser.

## Version
The current version is maintained in the
[VERSION](https://github.com/tracktunes/ionic-recorder/blob/master/VERSION)
file.

The version in this file corresponds to a git tag by the same name,
with a 'v' prefix added in the git tag name.

## License

This software is licensed under the [GNU General Public License, version 2 (GPL-2.0)](https://opensource.org/licenses/GPL-2.0)

## Copyright

Copyright (C) 2017 Tracktunes Inc. ([tracktunes.org](https://tracktunes.org))
All Rights Reserved.

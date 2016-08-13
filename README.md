# ionic-recorder

`ionic-recorder` is a sound recording hybrid app and also a progressive
web app, based on the Ionic framework, Web Audio API and IndexedDB. This
app is written to run in recent versions of the Chrome / Chromium browser
on any device.

`ionic-recorder` combines
* [Ionic 2](http://ionicframework.com/docs/v2/)
* [Web Audio API](
        https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* [IndexedDB](
        https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

to build
* A simple recording app (hybrid app that can run either in your browser or 
  as an ios/android native app)
* Useful real-time visualizations, stats and data-analysis of the recorded 
  audio signal
* A music organizer to keep your recordings as files and folders on your
device or on the cloud (cloud code not yet implemented)

## System Requirements (for running the app)
This apps runs only in browsers that implement
a late version of IndexedDB that supports the `onupgradeended` event,
plus a recent version of the Web Audio Api.

The only browsers on which we successfully tested the above link are:
* Latest Chrome or latest Chromium browser
* Latest Firefox

## Live Demo
Unoptimized version at 
[https://tracktunes.org/ionic-recorder](https://tracktunes.org/ionic-recorder)

**NOTE:** Until the official beta release, expect lots of bugs and 
unimplemented features.

**NOTE:** The About page shows the version number that's running there, it 
should be the same as in the [VERSION]
(https://github.com/tracktunes/ionic-recorder/blob/master/VERSION)
file.

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
which starts a server and pops up a browser tab with the app running in it,
or

        npm test
which runs through the unit tests.

## Version
The current version is maintained in the
[VERSION](https://github.com/tracktunes/ionic-recorder/blob/master/VERSION)
file.

The version in this file corresponds to a git tag by the same name,
with a 'v' prefix added in the git tag name.

## License

This software is licensed under the [GNU General Public License, version 2 (GPL-2.0)](https://opensource.org/licenses/GPL-2.0)

## Copyright

Copyright (C) 2016 Tracktunes Inc. ([tracktunes.org](https://tracktunes.org))

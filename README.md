Sound recording mobile / browser hybrid app, based on the Ionic framework,
Web Audio API and IndexedDB.

## Introduction

This app combines
* [Ionic 2](http://ionicframework.com/docs/v2/)
* [Web Audio
  Interface](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
to build
* A simple recording app (hybrid app that can run either in your browser or 
  as an ios/android native app)
* Useful real-time visualizations, stats and data-analysis of the recorded 
  audio signal

## Requirements for running the app
This apps runs only in browsers that implement
a late version of IndexedDB that supports the `onupgradeended` event.

The only browsers on which we successfully tested the above link are:
* Latest Chrome or latest Chromium browser
* So far we're only testing in Ubuntu Linux 14.04.

## DEVELOPMENT

### Roadmap
**TBA: We will set up a separate page for that.**  

### Contribution guidelines

See the file [CONTRIBUTING.md](https://github.com/tracktunes/ionic-recorder/blob/master/CONTRIBUTING.md)

### Installing the development environment and getting started
* Get the latest version of npm and get rid of any Ubuntu packages for
node or npm - in a bash shell, type the following commands:
        sudo apt-get remove -f -y --purge ax25-node node node-\* nodejs rlwrap npm > /dev/null 2>&1
        sudo apt-get autoremove -y --purge
        curl https://www.npmjs.com/install.sh | bash -
        hash -r
* Get the latest versions of npm and nodejs:

        sudo npm install -g n ionic@beta cordova webdriver-manager
* Install node via n

        sudo n stable
* In a shell, type

        git clone https://github.com/tracktunes/ionic-recorder
        cd ionic-recorder
* Install the npm packages needed by this project

        npm install
This last command also performs some postinstall actions.

* You can develop now.  Check the Getting Started Coding page or the
  Getting Started Using page (neither page exists yet). You can open
  the root directory 'ionic-recorder' in VSCode.  All the code is
  under subdirectory 'app'.

* The 'package.json' file has some useful high level commands at the
  'scripts' subsection.  Sample useful commands in there:

        npm start - starts a server and pops up a browser running the app
        npm test - runs through tests
        npm e2e - runs end-to-end tests

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

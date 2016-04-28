#!/usr/bin/env python

import json

def updatePackageDotJson():
    jsonFile = open('package.json', 'r')
    data = json.load(jsonFile)
    jsonFile.close()

    data['name'] = 'ionic-recorder'
    data['description'] = 'ionic-recorder: Ionic2 / WebAudio hybrid app'
    data['license'] = 'GPL-2.0'
    data['repository'] = {
        'type': 'git',
        'url': 'https://github.com/tracktunes/ionic-recorder.git'
    }
    data['scripts'] = {
        'build': 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ ionic.build',
        'e2e': 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.build.e2e && ./node_modules/protractor/bin/protractor test/protractor.conf.js',
        'karma': 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.karma.debug',
        'start': 'ionic serve --browser chromium-browser',
        'test': 'find ./app -type f | xargs sed -i "s/[ \t]*$//" ; bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test',
        'test.watch': 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.watch.build',
        'webdriver-update': 'webdriver-manager update'   
    }

    jsonFile = open("package.json", "w+")
    jsonFile.write(json.dumps(data, indent=4));
    jsonFile.close()


if __name__ == "__main__":
    updatePackageDotJson();

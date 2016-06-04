#!/usr/bin/env python

import json
from collections import OrderedDict

def updatePackageDotJson():    
    # set up fields
    with open('package.json', 'r') as jsonFile:
        loadedData = json.load(jsonFile)
        loadedDependencies = loadedData['dependencies']
        loadedDevDependencies = loadedData['devDependencies']
        dependencies = OrderedDict(sorted(loadedDependencies.items))
        devDependencies = OrderedDict(sorted(loadedDevDependencies.items))
    name = 'ionic-recorder'
    with open('VERSION', 'r') as versionFile:
        version = versionFile.read().replace('\n', '')
    description = 'Ionic2 recording app based on WebAudio'
    cordovaPlugins = []
    cordovaPlatforms = []
    scripts = OrderedDict([
        ('build', 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ ionic.build'),
        ('e2e', 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.build.e2e && ./node_modules/protractor/bin/protractor test/protractor.conf.js'),
        ('karma', 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.karma.debug'),
        ('start', 'ionic serve --browser chromium-browser'),
        ('test', "find ./app -type f | xargs sed -i 's/[ \t]*$//' ; bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test"),
        ('test.watch', 'bin/gulp --gulpfile test/gulpfile.ts --cwd ./ test.watch.build'),
        ('webdriver-update', 'webdriver-manager update')
    ])
    repository = OrderedDict([
        ('type', 'git'),
        ('url', 'https://github.com/tracktunes/ionic-recorder.git')
    ])
    license = 'GPL-2.0'

    # write fields
    with open('package.json', 'w+') as jsonFile:
        json.dump(OrderedDict([
            ('dependencies', dependencies),
            ('devDependencies', devDependencies),
            ('name', name),
            ('version', version),
            ('description', description),
            ('cordovaPlugins', cordovaPlugins),
            ('cordovaPlatforms', cordovaPlatforms),
            ('scripts', scripts),
            ('repository', repository),
            ('license', license)
        ]), jsonFile, indent=2, separators=(',', ': '))


if __name__ == '__main__':
    updatePackageDotJson();

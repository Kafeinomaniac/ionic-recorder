To run the protractor tests, see

    https://angular.github.io/protractor/#/tutorial

but basically you'll need to do

    node_modules/protractor/bin/webdriver-manager update
    node_modules/protractor/bin/webdriver-manager start
before running

    npm run e2e
from the project's home directory (..).  You'll also need
at least one e2e files - one is created in app/app.e2e.ts

import { browser, element, by } from 'protractor';

function clickScrollContent() {
    element.all(by.css('ion-content div.scroll-content')).get(0).click();
}

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        // see https://github.com/angular/protractor/issues/2643
        // to understand line: browser.ignoreSynchronization = true;
        browser.ignoreSynchronization = true;
        browser.get('');
    });

    it('should have a title', () => {
        browser.getTitle().then(
            title => expect(title).toEqual('ionic-recorder')
        );
    });

    it('should have {nav}', () => {
        element(by.css('ion-navbar')).isPresent().then(
            present => expect(present).toEqual(true));
    });

    it('should have correct nav text for Home', () => {
        expect(element(by.css('ion-navbar:first-child')).getText())
            .toContain('Record');
    });

    it('has a menu button that displays the left menu', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('.toolbar-title')).get(0).getText()
                .then(text => expect(text).toEqual('Go to ...'));
            clickScrollContent();
        });
    });

    it('the left menu has 1st link with title Record', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(0).getText()
                .then(text => expect(text).toEqual('Record'));
            clickScrollContent();
        });
    });

    it('the left menu has 2nd link with title Library', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(1).getText()
                .then(text => expect(text).toEqual('Library'));
            clickScrollContent();
        });
    });

    it('the left menu has 3rd link with title Settings', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(2).getText()
                .then(text => expect(text).toEqual('Settings'));
            clickScrollContent();
        });
    });

    it('the left menu has 4th link with title About', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(3).getText()
                .then(text => expect(text).toEqual('About'));
            clickScrollContent();
        });
    });

    it('can record', (done) => {
        // hit record button - start recording
        element.all(by.css('div.recording-controls button')).get(0).click();
        setTimeout(() => {
            // this block of code is done after a 3000msec wait
            // hit stop-button - stop recording
            element.all(by.css('div.recording-controls button')).get(1)
                .click();
            browser.driver.sleep(500);
            // click on the last recording new button to go to track page
            element.all(by.css('ion-content ion-card button')).click();

            // track page displays during this next sleep and plays audio
            browser.driver.sleep(3500);
            // click track page back button to go back to record page
            element.all(
                by.css('track-page ion-header ion-navbar button.back-button')
            ).click();
            // sleep for a bit to show record page
            browser.driver.sleep(1000);
            done();
        }, 3000);
    });

    it('can go to library page', (done) => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            // click the library page button to go to library page
            element.all(by.css('ion-list button')).get(1).click();
            browser.driver.sleep(3900);
            done();
        });
    });

});

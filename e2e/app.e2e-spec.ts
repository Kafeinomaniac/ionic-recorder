import { browser, element, by } from 'protractor';

function waitForAndAcceptAlert(expectedText: string) {
    browser.switchTo().alert().then((alertInFocus: any) => {
        alertInFocus.getText().then(text => expect(text).toEqual('Allow'));
        expect(alertInFocus.getText()).toEqual(expectedText);
        alertInFocus.accept();
    }, fail);
}

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        // see https://github.com/angular/protractor/issues/2643
        // to understand line: browser.ignoreSynchronization = true;
        browser.ignoreSynchronization = true;
        browser.get('');
    });

    // it('should pop up an alert', () => {
    //     waitForAndAcceptAlert('');
    // });

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
            element.all(by.css('.toolbar-title')).first().getText()
                .then(text => expect(text).toEqual('Go to ...'));
            element(by.css('ion-content div.scroll-content')).click();
        });
    });

    it('the left menu has 1st link with title Record', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).first().getText()
                .then(text => expect(text).toEqual('Record'));
            element(by.css('ion-content div.scroll-content')).click();
        });
    });

    it('the left menu has 2nd link with title Library', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(1).getText()
                .then(text => expect(text).toEqual('Library'));
            element(by.css('ion-content div.scroll-content')).click();
        });
    });

    it('the left menu has 3rd link with title Settings', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).get(2).getText()
                .then(text => expect(text).toEqual('Settings'));
            element(by.css('ion-content div.scroll-content')).click();
        });
    });

    it('the left menu has 4th link with title About', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-label')).last().getText()
                .then(text => expect(text).toEqual('About'));
            element(by.css('ion-content div.scroll-content')).click();
        });
    });

    it('can record', (done) => {
        // start recording
        element.all(by.css('div.recording-controls button'))
            .get(0).click();
        setTimeout(() => {
            // stop recording
            element.all(by.css('div.recording-controls button'))
                .get(1).click();
            browser.driver.sleep(500);
            element.all(by.css('ion-content ion-card button')).click();
            browser.driver.sleep(3500);
            element.all(by.css(
                'track-page ion-header ion-navbar button.back-button')).click()
            browser.driver.sleep(3900);
            done();
        }, 3000);
    });

    it('can go to library page', (done) => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            // wait for the animation
            browser.driver.sleep(1000);
            element.all(by.css('ion-list button')).get(1).click();
            browser.driver.sleep(3900);
            done();
        });
    });

});

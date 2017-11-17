import { browser, element, by } from 'protractor';

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        // see https://github.com/angular/protractor/issues/2643
        // to understand line: browser.ignoreSynchronization = true;
        browser.ignoreSynchronization = true;
        browser.get('');
    });

    it('should have a title', () => {
        browser.getTitle().then(title =>
                                expect(title).toEqual('ionic-recorder'));
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
            browser.driver.sleep(2000); // wait for the animation
            element.all(by.css('.toolbar-title')).first().getText()
                .then(text => expect(text).toEqual('Go to ...'));
        });
    });

    it('the left menu has 1st link with title Record', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            browser.driver.sleep(2000); // wait for the animation
            element.all(by.css('ion-label')).get(0).getText()
                .then(text => expect(text).toEqual('Record'));
        });
    });

    it('the left menu has 2nd link with title Library', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            browser.driver.sleep(2000); // wait for the animation
            element.all(by.css('ion-label')).get(1).getText()
                .then(text => expect(text).toEqual('Library'));
        });
    });

    it('the left menu has 3rd link with title Settings', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            browser.driver.sleep(2000); // wait for the animation
            element.all(by.css('ion-label')).get(2).getText()
                .then(text => expect(text).toEqual('Settings'));
        });
    });

    it('the left menu has 4th link with title About', () => {
        element(by.css('.bar-button-menutoggle')).click().then(() => {
            browser.driver.sleep(2000); // wait for the animation
            element.all(by.css('ion-label')).get(3).getText()
                .then(text => expect(text).toEqual('About'));
        });
    });

});

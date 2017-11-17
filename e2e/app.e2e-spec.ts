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

    /*
    it('should have correct nav text for Home', () => {
        expect(element(by.css('ion-navbar:first-child')).getText()).toContain('Clickers');
    });

    it('has a menu button that displays the left menu', () => {
        element(by.css('.bar-button-menutoggle')).click()
            .then(() => {
                browser.driver.sleep(2000); // wait for the animation
                element.all(by.css('.toolbar-title')).first().getText().then(text => expect(text).toEqual('Pages'));
            });
    });

    it('the left menu has a link with title Clickers', () => {
        element(by.css('.bar-button-menutoggle')).click()
            .then(() => {
                browser.driver.sleep(2000); // wait for the animation
                element.all(by.css('ion-label')).first().getText().then(text => expect(text).toEqual('Clickers'));
            });
    });

    it('the left menu has a link with title Goodbye Ionic', () => {
        element(by.css('.bar-button-menutoggle')).click()
            .then(() => {
                browser.driver.sleep(2000); // wait for the animation
                element.all(by.css('ion-label')).last().getText().then(text => expect(text).toEqual('Goodbye Ionic'));
            });
    });
    */

});

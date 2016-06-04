import {
    ADDITIONAL_TEST_BROWSER_PROVIDERS,
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS
} from '@angular/platform-browser/testing/browser_static';
import {
    BROWSER_APP_DYNAMIC_PROVIDERS
} from '@angular/platform-browser-dynamic';
import {
    resetBaseTestProviders,
    setBaseTestProviders
} from '@angular/core/testing';
import {Platform} from 'ionic-angular';
import {IonicRecorderApp} from './app';
import {LibraryPage} from './pages/library/library';

resetBaseTestProviders();
setBaseTestProviders(
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    [
        BROWSER_APP_DYNAMIC_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]
);

let APP: IonicRecorderApp = null;

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        let platform: Platform = new Platform();
        APP = new IonicRecorderApp(platform);
    });

    it('initialises with two possible pages', () => {
        expect(APP['pages'].length).toEqual(4);
    });

    it('initialises with a root page', () => {
        expect(APP['rootpage']).not.toBe(null);
    });

    it('initialises with an APP', () => {
        expect(APP['APP']).not.toBe(null);
    });

    it('opens a page', () => {
        spyOn(APP['menu'], 'close');
        // cant be bothered to set up dom testing for APP.ts to get
        // access to @viewchild (nav)
        APP['nav'] = (<any>APP['menu']);
        spyOn(APP['nav'], 'setroot');
        APP.openPage(APP['pages'][1]);
        expect(APP['menu']['close']).toHaveBeenCalled();
        expect(APP['nav'].setRoot).toHaveBeenCalledWith(LibraryPage);
    });
});

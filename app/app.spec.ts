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

import {
    IonicRecorderApp
} from './app';

resetBaseTestProviders();
setBaseTestProviders(
    TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
    [
        BROWSER_APP_DYNAMIC_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS
    ]
);

import {
    Platform,
    MenuController
} from 'ionic-angular';

import {
    LocalDB
} from './services/local-db/local-db';

import {
    AppState
} from './services/app-state/app-state';

import {
    LoadingPage
} from './pages/loading/loading';

let platform: Platform = new Platform(),
    menuController: MenuController = new MenuController(),
    localDB: LocalDB = new LocalDB(),
    appState: AppState = new AppState(localDB),
    app: IonicRecorderApp;

describe('IonicRecorderApp', () => {

    beforeEach(() => {
        // platform = new Platform();
        // menuController = new MenuController();
        // localDB = new LocalDB();
        // appState = new AppState(localDB);
        app = new IonicRecorderApp(
            platform,
            menuController,
            appState
        );
    });

    it('initialises with four possible pages', () => {
        expect(app['pages'].length).toEqual(4);
    });

    it('initialises with loadingPage as root page', () => {
        expect(app['rootPage']).toBeTruthy();
        expect(app['rootPage']).toEqual(LoadingPage);
    });

    // it('goes to a page', () => {
    //     spyOn(app['menu'], 'close');
    //     // cant be bothered to set up DOM testing for
    //     // app.ts to get access to @ViewChild (Nav)
    //     app['nav'] = (<any>app['menu']);
    //     app.goToPage(app['pages'][1]);
    //     expect(app['menu']['close']).toHaveBeenCalled();
    // });
});

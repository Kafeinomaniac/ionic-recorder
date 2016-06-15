import {
    Component,
    ExceptionHandler,
    provide,
    ViewChild,
    Type
} from '@angular/core';

import {
    Tabs,
    ionicBootstrap,
    Platform,
    MenuController
} from 'ionic-angular';

// import {
//     StatusBar
// } from 'ionic-native';

import {
    LocalDB
} from './providers/local-db/local-db';

import {
    AppState
} from './providers/app-state/app-state';

import {
    LoadingPage
} from './pages/loading/loading';

import {
    RecordPage
} from './pages/record/record';

import {
    LibraryPage
} from './pages/library/library';

import {
    SettingsPage
} from './pages/settings/settings';

import {
    AboutPage
} from './pages/about/about';

// Uncomment this block to completely erase browser's IndexedDB
// import {
//     DB_NAME
// } from './providers/local-db/local-db';
// let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);
// request.onsuccess = function(): void {
//     console.log('deleteDatabase: SUCCESS');
// };
// request.onerror = function(): void {
//     console.log('deleteDatabase: ERROR');
// };
// request.onblocked = function(): void {
//     console.log('deleteDatabase: BLOCKED');
// };

// Global catch-all exception handler for this app - any error thrown
// will be handled by this function.
class AppExceptionHandler extends ExceptionHandler {
    public call(error: any, stackTrace: any, reason?: any): void {
        alert('AppExceptionHandler: ' + error);
    }
}

interface TabPage {
    tabIndex: number;
    title: string;
    component: Type;
}

@Component({
    templateUrl: 'build/app.html'
})
export class IonicRecorderApp {
    @ViewChild(Tabs) private tabsRef: Tabs;
    private platform: Platform;
    private menu: MenuController;
    private pages: TabPage[];
    private appState: AppState;
    private loadingPage: Type;

    constructor(
        platform: Platform,
        menu: MenuController,
        appState: AppState
    ) {
        console.log('constructor(): IonicRecorderApp');
        this.platform = platform;
        this.menu = menu;
        this.appState = appState;

        this.loadingPage = LoadingPage;

        // All pages of the side-menu/tabs, in their order of appearance.
        // NOTE: 'tabIndex' must start at 1 and increase by 1 in order,
        // it is here just for programming ease for calls to tabs.select(x)
        this.pages = [
            { tabIndex: 1, title: 'Record', component: RecordPage },
            { tabIndex: 2, title: 'Library', component: LibraryPage },
            { tabIndex: 3, title: 'Settings', component: SettingsPage },
            { tabIndex: 4, title: 'About', component: AboutPage }
        ];
        this.initializeApp();
    }

    /**
     * Initialize native stuff once platform is ready
     * @returns {void}
     */
    public initializeApp(): void {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // [ NOTE: cordova must be available for StatusBar ]
            // StatusBar.styleDefault();
            // NOTE: uncomment next line to pick the page you want selected
            // first on next incarnation of the app.
            // this.selectTab(this.pages[0]);
        });
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public selectTab(page: TabPage): void {
        let tabIndex: number = page.tabIndex;
        this.appState.updateProperty('lastTabIndex', tabIndex).subscribe();
        this.tabsRef.select(tabIndex);
        this.menu.close();
    }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(
    IonicRecorderApp,
    [
        provide(ExceptionHandler, { useClass: AppExceptionHandler }),
        AppState,
        LocalDB
    ],
    {});

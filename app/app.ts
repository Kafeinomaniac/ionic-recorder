import {
    Component,
    ExceptionHandler,
    provide,
    ViewChild,
    Type
} from '@angular/core';

import {
    App,
    Tabs,
    ionicBootstrap,
    Platform,
    MenuController
} from 'ionic-angular';

// import {
//     StatusBar
// } from 'ionic-native';

// import {
//     TabsPage,
//     TAB_PAGES
// } from './pages/tabs/tabs';

// Uncomment to reset DB (step 1/3)
// import {
//     DB_NAME
// } from './providers/local-db/local-db';

import {
    LocalDB
} from './providers/local-db/local-db';

import {
    AppState
} from './providers/app-state/app-state';

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

// Catch-all exception handler for this app
class AppExceptionHandler extends ExceptionHandler {
    public call(error: any, stackTrace: any, reason?: any): void {
        alert('AppExceptionHandler: ' + error);
    }
}

export const TAB_PAGES: Array<{ title: string, component: Type }> = [
    { title: 'Record', component: RecordPage },
    { title: 'Library', component: LibraryPage },
    { title: 'Settings', component: SettingsPage },
    { title: 'About', component: AboutPage }
];

function getComponentTabIndex(component: Type): number {
    'use strict';
    let i: number,
        found: number = -1,
        len: number = TAB_PAGES.length;
    for (i = 0; i < len; i++) {
        if (TAB_PAGES[i].component === component) {
            found = i;
            break;
        }
    }
    return found;
}

@Component({
    templateUrl: 'build/app.html'
    // , directives: [TabsPage]
})
export class IonicRecorderApp {
    @ViewChild(Tabs) private tabsRef: Tabs;
    private app: App;
    private platform: Platform;
    private menu: MenuController;
    private rootPage: Type;
    private pages: Array<{ title: string, component: Type }>;
    private appState: AppState;
    // making selectedIndex a nonsense index stops the problem of
    // the first tab showing for a split second before the real tab
    // displayed via 'lastSelectedTab'
    private mySelectedIndex: number = -1;

    constructor(
        app: App,
        platform: Platform,
        menu: MenuController,
        appState: AppState
    ) {
        console.log('constructor(): IonicRecorderApp');
        this.app = app;
        this.platform = platform;
        this.menu = menu;
        this.appState = appState;

        // this.rootPage = TabsPage;
        this.pages = TAB_PAGES;

        this.appState.getProperty('lastTabIndex').subscribe(
            (tabIndex: number) => {
                // this.selectedIndex = tabIndex;
                this.mySelectedIndex = 1;
                console.log('tab sel: ' + tabIndex);
            }
        );

        // Uncomment line below to reset DB (step 2/3)
        // this.resetDB();
        this.initializeApp();
    }

    // Uncomment method block below to reset DB (step 3/3)
    // /**
    //  * Completely delete the DB and recreate it from scratch!
    //  * @returns {void}
    //  */
    // private resetDB(): void {
    //     let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);
    //     request.onsuccess = function(): void {
    //         console.log('deleteDatabase: SUCCESS');
    //     };
    //     request.onerror = function(): void {
    //         console.log('deleteDatabase: ERROR');
    //     };
    //     request.onblocked = function(): void {
    //         console.log('deleteDatabase: BLOCKED');
    //     };
    // }

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
        });
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public selectTab(page: { title: string, component: Type }): void {
        // close the menu when clicking a link from the menu
        this.menu.close();
        this.tabsRef.select(getComponentTabIndex(page.component));
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

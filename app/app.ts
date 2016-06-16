import {
    Component,
    ExceptionHandler,
    provide,
    ViewChild,
    Type
} from '@angular/core';

import {
    Tabs,
    Tab,
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
// (but only the DB created by this app gets erased)
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
    // NOTE: either one of these @ViewChild declarations works, use only one ..
    // @ViewChild(Tabs) private tabs: Tabs;
    @ViewChild('navTabs') private tabs: Tabs;

    private platform: Platform;
    private menu: MenuController;
    private pages: TabPage[];
    private appState: AppState;
    private rootPage: Type;

    constructor(
        platform: Platform,
        menu: MenuController,
        appState: AppState
    ) {
        console.log('constructor(): IonicRecorderApp');
        this.platform = platform;
        this.menu = menu;
        this.appState = appState;
        // set root of the hidden (first, default) tab
        this.rootPage = LoadingPage;

        // All pages of the side-menu/tabs, in their order of appearance.
        // NOTE: 'tabIndex' must start at 1 and increase by 1 in order,
        // it is here just for programming ease for calls to tabs.select(x)
        this.pages = [
            { tabIndex: 1, title: 'Record', component: RecordPage },
            { tabIndex: 2, title: 'Library', component: LibraryPage },
            { tabIndex: 3, title: 'Settings', component: SettingsPage },
            { tabIndex: 4, title: 'About', component: AboutPage }
        ];

        // load index of last selected tab from DB and select it
        this.appState.getProperty('lastTabIndex').subscribe(
            (tabIndex: number) => {
                console.log('--> lastTabIndex: ' + tabIndex);
                this.tabs.select(tabIndex);
            });

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
            // this.goToPage(this.pages[1]);
        });
    }

    /**
     * Called any time a tab selection has changed
     * @returns {void}
     */
    public onTabChange(selectedTab: Tab): void {
        let tabIndex: number = selectedTab.index;
        console.log('onTabChange: ' + tabIndex);
        console.dir(selectedTab);
        if (tabIndex === 0) {
            // hide tab 0 dynamically because if we hide it in the
            // template with [show]="false" then tabs automatically
            // select tab 1 instead.  at this point, tab 0 has already
            // been selected so this is the point at which it's best
            // to hide it
            selectedTab.show = false;
        }
        if (tabIndex > 0) {
            // save in the DB the 'lastTabIndex' so that if we restart the app
            // it starts with the last tab you've visited last time you used it
            this.appState.updateProperty('lastTabIndex', tabIndex).subscribe();
        }
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public goToPage(page: TabPage): void {
        let tabIndex: number = page.tabIndex;
        this.tabs.select(tabIndex);
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

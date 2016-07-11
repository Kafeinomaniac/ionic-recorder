// Copyright (c) 2016 Tracktunes Inc

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
    IdbAppState
} from './providers/idb-app-state/idb-app-state';

import {
    IdbAppData
} from './providers/idb-app-data/idb-app-data';

import {
    IdbAppFS
} from './providers/idb-app-fs/idb-app-fs';

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

import {
    TrackPage
} from './pages/track/track';

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
    templateUrl: 'build/app.html',
    providers: [IdbAppState]
})
export class IonicRecorderApp {
    // NOTE: either one of these @ViewChild declarations works, use only one ..
    // @ViewChild(Tabs) private tabs: Tabs;
    @ViewChild('navTabs') private tabs: Tabs;

    private platform: Platform;
    private menu: MenuController;
    private idbAppState: IdbAppState;
    private rootPage: Type;
    private pages: TabPage[];

    constructor(
        platform: Platform,
        menu: MenuController,
        idbAppState: IdbAppState
    ) {
        console.log('constructor(): IonicRecorderApp');
        this.platform = platform;
        this.menu = menu;
        this.idbAppState = idbAppState;

        // set root of the hidden (first, default) tab
        this.rootPage = LoadingPage;

        // All pages of the side-menu/tabs, in their order of appearance.
        // NOTE: 'tabIndex' must start at 1 and increase by 1 in order,
        // it is here just for programming ease for calls to tabs.select(x)
        this.pages = [
            { tabIndex: 1, title: 'Record', component: RecordPage },
            { tabIndex: 2, title: 'Library', component: LibraryPage },
            { tabIndex: 3, title: 'Settings', component: SettingsPage },
            { tabIndex: 4, title: 'About', component: AboutPage },
            { tabIndex: 5, title: 'Track', component: TrackPage }
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

            // NOTE: this.tabs @ViewChild property is *defined* here

            // NOTE: uncomment next line to start with a specific page
            // this.goToPage(this.pages[1]);

            this.idbAppState.getProperty('lastTabIndex').subscribe(
                (lastTabIndex: number) => {
                    console.log('initializeApp():lastTabIndex = ' +
                        lastTabIndex);
                    this.tabs.select(lastTabIndex);
                }
            );
        });
    }

    /**
     * Called any time a tab selection has changed
     * @returns {void}
     */
    public onTabChange(selectedTab: Tab): void {
        let tabIndex: number = selectedTab.index;
        console.log('onTabChange: ' + tabIndex);
        if (tabIndex === 0) {
            //
            // hide tab 0 dynamically because if we hide it in the
            // template with [show]="false" then tabs automatically
            // select tab 1 instead.  at this point, tab 0 has already
            // been selected so this is the point at which it's best
            // to hide it
            selectedTab.show = false;
        }
        else {
            // save in the DB the 'lastTabIndex' so that if we restart the app
            // it starts with the last tab you've visited last time you used it
            console.log('updating tab index to be: ' + tabIndex);
            this.idbAppState.updateProperty('lastTabIndex', tabIndex)
                .subscribe();
        }
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public goToPage(page: TabPage): void {
        let tabIndex: number = page.tabIndex;
        console.log('goToPage: ' + tabIndex + ', tabs: ' + this.tabs);
        if (typeof this.tabs !== undefined) {
            // we need this conditional because @ViewChild does not work
            // when karma and this.tabs ends up undefined in karma
            // TODO: make sure you get rid of this hack
            this.tabs.select(tabIndex);
        }
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
        IdbAppState,
        IdbAppData,
        IdbAppFS
    ],
    {});

// Copyright (c) 2017 Tracktunes Inc

import { Component, ViewChild } from '@angular/core';
import { Tabs, Tab, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { IdbAppState } from '../providers/idb-app-state/idb-app-state';
import { LoadingPage } from '../pages/loading-page/loading-page';
import { RecordPage } from '../pages/record-page/record-page';
import { LibraryPage } from '../pages/library-page/library-page';
import { SettingsPage } from '../pages/settings-page/settings-page';
import { AboutPage } from '../pages/about-page/about-page';

export interface TabPage {
    tabIndex: number;
    title: string;
    component: Component;
}

@Component({
    templateUrl: 'app.html'
})
export class IonicRecorderApp {
    // Use one of these @ViewChild declarations (both work):
    // @ViewChild(Tabs) private tabs: Tabs;
    @ViewChild('navTabs') public tabs: Tabs;

    public rootPage: Component;
    public pages: TabPage[];

    private platform: Platform;
    private menu: MenuController;
    private idbAppState: IdbAppState;

    constructor(
        platform: Platform,
        menu: MenuController,
        statusBar: StatusBar,
        idbAppState: IdbAppState
    ) {
        console.log('constructor(): IonicRecordApp');
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
            { tabIndex: 4, title: 'About', component: AboutPage }
        ];

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // [ NOTE: cordova must be available for StatusBar ]
            statusBar.styleDefault();
            statusBar.backgroundColorByHexString('#000000');
            statusBar.hide();

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
        const tabIndex: number = selectedTab.index;
        // console.log('onTabChange: ' + tabIndex);
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
            // save in the DB the 'lastTabIndex' so that if we restart
            // the app it starts with the last tab you've visited last
            // time you used it
            // console.log('updating tab index to be: ' + tabIndex);
            this.idbAppState.updateProperty('lastTabIndex', tabIndex)
                .subscribe();
        }
    }

    /**
     * Go to a page (via menu selection)
     * @returns {void}
     */
    public goToPage(page: TabPage): void {
        const tabIndex: number = page.tabIndex;
        // console.log('goToPage: ' + tabIndex + ', tabs: ' + this.tabs);
        if (typeof this.tabs !== undefined) {
            // we need this conditional because @ViewChild does not work
            // when karma and this.tabs ends up undefined in karma
            // TODO: make sure you get rid of this hack
            this.tabs.select(tabIndex);
        }
        this.menu.close();
    }
}

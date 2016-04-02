// Copyright (c) 2016 Tracktunes Inc

import {App, IonicApp, Platform} from 'ionic-angular';
import {Type, enableProdMode} from 'angular2/core';
import {AppState} from './providers/app-state/app-state';
import {TabsPage} from './pages/tabs/tabs';
import {DB_NAME} from './providers/local-db/local-db';


enableProdMode();


@App({
    templateUrl: 'build/app.html',
    config: { backButtonText: '' }
})
export class TracktunesApp {
    private appState: AppState = AppState.Instance;
    private rootPage: Type = TabsPage;

    // make selectedTab not a real number so that it gets set
    // by what we get from app state for the first time. we use
    // it to ensure we're not updating app state on no change.
    private selectedTab: number = null;

    /**
     * constructor
     * @param {IonicApp} instance used to get tabs component
     * @param {Platform} used for platform-specific styling
     */
    constructor(private app: IonicApp, private platform: Platform) {
        console.log('constructor():TracktunesApp');
        // NB: you can delete the DB here to get rid of it easily in Firefox
        // this.resetDB();
        // this.platform.ready().then(() => {
        // });
    }

    /**
     * Completely delete the DB and recreate it from scratch!
     * @returns {void}
     */
    resetDB() {
        let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);

        request.onsuccess = function() {
            console.log('deleteDatabase: SUCCESS');
        };

        request.onerror = function() {
            console.log('deleteDatabase: ERROR');
        };

        request.onblocked = function() {
            console.log('deleteDatabase: BLOCKED');
        };
    }

    /**
     * Sets up app by selecting last selected tab when elements in DOM
     * @returns {void}
     */
    ngOnInit() {
        this.appState.getProperty('lastSelectedTab').subscribe(
            (tabIndex: number) => {
                this.selectTab(tabIndex, false);
            },
            (getError: any) => {
                console.log('getProperty error: ' + getError);
            }
        ); // getProperty('lastSelectedTab').subscribe(
    }

    /**
     * Used by template/HTML/UI to select a tab
     * @param {number} index of tab (menu item index, zero-indexed)
     * @param {boolean} whether to update AppState's 'lastSelectedTab' property
     */
    selectTab(tabIndex: number, updateAppState: boolean = true) {
        if (tabIndex === this.selectedTab) {
            return;
        }

        let oldId: string = 'button' + this.selectedTab,
            newId: string = 'button' + tabIndex;

        if (this.selectedTab !== null) {
            document.getElementById(oldId).classList.remove('button-selected');
        }

        document.getElementById(newId).classList.add('button-selected');

        this.selectedTab = tabIndex;

        this.app.getComponent('nav-tabs').select(tabIndex);

        if (updateAppState) {
            this.appState.updateProperty('lastSelectedTab', tabIndex)
                .subscribe(
                () => { },
                (error: any) => {
                    alert('in update in app: ' + error);
                }
                ); // updateProperty('lastSelectedTab').subscribe(
        }
    }
}

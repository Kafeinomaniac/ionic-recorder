// Copyright (c) 2016 Tracktunes Inc

import {App, IonicApp, Platform, MenuController} from 'ionic-angular';
import {Type, enableProdMode, ExceptionHandler, provide} from 'angular2/core';
import {AppState} from './providers/app-state/app-state';
import {TabsPage} from './pages/tabs/tabs';
import {DB_NAME} from './providers/local-db/local-db';
// the reason for the following import 'es6-shim'; line is this:
// https://forum.ionicframework.com/t/ionic-2-projects-updating-to-beta-4/49054
// import 'es6-shim';
// Note: the above import broke PhantomJS: see test/karma.config.js.

// check into doing this via ionic's way, the following is angular2 way:
// enableProdMode();


// Global catch-all with this
// AppExceptionHandler class.  NOTE: we use 'extends' instead
// of the more correct 'implements' here in order to avoid
// typescript warnings that did not make sense...
class AppExceptionHandler extends ExceptionHandler {
    call(error, stackTrace = null, reason = null) {
        // do something with the exception
        alert('global catch: ' + error);
    }
}


@App({
    templateUrl: 'build/app.html',
    providers: [provide(ExceptionHandler, { useClass: AppExceptionHandler })]
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
    constructor(private app: IonicApp, private platform: Platform,
        private menu: MenuController) {
        console.log('constructor():TracktunesApp');
        // NB: you can delete the DB here to get rid of it easily in Firefox
        // this.resetDB();
        this.platform.ready().then(() => {
            this.menu.swipeEnable(false);
        });
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

        // TODO: there must be a better way to do this
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
                });
        }
    }
}

// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';
import {
    DB_NAME as APP_DATA_DB_NAME
} from '../../services/idb-app-data/idb-app-data';
import {
    DB_NAME as APP_FS_DB_NAME
} from '../../services/idb-app-fs/idb-app-fs';
import { Idb } from '../../models/idb/idb';

/**
 * Page to change app settings.
 * @class SettingsPage
 */
@Component({
    selector: 'settings-page',
    templateUrl: 'settings-page.html'
})
export class SettingsPage {
    // private appState: AppState;

    /**
     * @constructor
     * @param {NavController} nav
     */
    // constructor(appState: AppState) {
    //     console.log('constructor():SettingsPage');
    //     this.appState = appState;
    // }

    public deleteDb(): void {
        console.log('deleteDb()');
        // TODO: need to reload here, once deep links stabilize...
        try {
            Idb.deleteDb(APP_DATA_DB_NAME).subscribe(
                () => {
                    console.log('deleteDb(): DONE: ' +
                                APP_DATA_DB_NAME);
                    Idb.deleteDb(APP_FS_DB_NAME).subscribe(
                        () => {
                            console.log('deleteDb(): DONE: ' +
                                        APP_FS_DB_NAME);
                            // Idb.deleteDb(APP_STATE_DB_NAME).subscribe(
                            //     () => {
                            //         console.log('deleteDb(): DONE: ' +
                            //             APP_STATE_DB_NAME);
                            //     });
                        });
                });
        }
        catch (err) {
            console.warn('ERROR in deleteDb(): ' + err);
        }
    }
}

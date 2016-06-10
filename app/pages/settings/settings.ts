// Copyright (c) 2016 Tracktunes Inc

import { Component } from '@angular/core';
import {
    AppState,
    LastPageVisited
} from '../../providers/app-state/app-state';

/**
 * @name SettingsPage
 * @description
 * Change app settings.
 */
@Component({
    templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
    // private appState: AppState = AppState.Instance;
    private appState: AppState;

    /**
     * @constructor
     * @param {NavController} nav
     */
    constructor(appState: AppState) {
        console.log('constructor():SettingsPage');
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewDidEnter(): void {

        // update app state's last viewed folder
        this.appState.updateProperty(
            'lastPageVisited',
            LastPageVisited.About
        ).subscribe();
    }
}

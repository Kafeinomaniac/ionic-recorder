// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    AppState
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
        this.appState = appState;
    }
}

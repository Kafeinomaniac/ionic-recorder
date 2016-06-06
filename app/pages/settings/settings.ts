// Copyright (c) 2016 Tracktunes Inc

import {Page} from 'ionic-angular';
import {AppState, LastPageVisited} from '../../providers/app-state/app-state';

/**
 * @name SettingsPage
 * @description
 * Change app settings.
 */
@Page({
    templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
    private appState: AppState = AppState.Instance;

    /**
     * @constructor
     * @param {NavController} nav
     */
    constructor() {
        console.log('constructor():SettingsPage');
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public onPageDidEnter(): void {

        // update app state's last viewed folder
        this.appState.updateProperty(
            'lastPageVisited',
            LastPageVisited.About
        ).subscribe();
    }
}

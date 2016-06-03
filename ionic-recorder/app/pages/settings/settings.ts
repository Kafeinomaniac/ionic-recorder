// Copyright (c) 2016 Tracktunes Inc

import {Page} from 'ionic-angular';

/**
 * @name SettingsPage
 * @description
 * Change app settings.
 */
@Page({
    templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {

    /**
     * @constructor
     * @param {NavController} nav
     */
    constructor() {
        console.log('constructor():SettingsPage');
    }
}

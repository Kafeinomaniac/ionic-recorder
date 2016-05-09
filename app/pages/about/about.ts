// Copyright (c) 2016 Tracktunes Inc

import {Page, MenuController, NavController} from 'ionic-angular';

export const APP_VERSION = '0.0.7-alpha.29';

/**
 * @name AboutPage
 * @description
 * A modal About page that displays the version number of this program
 * among other info.
 */
@Page({
    templateUrl: 'build/pages/about/about.html',
})
export class AboutPage {
    private version: string = APP_VERSION;
    /**
     * AboutPage modal constructor
     */
    constructor(
        private nav: NavController,
        private menuController: MenuController
    ) {
        console.log('constructor():AboutPage');
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    onClickCancel() {
        console.log('onClickCancel()');
    }

    onPageDidEnter() {
        // the left menu should be disabled on the tutorial page
        this.menuController.enable(false);
    }

    onPageDidLeave() {
        // enable the left menu when leaving the tutorial page
        this.menuController.enable(true);
    }

}

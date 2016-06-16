// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    MenuController
} from 'ionic-angular';

const APP_VERSION: string = '0.0.7-alpha.62';

/**
 * @name AboutPage
 * @description
 * A modal About page that displays the version number of this program
 * among other info.
 */
@Component({
    templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
    private menuController: MenuController;
    private version: string;

    /**
     * AboutPage modal constructor
     */
    constructor(menuController: MenuController) {
        console.log('constructor():AboutPage');
        this.menuController = menuController;
        this.version = APP_VERSION;
    }

    /**
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public ionViewDidEnter(): void {
        // the left menu should be disabled on the tutorial page
        this.menuController.enable(false);
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }

    public ionViewDidLeave(): void {
        // enable the left menu when leaving the tutorial page
        this.menuController.enable(true);
    }

}

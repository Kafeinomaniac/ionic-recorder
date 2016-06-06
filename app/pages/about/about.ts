// Copyright (c) 2016 Tracktunes Inc

import {Page, MenuController, NavController} from 'ionic-angular';
import {AppState, LastPageVisited} from '../../providers/app-state/app-state';
export const APP_VERSION: string = '0.0.7-alpha.30';

/**
 * @name AboutPage
 * @description
 * A modal About page that displays the version number of this program
 * among other info.
 */
@Page({
    templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
    private appState: AppState = AppState.Instance;

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
     * https://webcake.co/page-lifecycle-hooks-in-ionic-2/
     * @returns {void}
     */
    public onPageDidEnter(): void {
        // the left menu should be disabled on the tutorial page
        this.menuController.enable(false);

        // update app state's last viewed folder
        this.appState.updateProperty(
            'lastPageVisited',
            LastPageVisited.About
        ).subscribe();
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }

    public onPageDidLeave(): void {
        // enable the left menu when leaving the tutorial page
        this.menuController.enable(true);
    }

}

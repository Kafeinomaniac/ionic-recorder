// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    Nav
} from 'ionic-angular';

import {
    AppState
} from '../../providers/app-state/app-state';

/**
 * @name LoadingPage
 * @description
 * Load initial page, first wait for DB and AppState singletons to initialize.
 */
@Component({
    templateUrl: 'build/pages/loading/loading.html',
    providers: [Nav]
})
export class LoadingPage {
    // private appState: AppState = AppState.Instance;
    private appState: AppState;
    private nav: Nav;

    /**
     * @constructor
     * @param {NavController} nav
     */
    constructor(appState: AppState, nav: Nav) {
        console.log('constructor():LoadingPage');
        this.appState = appState;
        this.nav = nav;
        this.appState.getProperty('lastTabIndex').subscribe(
            (tabIndex: number) => {
                console.log('--> lastTabIndex: ' + tabIndex);
                console.log(this.nav.parent.parent);
                this.nav.parent.parent.select(tabIndex);
                appState.updateProperty('lastTabIndex', tabIndex).subscribe();
            });
    }
}

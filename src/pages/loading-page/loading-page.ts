// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

/**
 * @name LoadingPage
 * @description
 * Load initial page, first wait for DB and IdbAppState singletons
 * to initialize.
 */
@Component({
    templateUrl: 'loading-page.html'
})
export class LoadingPage {
    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():LoadingPage');
    }
}

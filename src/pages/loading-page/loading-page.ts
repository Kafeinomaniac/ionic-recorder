// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';

/**
 * Initial empty page while loading. Not sure why this is useful -DT
 * @class LoadingPage
 */
@Component({
    selector: 'loading-page',
    templateUrl: 'loading-page.html'
})
export class LoadingPage {
    /**
     * @constructor
     */
    constructor() {
        console.log('LoadingPage.constructor()');
    }
}

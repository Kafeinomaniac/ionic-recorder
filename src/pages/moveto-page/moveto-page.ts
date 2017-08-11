// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';

const APP_VERSION: string = '0.1.0-alpha.11';

/**
 * @name MoveToPage
 * @description
 * A modal MoveTo page that displays the version number of this program
 * among other info.
 */
@Component({
    selector: 'moveto-page',
    templateUrl: 'moveto-page.html'
})
export class MoveToPage {
    public version: string;

    /**
     * MoveToPage modal constructor
     */
    constructor() {
        console.log('constructor():MoveToPage');
        this.version = APP_VERSION;
    }

}

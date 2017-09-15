// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';

const APP_VERSION: string = '0.2.1-alpha.55';

/**
 * @name AboutPage
 * @description
 * A modal About page that displays the version number of this program
 * among other info.
 */
@Component({
    selector: 'about-page',
    templateUrl: 'about-page.html'
})
export class AboutPage {
    public version: string;

    /**
     * AboutPage modal constructor
     */
    constructor() {
        console.log('constructor():AboutPage');
        this.version = APP_VERSION;
    }

}

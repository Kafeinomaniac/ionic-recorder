// Copyright (c) 2017 Tracktunes Inc

import { Component } from '@angular/core';

const APP_VERSION: string = '0.2.1-alpha.68';

/**
 * Page that displays info about the app.
 * @class AboutPage
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

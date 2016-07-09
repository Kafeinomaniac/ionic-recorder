// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

/**
 * @name TrackPage
 * @description
 */
@Component({
    templateUrl: 'build/pages/track/track.html'
})
export class TrackPage {

    /**
     * TrackPage constructor
     */
    constructor() {
        console.log('constructor():TrackPage');
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }
}

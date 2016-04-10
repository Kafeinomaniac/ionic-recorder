// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';



/**
 * @name ProgressSlider
 * @description
 * A progress bar that can be clicked to change the progress location,
 * such as the one used in the youtube or other video or audio players
 * to control and visualize media playback.
 */
@Component({
    selector: 'progress-slider',
    templateUrl: 'build/components/progress-slider/progress-slider.html',
    directives: [IONIC_DIRECTIVES]
})
export class ProgressSlider implements OnChanges {
    @Input() private title: string;

    constructor() {

    }


    /**
     * Handle changes
     */
    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
    }
}
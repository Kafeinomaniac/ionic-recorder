// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, ElementRef, Renderer, OnChanges, SimpleChange} from 'angular2/core';
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
    @Input() private position: number = 0.4;

    constructor(private element: ElementRef) {

    }

    ngOnInit() {
        /*
        console.log('width is: ' + this.element.nativeElement.style.width);
        console.dir(this.element.nativeElement);
        console.dir(this.element.nativeElement.style);
        console.dir(getComputedStyle(this.element.nativeElement));
        console.log(getComputedStyle(this.element.nativeElement).getPropertyValue('width'));
        // this.trackWidth = getComputedStyle(this.element.nativeElement).getPropertyValue('width');
        */
    }
    
    positionPercent() {
        return (100.0 * this.position).toString() + '%';
    }

    remainingPercent() {
        return (100.0 - 100.0 * this.position).toString() + '%';
    }

    onHandleClick() {
        alert('onHandleClick');
        console.log('onHandleClick');
    }

    /**
     * Handle changes
     */
    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
    }
}
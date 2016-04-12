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
    templateUrl: 'build/components/progress-slider/progress-slider.html'
    // ,directives: [IONIC_DIRECTIVES]
})
export class ProgressSlider implements OnChanges {
    @Input() private position: number = 0.4;

    private trackClientXRange: { start: number, end: number };

    private mouseUpListener: Function;
    private mouseMoveListener: Function;

    constructor(private element: ElementRef, private renderer: Renderer) {
        console.log('constructor():ProgressSlider');
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

    getTrackClientXRange(): { start: number, end: number } {
        let width: number = parseFloat(getComputedStyle(
            this.element.nativeElement, null)
            .getPropertyValue('width').replace('px', '')),
            offsetLeft: number = this.element.nativeElement.offsetLeft,
            paddingLeft: number = parseFloat(getComputedStyle(
                this.element.nativeElement.firstChild, null)
                .getPropertyValue('padding-left').replace('px', ''));
        return {
            start: offsetLeft + paddingLeft,
            end: offsetLeft + width - paddingLeft
        }
    }

    jumpToPosition(clientX: number, range: { start: number, end: number }) {
        // the next if-statement fixes a quirk observed in desktop Chrome
        // where the ondrag event always ends up with a clientX value of 0
        // as its last emitted value, even when that's clearly not the last
        // location of dragging
        if (clientX === 0) {
            return;
        }

        let rangeX: number = range.end - range.start,
            clickRelativeX: number = clientX - range.start;

        if (clickRelativeX < 0) {
            clickRelativeX = 0;
        }

        if (clickRelativeX > rangeX) {
            clickRelativeX = rangeX;
        }

        this.position = clickRelativeX / rangeX;
    }

    onSliderMouseDown(event: MouseEvent) {
        console.log('onSliderMouseDown ' + this.element.nativeElement);
        this.trackClientXRange = this.getTrackClientXRange();
        this.jumpToPosition(event.clientX, this.trackClientXRange);

        this.mouseUpListener =
            this.renderer.listenGlobal('body', 'mouseup',
                (event: MouseEvent) => {
                    this.onMouseUp(event);
                });

        this.mouseMoveListener =
            this.renderer.listenGlobal('body', 'mousemove',
                (event: MouseEvent) => {
                    this.onMouseMove(event);
                });
    }

    onMouseUp(event: MouseEvent) {
        console.log('onMouseUp');
        // free up the listening to mouse up from <body> now that it happened
        // until the next time we click on the progress-bar
        this.mouseUpListener();
        this.mouseMoveListener();
    }

    onMouseMove(event: MouseEvent) {
        this.jumpToPosition(event.clientX, this.trackClientXRange);
    }

    onSliderTouchMove(event: TouchEvent) {
        // alert('on touch move  ' + event.touches[0].clientX);
        this.jumpToPosition(event.touches[0].clientX, this.trackClientXRange);
    }

    onSliderTouchStart(event: TouchEvent) {
        this.trackClientXRange = this.getTrackClientXRange();
    }

    onSliderTouchEnd(event: TouchEvent) {
        
    }

    /**
     * Handle changes
     */
    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
    }
}
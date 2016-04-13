// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, Output, ElementRef, Renderer, EventEmitter}
from 'angular2/core';


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
})
export class ProgressSlider {
    @Input() private position: number = 0;
    @Output() private positionChange: EventEmitter<any> = new EventEmitter();
    @Output() private positionSeek: EventEmitter<any> = new EventEmitter();

    private trackWidthRange: { start: number, end: number };
    private mouseUpListener: Function;
    private mouseMoveListener: Function;
    private exitBodyListener: Function;
    private enterBodyListener: Function;

    constructor(private element: ElementRef, private renderer: Renderer) {
        console.log('constructor():ProgressSlider');
    }

    positionPercent() {
        return (100.0 * this.position).toString() + '%';
    }

    remainingPercent() {
        return (100.0 - 100.0 * this.position).toString() + '%';
    }

    getTrackWidthRange(): { start: number, end: number } {
        let width: number = parseFloat(getComputedStyle(
            this.element.nativeElement.firstChild, null)
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
        this.positionChange.emit(this.position);
    }

    onSliderMouseDown(event: MouseEvent) {
        console.log('onSliderMouseDown ' + this.element.nativeElement);
        
        this.trackWidthRange = this.getTrackWidthRange();
        
        this.jumpToPosition(event.clientX, this.trackWidthRange);

        this.mouseUpListener =
            this.renderer.listenGlobal('document', 'mouseup',
                (event: MouseEvent) => {
                    this.onMouseUp(event);
                });
        this.mouseMoveListener =
            this.renderer.listenGlobal('document', 'mousemove',
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
        this.positionSeek.emit(this.position);
    }

    onMouseMove(event: MouseEvent) {
        this.jumpToPosition(event.clientX, this.trackWidthRange);
    }

    onSliderTouchMove(event: TouchEvent) {
        this.jumpToPosition(event.touches[0].clientX, this.trackWidthRange);
    }

    onSliderTouchStart(event: TouchEvent) {
        this.trackWidthRange = this.getTrackWidthRange();
    }

    onSliderTouchEnd() {
        this.positionSeek.emit(this.position);
    }
}
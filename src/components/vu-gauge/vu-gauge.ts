// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    OnChanges,
    SimpleChange,
    /* tslint:enable */
    Component,
    Input
} from '@angular/core';

/**
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where 'value' is in the interval ['min', 'max'].
 * @class VuGauge
 */
@Component({
    selector: 'vu-gauge',
    templateUrl: 'vu-gauge.html'
})
export class VuGauge implements OnChanges {
    @Input() public height: string;
    @Input() public nbars: number;
    @Input() public value: number;
    @Input() public max: number;
    public ledWidth: string;
    public leds: { x: string, fill: string, strokeWidth: string }[];

    private hStep: number;
    private valueStep: number;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor()');
        this.leds = [];

        if (parseInt(this.height, 10)) {
            throw Error('<vu-gauge>must have a height attribute');
        }
    }

    /**
     * Computes an LED fill color string.
     * @param {number} ledIndex - index of LED whose color we're computing
     * @param {string} lightness - percentage (eg. '15%') of lightness to use
     */
    private fillColor(ledIndex: number, lightness: string): string {
        return ['hsl(', 120 - ledIndex * this.hStep, ',100%,', lightness, ')']
            .join('');
    }

    /**
     * Sets up UI on init once elements have been rendered.
     */
    public ngOnInit(): void {
        // percentWidth is the width, in percent of the total width
        // of each bar. Since we're drawing a bar every other bar,
        // if we're drawing 'this.nbars' bars, pretend we're drawing
        // 2 * this.nbars. We want the bars to be drawn starting at
        // position 0 and ending at position (totalWidth - xStep).
        // 'xStep' is the step by which we walk along the x-axis to
        // draw.
        const percentWidth: number = 100 / (2 * this.nbars - 1),
              xStep: number = 2 * percentWidth;
        this.ledWidth = percentWidth + '%';
        this.hStep = 120 / (this.nbars - 1);
        for (let i: number = 0; i < this.nbars; i++) {
            this.leds.push({
                x: (i * xStep) + '%',
                fill: this.fillColor(i, '15%'),
                strokeWidth: '0'
            });
        }
        // NOTE: we expect that the maximum value ever encountered
        // is 1.  This is why 1 is in the numerator here.
        this.valueStep = 1 / (this.nbars - 1);
    }

    /**
     * Updates the UI when value changes.
     * @param {[propertyName: string]: SimpleChange} changeRecord - the
     * change record denoting what's changed.
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (this.leds.length > 0) {
            let fill: string,
                i: number;
            for (i = 0; i < this.nbars; i++) {
                if (this.valueStep * i < this.value) {
                    fill = this.fillColor(i, '50%');
                }
                else {
                    fill = this.fillColor(i, '15%');
                }
                this.leds[i].fill = fill;
                this.leds[i].strokeWidth = '0';
            }
            if (this.max > 0) {
                // show max-since-reset by drawing a white border rect
                i = Math.floor(this.max / this.valueStep);
                this.leds[i].strokeWidth = '1';
            }
        }
    }
}

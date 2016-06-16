// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

/**
 * @name VuGauge
 * @description
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where 'value' is in the interval ['min', 'max'].
 */
@Component({
    selector: 'vu-gauge',
    templateUrl: 'build/components/vu-gauge/vu-gauge.html'
})
export class VuGauge implements OnChanges {
    @Input() private height: string;
    @Input() private nbars: number;
    @Input() private value: number;
    @Input() private max: number;
    private maxIndex: number;
    private ledWidth: string;
    private leds: { x: string, fill: string, strokeWidth: string }[];
    private hStep: number;
    private valueStep: number;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():VuGauge ' + this.max);
        this.leds = [];
        this.maxIndex = 0;
        // some error checking
        if (parseInt(this.height, 10)) {
            throw Error('<vu-gauge> must have a height attribute');
        }
    }

    /**
     * Helper function computes an LED fill color string
     * @param {number} index of LED whose color we're computing
     * @param {string} percentage (eg. '15%') of lightness to use
     */
    private fillColor(ledIndex: number, lightness: string): string {
        return ['hsl(', 120.0 - ledIndex * this.hStep,
            ',100%,', lightness, ')'].join('');
    }

    /**
     * Sets up UI on init once elements have been rendered
     * @returns {void}
     */
    public ngOnInit(): void {
        // percentWidth is the width, in percent of the total width
        // of each bar. Since we're drawing a bar every other bar,
        // if we're drawing 'this.nbars' bars, pretend we're drawing
        // 2 * this.nbars. We want the bars to be drawn starting at
        // position 0 and ending at position (totalWidth - xStep).
        // 'xStep' is the step by which we walk along the x-axis to
        // draw.
        let percentWidth: number = 100.0 / (2 * this.nbars - 1),
            xStep: number = 2.0 * percentWidth, i: number;
        this.ledWidth = percentWidth + '%';
        this.hStep = 120.0 / (this.nbars - 1.0);
        for (i = 0; i < this.nbars; i++) {
            this.leds.push({
                x: (i * xStep) + '%',
                fill: this.fillColor(i, '15%'),
                strokeWidth: '0'
            });
        }
        // NOTE: change what the numerator is to make sure
        // it's a number that is never exceeded. The numerator
        // here is the maximum volume we'll ever encounter. If
        // we encounter a higher volume than the numerator here,
        // an error will occur.
        this.valueStep = 2.0 / (this.nbars - 1);
    }

    /**
     * Updates the UI when value changes
     * @returns {void}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        // if (changeRecord['max']) {
        //     console.log(changeRecord['value'].currentValue + ' / ' +
        //         changeRecord['max'].currentValue);
        // }
        // else {
        //     console.log(changeRecord['value'].currentValue);
        // }
        if (this.leds.length > 0) {
            let fill: string, i: number;
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
            if (this.value) {
                i = Math.floor(this.max / this.valueStep);
                this.leds[i].strokeWidth = '1';
            }
        }
    }
}

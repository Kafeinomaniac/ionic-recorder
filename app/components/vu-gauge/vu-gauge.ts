import {Component, Input, ChangeDetectorRef, OnChanges} from 'angular2/core';


/**
 * @name VuGauge
 * @description
 * An LED lights display that light up to monitor a changing signal in
 * real-time.  This display is a width:100% horizontal rectangle
 * willed with small vertical rectangles that are the LEDs.  Thes LEDs
 * show up either dark state or lit up, depending on the input value.
 */
@Component({
    // using OnPush strategy to keep a big chunk of the
    // change-detection tree disabled most of the time, since this
    // component depends only on its input properties and they are all
    // immutable - this component can change if and only if any of its
    // input properties change.  TODO: do we need this next line?
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'vu-gauge',
    template: ['<svg fill="rgba(0,0,0,0)" width="100%"',
        '     [attr.height]="height">',
        '           <rect width="100%" [attr.height]="height" />',
        '           <rect *ngFor="#led of ledRects"',
        '                 [attr.width]="ledWidth"',
        '                 [attr.height]="height"',
        '                 [attr.x]="led.x"',
        '                 [attr.stroke-width]="led.strokeWidth"',
        '                 stroke="rgb(255, 255, 255)"',
        '                 [attr.fill]="led.fill" />',
        '      </svg>'].join('')
})
export class VuGauge {
    // TODO: height, nbars, min are all to be set only once - remove
    // data binding on them
    @Input() private height: string;
    @Input() private nbars: number;
    @Input() private min: number;
    @Input() private max: number;
    @Input() private value: number;
    @Input() private rate: number;
    private ledWidth: string;
    private ledRects: Array<{ x: string, fill: string, strokeWidth: string }>;
    private hStep: number;
    private valueStep: number;
    private maxValue: number;
    private maxValueIndex: number;
    private refreshTimeoutMsec: number;
    private totalTime: number;
    private startTime: number;

    constructor(private ref: ChangeDetectorRef) {
        console.log('constructor():VuGauge');
        this.ledRects = [];
        this.maxValue = 0;
        this.maxValueIndex = 0;
    }

    resetInterval() {
        this.totalTime = 0;
        this.startTime = new Date().getTime();
        let repeat: Function = () => {
            this.totalTime += this.refreshTimeoutMsec;
            let deltaTime: number = new Date().getTime() - this.startTime;
            this.ref.markForCheck();
            setTimeout(repeat, this.refreshTimeoutMsec - deltaTime);
        }
        setTimeout(repeat, this.refreshTimeoutMsec);
    }

    ngOnInit() {
        let percentWidth: number = 100.0 / (2 * this.nbars - 1);
        this.ledWidth = percentWidth + '%';
        let xStep: number = 2.0 * percentWidth;
        this.hStep = 120.0 / (this.nbars - 1.0);
        for (let i: number = 0; i < this.nbars; i++) {
            this.ledRects.push({
                x: (i * xStep) + '%',
                fill: ['hsl(', 120.0 - i * this.hStep,
                    ', 100%, 15%)'].join(''),
                strokeWidth: "0"
            });
        }
        this.valueStep = (1.0 * (this.max - this.min)) / (this.nbars - 1.0);
        this.refreshTimeoutMsec = 1000.0 / this.rate;
        this.resetInterval();
    }

    ngOnChanges(changeRecord) {
        for (var change in changeRecord) {
            if (change === 'value' && this.ledRects.length > 0) {
                for (let i: number = 0; i < this.nbars; i++) {
                    let fill: string;
                    let strokeWidth: string;

                    if (this.min + this.valueStep * i < this.value) {
                        fill = ['hsl(', 120.0 - i * this.hStep,
                            ', 100%, 50%)'].join('');
                    }
                    else {
                        fill = ['hsl(', 120.0 - i * this.hStep,
                            ', 100%, 15%)'].join('');
                    }
                    this.ledRects[i].fill = fill;
                    this.ledRects[i].strokeWidth = "0";
                }
                if (this.value >= this.maxValue) {
                    this.maxValue = this.value;
                    this.maxValueIndex = Math.floor(
                        (this.value - this.min) / this.valueStep);
                }
                this.ledRects[this.maxValueIndex].strokeWidth = "1";
            }
        }
    }
}

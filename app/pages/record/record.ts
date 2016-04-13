// Copyright (c) 2016 Tracktunes Inc

import {Page, Platform} from 'ionic-angular';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {AppState} from '../../providers/app-state/app-state';
import {WebAudio} from '../../providers/web-audio/web-audio';
import {LocalDB} from '../../providers/local-db/local-db';
import {num2str, msec2time} from '../../providers/utils/utils';
import {MasterClock} from '../../providers/master-clock/master-clock';
import {ProgressSlider}
from '../../components/progress-slider/progress-slider';


const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';
const RECORD_PAGE_CLOCK_FUNCTION = 'record-page-clock-function';
const MAX_GAIN_FACTOR: number = 2.0;


@Page({
    templateUrl: 'build/pages/record/record.html',
    directives: [VuGauge, ProgressSlider]
})
export class RecordPage {
    private currentVolume: number = 0;
    private maxVolume: number = 0;
    private peaksAtMax: number = 0;
    private peakMeasurements: number = 0;
    private sliderValue: number = 100;
    private recordingTime: string = msec2time(0);
    private recordButtonIcon: string = START_RESUME_ICON;
    private decibels: string = '0.00 dB';
    private monitorSwitchState: boolean = true;

    // time related
    private recordStartTime: number = 0;
    private lastPauseTime: number = 0;
    private totalPauseTime: number = 0;
    private recordingDuration: number = 0;

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;
    private webAudio: WebAudio = WebAudio.Instance;
    private masterClock: MasterClock = MasterClock.Instance;

    private gainFactor: number = 0.33;

    /**
     * @constructor
     * @param {Platform} platform
     */
    constructor(private platform: Platform) {
        console.log('constructor():RecordPage');
        // function that gets called with a newly created blob when
        // we hit the stop button - saves blob to local db
        this.webAudio.onStopRecord = (blob: Blob) => {
            let now: Date = new Date(),
                itemCount: number = 0,
                month: number = now.getMonth() + 1,
                name: string =
                    now.getFullYear() + '-' +
                    month + '-' +
                    now.getDate() + ' -- ' +
                    now.toLocaleTimeString();
            console.dir(blob);

            this.appState.getProperty('unfiledFolderKey').subscribe(
                (unfiledFolderKey: number) => {
                    console.log('this.recordingDuration: '
                        + this.recordingDuration +
                        ' vs now: ' + (Date.now() - this.recordStartTime -
                            this.totalPauseTime));

                    this.localDB.createDataNode(
                        name,
                        unfiledFolderKey,
                        { blob: blob, duration: this.recordingDuration }
                    ).subscribe(
                        () => { },
                        (error: any) => {
                            alert('create data node error: ' + error);
                        }
                        ); // localDB.createDataNode().subscribe(
                },
                (getError: any) => {
                    console.error('getProperty error: ' + getError);
                }
            ); // getProperty('unfiledFolderKey').subscribe(
        }; // webAudio.onStop = (blob: Blob) => { ...
    }

    /**
     * Setup for real-time monitoring every time we're about  to enter the page
     * @returns {void}
     */
    onPageWillEnter() {
        console.log('on page will enter: record');

        // this.webAudio.waitForWebAudio().subscribe(() => {
        this.masterClock.addFunction(RECORD_PAGE_CLOCK_FUNCTION, () => {
            this.currentVolume = this.webAudio.getBufferMaxVolume();
            this.peakMeasurements += 1;
            if (this.currentVolume === this.maxVolume) {
                this.peaksAtMax += 1;
            }
            else if (this.currentVolume > this.maxVolume) {
                this.peaksAtMax = 1;
                this.maxVolume = this.currentVolume;
            }

            if (this.webAudio.isRecording()) {
                this.recordingDuration = Date.now() - this.recordStartTime -
                    this.totalPauseTime;
                this.recordingTime = msec2time(this.recordingDuration);
            }
        });
        // },
        //     (error: any) => {
        //         console.warn('ERROR: in web audio: ' + error);
        //     }
        // ); // waitForWebAudio().subscribe(
    }

    /**
     * Template monitor on/off toggle (click) callback.
     * @returns {void}
     */
    toggleMonitor() {
        if (this.monitorSwitchState) {
            this.monitorSwitchState = false;

            // remove old monitoring function
            this.masterClock.removeFunction(RECORD_PAGE_CLOCK_FUNCTION);

            this.masterClock.addFunction(RECORD_PAGE_CLOCK_FUNCTION, () => {
                this.currentVolume = 0;
                this.resetPeaksAtMax();
            });
            setTimeout(() => {
                // we need a little delay here to make sure things visually
                // reset before we remove this new resetting function
                this.masterClock.removeFunction(RECORD_PAGE_CLOCK_FUNCTION);
            }, 200);
        }
        else {
            this.monitorSwitchState = true;
            this.onPageWillEnter();
        }
    }

    /**
     * Cleanup operations just before leaving page for another
     * @returns {void}
     */
    onPageWillLeave() {
        this.masterClock.removeFunction(RECORD_PAGE_CLOCK_FUNCTION);
    }

    /**
     * Compute and return the % of peaks that hit max since start or last reset
     * @returns {string} a string representing the % of peaks that hit max
     */
    percentPeaksAtMax() {
        if (!this.peakMeasurements) {
            return '0.0';
        }
        return num2str(Math.floor(
            1000.0 * this.peaksAtMax / this.peakMeasurements) / 10.0, 1);
    }

    /**
     * Resets template indicator of max peaks to zero, restarts counting
     * @returns {void}
     */
    resetPeaksAtMax() {
        this.maxVolume = 0;
        this.peakMeasurements = 0;
        this.peaksAtMax = 0;
    }

    onPositionChange(newGainFactor: number) {
        this.gainFactor = newGainFactor;
        // convert from [0, 1] to [0, MAX_GAIN_FACTOR]
        let gainFactor: number = this.gainFactor * MAX_GAIN_FACTOR;

        if (gainFactor === 0) {
            this.decibels = 'Muted';
        }
        else {
            // convert to decibels
            this.decibels = num2str(10.0 * Math.log10(gainFactor), 2) + ' dB';
        }

        this.webAudio.setGainFactor(gainFactor);
    }

    /**
     * Start/pause recording - template button click callback
     * @returns {void}
     */
    onClickStartPauseButton() {
        this.currentVolume += Math.abs(Math.random() * 10);
        if (this.webAudio.isRecording()) {
            // we're recording (when clicked, to pause recording)
            this.webAudio.pauseRecording();
            this.lastPauseTime = Date.now();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            // we're not recording (when clicked, to start recording)
            if (this.webAudio.isInactive()) {
                // inactive, we're stopped, so start
                this.webAudio.startRecording();
                this.recordStartTime = Date.now();
                this.resetPeaksAtMax();
            }
            else {
                // it's active, we're just paused, so resume
                this.webAudio.resumeRecording();
                this.totalPauseTime += Date.now() - this.lastPauseTime;
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    /**
     * Determines whether to disable UI stop button
     * @returns {boolean} used by template to disable stop button in UI
     */
    stopButtonDisabled() {
        return this.webAudio.isInactive();
    }

    /**
     * Stop button - template button click callback
     * @returns {void}
     */
    onClickStopButton() {
        this.webAudio.stopRecording();
        this.totalPauseTime = 0;
        this.recordingTime = msec2time(0);
        this.recordButtonIcon = START_RESUME_ICON;
    }
}

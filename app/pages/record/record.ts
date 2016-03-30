// Copyright (c) 2016 Tracktunes Inc

import {Page, Platform, IonicApp} from 'ionic-angular';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {AppState} from '../../providers/app-state/app-state';
import {WebAudio} from '../../providers/web-audio/web-audio';
import {LocalDB, DB_NO_KEY} from '../../providers/local-db/local-db';
import {num2str, msec2time} from '../../providers/utils/utils';
import {NgZone} from 'angular2/core';
import {MasterClock} from '../../providers/master-clock/master-clock';


// the volume monitor frequency, in Hz
const MONITOR_FREQUENCY_HZ: number = 40;
const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';

// derived constants, please do not touch the constants below:
const MONITOR_TIMEOUT_MSEC: number = 1000.0 / MONITOR_FREQUENCY_HZ;
// max amount of time we expect the db to take to initialize
const OPEN_DB_MAX_TIMEOUT: number = 50;


@Page({
    templateUrl: 'build/pages/record/record.html',
    directives: [VuGauge]
})
export class RecordPage {
    private currentVolume: number;
    private maxVolume: number;
    private peaksAtMax: number;

    private sliderValue: number;
    private recordingTime: string;
    private recordButtonIcon: string;
    private gain: number;
    private decibels: string;

    // time related
    private monitorStartTime: number;
    private monitorTotalTime: number;
    private recordStartTime: number = 0;
    private lastPauseTime: number;
    private totalPauseTime: number;
    private recordingDuration: number;

    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;
    private webAudio: WebAudio = WebAudio.Instance;
    private masterClock: MasterClock = MasterClock.Instance;

    /**
     * @constructor
     * @param {Platform} platform
     * @param {WebAudio} webAudio
     * @param {IonicApp} app
     */
    constructor(private platform: Platform, private app: IonicApp,
        private ngZone: NgZone) {

        console.log('constructor():RecordPage');
        this.gain = 100;
        this.decibels = '0.00 dB';
        this.sliderValue = 100;
        this.maxVolume = 0;
        this.peaksAtMax = 1;
        this.recordingTime = msec2time(0);
        this.recordButtonIcon = START_RESUME_ICON;

        // function that gets called with a newly created blob when
        // we hit the stop button - saves blob to local db

        this.webAudio.onStop = (blob: Blob) => {
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
                    this.localDB.createDataNode(
                        name,
                        unfiledFolderKey,
                        blob
                    ).subscribe(
                        () => { },
                        (error: any) => {
                            alert('create data node error: ' + error);
                        }
                        );
                },
                (getError: any) => {
                    console.error('getProperty error: ' + getError);
                }
            ); // getProperty().subscribe(
        }; // webAudio.onStop = (blob: Blob) => { ...

        // start volume/time monitoring infinite loop
        // this.monitorVolumeAndTimeInfiniteLoop();
        this.totalPauseTime = this.lastPauseTime = 0;
        let bufferMax: number;
        this.masterClock.addFunction(() => {
            bufferMax = this.webAudio.getBufferMaxVolume();
            if (bufferMax === this.maxVolume) {
                this.peaksAtMax += 1;
            }
            else if (bufferMax > this.maxVolume) {
                this.peaksAtMax = 1;
                this.maxVolume = bufferMax;
            }
            this.currentVolume = bufferMax;

            if (this.webAudio.isRecording()) {
                this.recordingDuration = Date.now() - this.recordStartTime -
                    this.totalPauseTime;
                this.recordingTime = msec2time(this.recordingDuration);
            }
        });
    }

    monitorVolumeAndTimeInfiniteLoop() {
        // the following usage of NgZone improves on memory leak problems
        // https://angular.io/docs/js/latest/api/core/NgZone-class.html
        this.ngZone.runOutsideAngular(() => {
            this.totalPauseTime = this.monitorTotalTime = this.lastPauseTime = 0;
            this.monitorStartTime = Date.now();

            let timeNow: number,
                timeoutError: number,
                bufferMax: number,
                repeat: Function = () => {
                    this.monitorTotalTime += MONITOR_TIMEOUT_MSEC;

                    bufferMax = this.webAudio.getBufferMaxVolume();
                    if (bufferMax === this.maxVolume) {
                        this.peaksAtMax += 1;
                    }
                    else if (bufferMax > this.maxVolume) {
                        this.peaksAtMax = 1;
                        this.maxVolume = bufferMax;
                    }
                    this.ngZone.run(() => {
                        this.currentVolume = bufferMax;
                    });
                    timeNow = Date.now();
                    timeoutError = timeNow - this.monitorStartTime -
                        this.monitorTotalTime;

                    if (this.webAudio.isRecording()) {
                        this.recordingDuration = timeNow - this.recordStartTime -
                            this.totalPauseTime;
                        this.recordingTime = msec2time(this.recordingDuration);
                    }

                    setTimeout(repeat, MONITOR_TIMEOUT_MSEC - timeoutError);

                };
            setTimeout(repeat, MONITOR_TIMEOUT_MSEC);
        }); // this.ngZone.runOutsideAngular(() => {
    }

    onSliderDrag(event: Event) {
        // Fixes slider not dragging in Firefox, as described in wiki
        event.stopPropagation();
    }

    onSliderChange(event: Event) {
        this.gain = (<RangeInputEventTarget>event.target).value;
        let factor: number = this.gain / 100.0;
        if (factor === 0) {
            this.decibels = 'Muted';
        }
        else {
            // convert factor (a number in [0, 1]) to decibels
            this.decibels = num2str(10.0 * Math.log10(factor), 2) + ' dB';
        }
        this.webAudio.setGainFactor(factor);
    }

    onClickStartPauseButton() {
        this.currentVolume += Math.abs(Math.random() * 10);
        if (this.webAudio.isRecording()) {
            this.webAudio.pauseRecording();
            this.lastPauseTime = Date.now();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            if (this.webAudio.isInactive()) {
                this.webAudio.startRecording();
                this.recordingTime = msec2time(0);
                this.recordStartTime = Date.now();
            }
            else {
                this.webAudio.resumeRecording();
                this.totalPauseTime += Date.now() - this.lastPauseTime;
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    stopButtonDisabled() {
        return this.webAudio.isInactive();
    }

    onClickStopButton() {
        this.webAudio.stopRecording();
        this.totalPauseTime = 0;
        this.recordingTime = msec2time(0);
        this.recordButtonIcon = START_RESUME_ICON;
    }
}

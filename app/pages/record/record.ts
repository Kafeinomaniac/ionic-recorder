// Copyright (c) 2016 Tracktunes Inc

import {Page, Platform, IonicApp} from 'ionic-angular';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {AppState} from '../../providers/app-state/app-state';
import {WebAudio} from '../../providers/web-audio/web-audio';
import {LocalDB, DB_NO_KEY} from '../../providers/local-db/local-db';
import {num2str, msec2time} from '../../providers/utils/utils';
import {MasterClock} from '../../providers/master-clock/master-clock';


const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';
const RECORD_PAGE_CLOCK_FUNCTION = 'record-page-clock-function';


@Page({
    templateUrl: 'build/pages/record/record.html',
    directives: [VuGauge]
})
export class RecordPage {
    private currentVolume: number = 0;
    private maxVolume: number = 0;
    private peaksAtMax: number = 0;
    private peakMeasurements: number = 0;
    private sliderValue: number = 100;
    private recordingTime: string = msec2time(0);
    private recordButtonIcon: string = START_RESUME_ICON;
    private gain: number = 100;
    private decibels: string = '0.00 dB';

    // time related
    private recordStartTime: number = 0;
    private lastPauseTime: number = 0;
    private totalPauseTime: number = 0;
    private recordingDuration: number = 0;

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
    constructor(private platform: Platform) {
        console.log('constructor():RecordPage');

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
                        { blob: blob,
                          duration: this.recordingDuration }
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
    }

    onPageWillEnter() {
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
            }
        );
    }

    onPageWillLeave() {
        this.masterClock.removeFunction(RECORD_PAGE_CLOCK_FUNCTION);
    }

    percentPeaksAtMax() {
        return Math.floor(1000.0*this.peaksAtMax/this.peakMeasurements)/10.0;
    }

    onClickMaxPeaks() { 
        this.peakMeasurements = 0;
        this.peaksAtMax = 0;
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

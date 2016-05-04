// Copyright (c) 2016 Tracktunes Inc

import {Page} from 'ionic-angular';
import {VuGauge} from '../../components/vu-gauge/vu-gauge';
import {AppState, GainState} from '../../providers/app-state/app-state';
import {WebAudioRecorder} from '../../providers/web-audio/web-audio';
import {LocalDB} from '../../providers/local-db/local-db';
import {ProgressSlider}
from '../../components/progress-slider/progress-slider';


const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';


/**
 * @name RecordPage
 * @description
 * The page from which we record audio and monitor microphone sound volume.
 */
@Page({
    templateUrl: 'build/pages/record/record.html',
    directives: [VuGauge, ProgressSlider]
})
export class RecordPage {
    private localDB: LocalDB = LocalDB.Instance;
    private appState: AppState = AppState.Instance;
    private recorder: WebAudioRecorder = WebAudioRecorder.Instance;
    private sliderValue: number = 100;
    private recordButtonIcon: string = START_RESUME_ICON;
    // gain variables get initialized in constructor
    private percentGain: string;
    private maxGainFactor: number;
    private gainFactor: number;
    private decibels: string;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():RecordPage');
        // function that gets called with a newly created blob when
        // we hit the stop button - saves blob to local db
        this.recorder.onStopRecord = (blob: Blob) => {
            let now: Date = new Date(),
                name: string = now.getFullYear() + '-' +
                    (now.getMonth() + 1) + '-' +
                    now.getDate() + ' -- ' +
                    now.toLocaleTimeString();
            // this console.dir is here in order to monitor when Chrome is
            // finally going to report some info in the string representation
            // of Blob that it shows, which currently always says size == 0
            console.dir(blob);
            this.appState.getProperty('unfiledFolderKey').subscribe(
                (unfiledFolderKey: number) => {
                    this.localDB.createDataNode(name, unfiledFolderKey, blob)
                        .subscribe(() => { }, (error: any) => {
                            alert('create data node error: ' + error);
                        }); // localDB.createDataNode().subscribe(
                }); // getProperty('unfiledFolderKey').subscribe(
        }; // recorder.onStop = (blob: Blob) => { ...

        // initialize with "remembered" gain values
        this.appState.getProperty('gain').subscribe(
            (gain: GainState) => {
                this.maxGainFactor = gain.maxFactor;
                this.recorder.waitForAudio().subscribe(
                    () => {
                        this.onGainChange(gain.factor / gain.maxFactor);
                        // this.audioReady = true;
                    }
                ); // recorder.waitForAudio().subscribe(
            },
            (error: any) => {
                console.error('AppState:getProperty() error: ' + error);
            }
        ); // getProperty('gain').subscribe(
    }

    /**
     * Gets called with gain position (in [0, 1]) when we end sliding gain
     * slider around, at the end of a drag / slide action, with the finally
     * gain value released.
     * @returns {void}
     */
    onGainChangeEnd(position: number) {
        this.onGainChange(position);
        this.appState.updateProperty('gain', {
            factor: this.gainFactor,
            maxFactor: this.maxGainFactor
        }).subscribe(() => { }, (error: any) => {
            alert('AppState:updateProperty(): ' + error);
        }); // localDB.createDataNode().subscribe(
    }

    /**
     * Gets called with gain position (in [0, 1]) as we slide the gain
     * slider around, during a drag, during the slide.
     * @returns {void}
     */
    onGainChange(position: number) {
        // convert fro position in [0, 1] to [0, this.maxGainFactor]
        this.gainFactor = position * this.maxGainFactor;

        this.recorder.setGainFactor(this.gainFactor);

        if (position === 0) {
            this.decibels = 'Muted';
        }
        else {
            this.decibels =
                (10.0 * Math.log10(this.gainFactor)).toFixed(2) + ' dB';
        }
        this.percentGain = (this.gainFactor * 100.0).toFixed(1);
    }

    /**
     * Start/pause recording - template button click callback
     * @returns {void}
     */
    onClickStartPauseButton() {
        // this.currentVolume += Math.abs(Math.random() * 10);
        if (this.recorder.mediaRecorder.state === 'recording') {
            // we're recording (when clicked, so pause recording)
            this.recorder.pause();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            // we're not recording (when clicked, so start/resume recording)
            if (this.recorder.mediaRecorder.state === 'inactive') {
                // inactive, we're stopped (rather than paused) so start
                this.recorder.start();
            }
            else {
                // it's active, we're just paused, so resume
                this.recorder.resume();
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    /**
     * Stop button - template button click callback
     * @returns {void}
     */
    onClickStopButton() {
        this.recorder.stop();
        this.recordButtonIcon = START_RESUME_ICON;
    }
}

// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    Range
} from 'ionic-angular';

import {
    formatLocalTime
} from '../../services/utils/utils';

import {
    VuGauge
} from '../../directives/vu-gauge/vu-gauge';

// import {
//     ProgressSlider
// } from '../../directives/progress-slider/progress-slider';

import {
    IdbAppState,
    GainState
} from '../../providers/idb-app-state/idb-app-state';

import {
    WebAudioRecorderWav
} from '../../providers/web-audio/recorder-wav';

import {
    RecorderStatus
} from '../../providers/web-audio/recorder';

import {
    RecordingInfo
} from '../../providers/web-audio/common';

import {
    IdbAppFS,
    UNFILED_FOLDER_KEY
} from '../../providers/idb-app-fs/idb-app-fs';

const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';
const MAX_GAIN_SLIDER_VALUE: number = 1000;

/**
 * @name RecordPage
 * @description
 * The page from which we record audio and monitor microphone sound volume.
 */
@Component({
    templateUrl: 'build/pages/record-page/record-page.html',
    providers: [WebAudioRecorderWav],
    // directives: [VuGauge, ProgressSlider, Range]
    directives: [VuGauge, Range]
})
export class RecordPage {
    private idbAppState: IdbAppState;
    private idbAppFS: IdbAppFS;
    private webAudioRecorder: WebAudioRecorderWav;
    private recordButtonIcon: string = START_RESUME_ICON;
    // template members
    private percentGain: string;
    private maxGainFactor: number;
    private gainFactor: number;
    private decibels: string;

    private gainRangeSliderValue: number;
    private maxGainSliderValue: number;
    // private gainSliderLeftIcon: string;

    /**
     * @constructor
     */
    constructor(
        idbAppState: IdbAppState,
        idbAppFS: IdbAppFS,
        webAudioRecorder: WebAudioRecorderWav
    ) {
        console.log('constructor():RecordPage');

        this.idbAppState = idbAppState;
        this.idbAppFS = idbAppFS;
        this.webAudioRecorder = webAudioRecorder;

        this.maxGainSliderValue = MAX_GAIN_SLIDER_VALUE;

        // initialize with "remembered" gain values
        this.idbAppState.getProperty('gain').subscribe(
            (gain: GainState) => {
                this.gainFactor = gain.factor;
                this.maxGainFactor = gain.maxFactor;
                // this call, duplicated below, sets up the gain
                // slider to show what we're setting gain to once
                // the audio is ready.  before the audio is ready
                // we still want to show the previous gain value.
                // if we don't have this line below then it will
                // always show up as gain == 0.
                this.gainRangeSliderValue =
                    MAX_GAIN_SLIDER_VALUE * gain.factor / gain.maxFactor;
                this.onGainChangeEnd(this.gainRangeSliderValue);
            }
        );
    }

    /**
     * Returns whether this.ebAudioRecorder is fully initialized
     * @returns {boolean}
     */
    public recorderIsReady(): boolean {
        return this.webAudioRecorder &&
            this.webAudioRecorder.status === RecorderStatus.READY_STATE;
    }

    public onResetGain(): void {
        console.log('onResetGain()');

        // 0.5 if progress-slider is used instead of ion-range:
        // this.gainRangeSliderValue = 0.5;
        this.gainRangeSliderValue = 0.5 * MAX_GAIN_SLIDER_VALUE;

        this.onGainChangeEnd(this.gainRangeSliderValue);
    }

    // public onGainChange(position: number): void {
    //     this.gainFactor = position * this.maxGainFactor;
    public onGainChange(sliderValue: number): void {
        const position: number = sliderValue / MAX_GAIN_SLIDER_VALUE;
        this.gainFactor = position * this.maxGainFactor;

        this.webAudioRecorder.setGainFactor(this.gainFactor);

        if (position === 0) {
            this.decibels = 'Muted';
            // this.gainSliderLeftIcon = 'mic-off';
        }
        else {
            this.decibels =
                (10.0 * Math.log10(this.gainFactor)).toFixed(2) + ' dB';
            // this.gainSliderLeftIcon = 'mic';
        }
        this.percentGain = (this.gainFactor * 100.0).toFixed(0);
    }

    public onGainChangeEnd(position: number): void {
        console.log('onGainChangeEnd(' + position.toFixed(2) + '): ' +
            this.gainFactor + ', ' + this.maxGainFactor);
        this.onGainChange(position);
        this.idbAppState.updateProperty('gain', {
            factor: this.gainFactor,
            maxFactor: this.maxGainFactor
        }).subscribe(null, (error: any) => {
            const msg: string = 'AppState:updateProperty(): ' + error;
            alert(msg);
            throw Error(msg);
        });
    }

    /**
     * Start/pause recording - template button click callback
     * @returns {void}
     */
    public onClickStartPauseButton(): void {
        // this.currentVolume += Math.abs(Math.random() * 10);
        if (this.webAudioRecorder.isRecording) {
            // we're recording (when clicked, so pause recording)
            this.webAudioRecorder.pause();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            // we're not recording (when clicked, so start/resume recording)
            if (this.webAudioRecorder.isInactive) {
                // inactive, we're stopped (rather than paused) so start
                this.webAudioRecorder.start();
            }
            else {
                // it's active, we're just paused, so resume
                this.webAudioRecorder.resume();
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    /**
     * Stop button - template button click callback
     * @returns {void}
     */
    public onClickStopButton(): void {
        this.recordButtonIcon = START_RESUME_ICON;
        this.webAudioRecorder.stop().subscribe(
            (recordingInfo: RecordingInfo) => {
                const fileName: string =
                    formatLocalTime(recordingInfo.dateCreated);
                this.idbAppFS.createNode(
                    fileName,
                    UNFILED_FOLDER_KEY,
                    recordingInfo
                ).subscribe();
            });
    }

    public onRangeTouchEnd(): void {
        console.log('onRangeTouchEnd');
    }

    public ionViewDidEnter(): void {
        console.log('RecordPage:ionViewDidEnter()');
        this.webAudioRecorder.startMonitoring();
    }

    public ionViewDidLeave(): void {
        console.log('RecordPage:ionViewDidLeave()');
        this.webAudioRecorder.stopMonitoring();
    }
}

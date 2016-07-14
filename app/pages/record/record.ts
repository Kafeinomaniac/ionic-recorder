// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    Range
} from 'ionic-angular';

import {
    VuGauge
} from '../../components/vu-gauge/vu-gauge';

import {
    IdbAppState,
    GainState
} from '../../providers/idb-app-state/idb-app-state';

import {
    WebAudioRecorder,
    RecorderStatus,
    RecordingInfo
} from '../../providers/web-audio/web-audio-recorder';

import {
    IdbAppFS,
    UNFILED_FOLDER_KEY
} from '../../providers/idb-app-fs/idb-app-fs';

import {
    formatLocalTime
} from '../../services/utils/utils';

const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';

/**
 * @name RecordPage
 * @description
 * The page from which we record audio and monitor microphone sound volume.
 */
@Component({
    templateUrl: 'build/pages/record/record.html',
    providers: [WebAudioRecorder],
    directives: [VuGauge, Range]
})
export class RecordPage {
    private idbAppState: IdbAppState;
    private idbAppFS: IdbAppFS;
    private webAudioRecorder: WebAudioRecorder;
    private recordButtonIcon: string = START_RESUME_ICON;
    // template members
    private percentGain: string;
    private maxGainFactor: number;
    private gainFactor: number;
    private decibels: string;

    private gainRangeSliderValue: number;

    /**
     * @constructor
     */
    constructor(
        idbAppState: IdbAppState,
        idbAppFS: IdbAppFS,
        webAudioRecorder: WebAudioRecorder
    ) {
        console.log('constructor():RecordPage');

        this.idbAppState = idbAppState;
        this.idbAppFS = idbAppFS;
        this.webAudioRecorder = webAudioRecorder;

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
                this.gainRangeSliderValue = 100 * gain.factor / gain.maxFactor;
                this.onGainChange(this.gainRangeSliderValue);
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
        this.gainRangeSliderValue = 50;
        this.onGainChange(this.gainRangeSliderValue);
    }

    public onGainChange(value: number): void {
        // if (isNaN(this.gainRangeSliderValue)) {
        //     return;
        // }
        if (isNaN(value)) {
            return;
        }
        // const position: number = this.gainRangeSliderValue / 100;
        const position: number = value / 100;
        console.log('onGainChange: ' + position);

        // convert fro position in [0, 1] to [0, this.maxGainFactor]
        this.gainFactor = position * this.maxGainFactor;

        this.webAudioRecorder.setGainFactor(this.gainFactor);

        if (position === 0) {
            this.decibels = 'Muted';
        }
        else {
            this.decibels =
                (10.0 * Math.log10(this.gainFactor)).toFixed(2) + ' dB';
        }
        this.percentGain = (this.gainFactor * 100.0).toFixed(1);

        this.idbAppState.updateProperty('gain', {
            factor: this.gainFactor,
            maxFactor: this.maxGainFactor
        }).subscribe();
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
                let fileName: string = formatLocalTime(recordingInfo.startTime);
                delete recordingInfo['fileName'];
                this.idbAppFS.createNode(
                    fileName,
                    UNFILED_FOLDER_KEY,
                    recordingInfo
                ).subscribe();
            });
    }
}

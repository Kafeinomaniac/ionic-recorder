// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    VuGauge
} from '../../components/vu-gauge/vu-gauge';

import {
    AppState,
    GainState
} from '../../services/app-state/app-state';

import {
    WebAudioRecorder,
    RecorderStatus
} from '../../services/web-audio/web-audio-recorder';

import {
    IdbFS
} from '../../services/idb/idb-fs';

import {
    ProgressSlider
} from '../../components/progress-slider/progress-slider';

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
    directives: [VuGauge, ProgressSlider]
})
export class RecordPage {
    private idbFS: IdbFS;
    private appState: AppState;
    private webAudioRecorder: WebAudioRecorder;
    private recordButtonIcon: string = START_RESUME_ICON;
    private percentGain: string;
    private maxGainFactor: number;
    private gainFactor: number;
    private decibels: string;

    /**
     * @constructor
     */
    constructor(
        idbFS: IdbFS,
        appState: AppState,
        webAudioRecorder: WebAudioRecorder
    ) {
        console.log('constructor():RecordPage');

        this.idbFS = idbFS;
        this.appState = appState;
        this.webAudioRecorder = webAudioRecorder;

        // initialize with "remembered" gain values
        this.appState.getProperty('gain').subscribe(
            (gain: GainState) => {
                this.maxGainFactor = gain.maxFactor;
                // this call, duplicated below, sets up the gain
                // slider to show what we're setting gain to once
                // the audio is ready.  before the audio is ready
                // we still want to show the previous gain value.
                // if we don't have this line below then it will
                // always show up as gain == 0.
                this.onGainChange(gain.factor / gain.maxFactor);
            },
            (error: any) => {
                console.error('AppState:getProperty() error: ' + error);
            }
        ); // getProperty('gain').subscribe(
    }

    /**
     * Returns whether this.ebAudioRecorder is fully initialized
     * @returns {boolean}
     */
    public recorderIsReady(): boolean {
        return this.webAudioRecorder &&
            this.webAudioRecorder.status === RecorderStatus.READY_STATE;
    }

    /**
     * Gets called with gain position (in [0, 1]) when we end sliding gain
     * slider around, at the end of a drag / slide action, with the finally
     * gain value released.
     * @returns {void}
     */
    public onGainChangeEnd(position: number): void {
        this.onGainChange(position);
        this.appState.updateProperty('gain', {
            factor: this.gainFactor,
            maxFactor: this.maxGainFactor
        }).subscribe();
    }

    /**
     * Gets called with gain position (in [0, 1]) as we slide the gain
     * slider around, during a drag, during the slide.
     * @returns {void}
     */
    public onGainChange(position: number): void {
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
        this.webAudioRecorder.stop();
        this.recordButtonIcon = START_RESUME_ICON;
    }
}

// Copyright (c) 2017 Tracktunes Inc

import { Component, ViewChild } from '@angular/core';
import { Content, NavController } from 'ionic-angular';
import {
    AppStorage,
    GainState,
    RecordStatus,
    WavRecorder
} from '../../services';
import { TrackPage } from '../../pages';

const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';
const MAX_GAIN_SLIDER_VALUE: number = 1000;

/**
 * Page to record audio and monitor microphone sound volume.
 * @class RecordPage
 */
@Component({
    selector: 'record-page',
    templateUrl: 'record-page.html',
    providers: [WavRecorder]
})
export class RecordPage {
    @ViewChild(Content) public content: Content;
    private appStorage: AppStorage;
    // recordButtonIcon referenced by template
    public recordButtonIcon: string = START_RESUME_ICON;
    // template members
    public recorder: WavRecorder;
    public percentGain: string;
    public maxGainFactor: number;
    public gainFactor: number;
    public decibels: string;

    // gainRangeSliderValue referenced by template
    public gainRangeSliderValue: number;
    // maxGainSliderValue referenced by template
    public maxGainSliderValue: number;
    // private gainSliderLeftIcon: string;

    private navController: NavController;

    private lastRecordingPath: string;
    private lastRecordingDuration: string;

    /**
     * @constructor
     */
    constructor(
        navController: NavController,
        appStorage: AppStorage,
        recorder: WavRecorder
    ) {
        console.log('constructor()');
        this.navController = navController;
        this.appStorage = appStorage;
        this.recorder = recorder;
        this.maxGainSliderValue = MAX_GAIN_SLIDER_VALUE;
        this.lastRecordingPath = '';
        this.lastRecordingDuration = '';

        // initialize with "remembered" gain values
        this.appStorage.get('gain').then(
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

                recorder.waitForWAA().subscribe(
                    () => {
                        this.onGainChange(this.gainRangeSliderValue, false);
                        recorder.resetPeaks();
                    }
                );
            }
        );

        this.appStorage.get('lastRecordingPath').then(
            (path: string) => {
                this.lastRecordingPath = path;
                this.appStorage.get('lastRecordingDuration').then(
                    (duration: string) => {
                        this.lastRecordingDuration = duration;
                    }
                );
            }
        );
    }

    /**
     * Used in template
     * Returns whether this.recorder is fully initialized
     * @returns {boolean}
     */
    public recorderIsReady(): boolean {
        return this.recorder &&
            this.recorder.status === RecordStatus.READY_STATE;
    }

    /**
     *
     */
    public onResetGain(): void {
        console.log('onResetGain()');
        // 0.5 if progress-slider is used instead of ion-range:
        // this.gainRangeSliderValue = 0.5;
        this.gainRangeSliderValue = 0.5 * MAX_GAIN_SLIDER_VALUE;
        this.onGainChange(this.gainRangeSliderValue, true);
    }

    /**
     *
     */
    public onGainChange(
        sliderValue: number,
        updateStorage: boolean = true
    ): void {
        console.log('onGainChange()');

        // this.onGainChange(position);
        const position: number = sliderValue / MAX_GAIN_SLIDER_VALUE;

        console.log('onGainChange(' + position.toFixed(2) + '): ' +
                    this.gainFactor + ', ' + this.maxGainFactor);

        this.gainFactor = position * this.maxGainFactor;

        this.recorder.setGainFactor(this.gainFactor);

        if (position === 0) {
            this.decibels = 'Muted';
            // this.gainSliderLeftIcon = 'mic-off';
        }
        else {
            this.decibels =
                (10.0 * Math.log(this.gainFactor)).toFixed(2) + ' dB';
            // this.gainSliderLeftIcon = 'mic';
        }
        this.percentGain = (this.gainFactor * 100.0).toFixed(0);

        if (updateStorage) {
            this.appStorage.set('gain', {
                factor: this.gainFactor,
                maxFactor: this.maxGainFactor
            });
        }
    }

    /**
     * Start/pause recording - template button click callback
     */
    public onClickStartPauseButton(): void {
        console.log('onClickStartPauseButton()');

        // this.currentVolume += Math.abs(Math.random() * 10);
        if (this.recorder.isRecording) {
            // we're recording (when clicked, so pause recording)
            this.recorder.pause();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            // we're not recording (when clicked, so start/resume recording)
            if (this.recorder.isInactive) {
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
     */
    public onClickStopButton(): void {
        console.log('onClickStopButton()');
        this.recordButtonIcon = START_RESUME_ICON;
        this.recorder.stop().subscribe(
            null,
            (err: any) => {
                alert(err);
            }
        );
    }

    /**
     *
     */
    public onPlayLastRecording(): void {
        console.log('onPlayLastRecording()');
        this.navController.push(TrackPage, this.recorder.getFilePath());
    }

    /**
     *
     */
    public ionViewDidEnter(): void {
        console.log('ionViewDidEnter()');
        this.recorder.startMonitoring();
        // if we don't do this.content.resize() here then
        // the volume gauge does not show
        this.content.resize();
    }

    /**
     *
     */
    public ionViewDidLeave(): void {
        console.log('ionViewDidLeave()');
        this.recorder.stopMonitoring();
    }
}

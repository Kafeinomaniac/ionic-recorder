// Copyright (c) 2017 Tracktunes Inc

import { AppState, GainState } from '../../services/app-state/app-state';
import { Component, ViewChild } from '@angular/core';
import { Content, NavController } from 'ionic-angular';
import { RecordingInfo } from '../../services/web-audio/common';
import { RecordStatus } from '../../services/web-audio/record';
import { WebAudioRecordWav } from '../../services/web-audio/record-wav';
import { formatLocalTime, formatTime } from '../../models/utils/utils';
import { TrackPage } from '../track-page/track-page';

const START_RESUME_ICON: string = 'mic';
const PAUSE_ICON: string = 'pause';
const MAX_GAIN_SLIDER_VALUE: number = 1000;

/**
 * Page to record audio and monitor microphone sound volume.
 * @class RecordPage
 */
@Component({
    selector: 'record-page',
    providers: [WebAudioRecordWav],
    templateUrl: 'record-page.html'
})
export class RecordPage {
    @ViewChild(Content) public content: Content;
    private appState: AppState;
    // recordButtonIcon referenced by template
    public recordButtonIcon: string = START_RESUME_ICON;
    // template members
    public webAudioRecord: WebAudioRecordWav;
    public percentGain: string;
    public maxGainFactor: number;
    public gainFactor: number;
    public decibels: string;
    public recordingInfo: RecordingInfo;

    // gainRangeSliderValue referenced by template
    public gainRangeSliderValue: number;
    // maxGainSliderValue referenced by template
    public maxGainSliderValue: number;
    // private gainSliderLeftIcon: string;

    private navController: NavController;

    /**
     * @constructor
     */
    constructor(
        navController: NavController,
        appState: AppState,
        webAudioRecord: WebAudioRecordWav
    ) {
        console.log('constructor():RecordPage');
        this.navController = navController;
        this.appState = appState;
        this.webAudioRecord = webAudioRecord;
        this.recordingInfo = null;
        this.maxGainSliderValue = MAX_GAIN_SLIDER_VALUE;

        // initialize with "remembered" gain values
        this.appState.get('gain').then(
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

                webAudioRecord.waitForWAA().subscribe(
                    () => {
                        this.onGainChange(this.gainRangeSliderValue, false);
                        webAudioRecord.resetPeaks();
                    }
                );
            }
        );

        this.appState.get('lastRecordingInfo').then(
            (recordingInfo: RecordingInfo) => {
                console.log('RecordPage:lastRecordingInfo = ' + recordingInfo);
                if (recordingInfo) {
                    // we got a recordingInfo for last recording, but it is
                    // possible that we have deleted the recording, so make
                    // sure it is there *** TODO *** finish this ...
                }
            }
        );
    }

    /**
     * Used in template
     * Returns whether this.webAudioRecord is fully initialized
     * @returns {boolean}
     */
    public recorderIsReady(): boolean {
        return this.webAudioRecord &&
            this.webAudioRecord.status === RecordStatus.READY_STATE;
    }

    public onResetGain(): void {
        console.log('onResetGain()');

        // 0.5 if progress-slider is used instead of ion-range:
        // this.gainRangeSliderValue = 0.5;
        this.gainRangeSliderValue = 0.5 * MAX_GAIN_SLIDER_VALUE;

        this.onGainChange(this.gainRangeSliderValue);
    }

    public onGainChange(
        sliderValue: number,
        updateStorage: boolean = true
    ): void {
        // this.onGainChange(position);
        const position: number = sliderValue / MAX_GAIN_SLIDER_VALUE;

        console.log('onGainChange(' + position.toFixed(2) + '): ' +
                    this.gainFactor + ', ' + this.maxGainFactor);

        this.gainFactor = position * this.maxGainFactor;

        this.webAudioRecord.setGainFactor(this.gainFactor);

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
            this.appState.set('gain', {
                factor: this.gainFactor,
                maxFactor: this.maxGainFactor
            });
        }
    }

    /**
     * Start/pause recording - template button click callback
     */
    public onClickStartPauseButton(): void {
        // this.currentVolume += Math.abs(Math.random() * 10);
        if (this.webAudioRecord.isRecording) {
            // we're recording (when clicked, so pause recording)
            this.webAudioRecord.pause();
            this.recordButtonIcon = START_RESUME_ICON;
        }
        else {
            // we're not recording (when clicked, so start/resume recording)
            if (this.webAudioRecord.isInactive) {
                // inactive, we're stopped (rather than paused) so start
                this.webAudioRecord.start();
            }
            else {
                // it's active, we're just paused, so resume
                this.webAudioRecord.resume();
            }
            this.recordButtonIcon = PAUSE_ICON;
        }
    }

    /**
     * Stop button - template button click callback
     */
    public onClickStopButton(): void {
        this.recordButtonIcon = START_RESUME_ICON;

        this.webAudioRecord.stop().subscribe(
            (recordingInfo: RecordingInfo) => {
                // update other aspects of the track-page that are
                // useful to store in db
                recordingInfo.fileName =
                    formatLocalTime(recordingInfo.dateCreated);
                recordingInfo.duration = recordingInfo.nSamples /
                    recordingInfo.sampleRate;
                recordingInfo.displayDuration = formatTime(
                    recordingInfo.duration,
                    recordingInfo.duration
                );
                recordingInfo.displayDateCreated =
                    formatLocalTime(recordingInfo.dateCreated);
                recordingInfo.size = recordingInfo.nSamples * 2;
                recordingInfo.fileSize = recordingInfo.size + 44;
                recordingInfo.fileName = recordingInfo.displayDateCreated;
                // new recordings always go into '/Unfiled':
                recordingInfo.folderPath = '/Unfiiled';
                // next line is for HTML template refs
                this.recordingInfo = recordingInfo;
                // create a new filesystem file with recordingInfo as data
                // TODO: replace indexed-db code in this block
            },
            (err2: any) => {
                throw new Error(err2);
            }
        );
    }

    public onPlayLastRecording(): void {
        console.log('onPlayLastRecording()');
        this.navController.push(TrackPage, this.recordingInfo.dbKey);
    }

    public ionViewDidEnter(): void {
        console.log('RecordPage:ionViewDidEnter()');
        this.webAudioRecord.startMonitoring();
        // if we don't do this.content.resize() here then
        // the volume gauge does not show
        this.content.resize();
    }

    public ionViewDidLeave(): void {
        console.log('RecordPage:ionViewDidLeave()');
        this.webAudioRecord.stopMonitoring();
    }
}

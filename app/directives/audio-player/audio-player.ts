// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

import {
    WebAudioPlayerWav
} from '../../providers/web-audio/player-wav';

import {
    RecordingInfo
} from '../../providers/web-audio/common';

import {
    formatTime,
    objectInspector
} from '../../services/utils/utils';

const RANGE_MAX: number = 200;

/**
 * @name AudioPlayer
 * @description
 * An toolbar-like (row on the screen) audio player for controlling
 * blob playback.
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'build/directives/audio-player/audio-player.html',
    providers: [WebAudioPlayerWav]
})
export class AudioPlayer implements OnChanges {
    @Input() private recordingInfo: RecordingInfo;
    private player: WebAudioPlayerWav;
    private hidden: boolean;
    private time: number;
    private duration: number;
    private displayTime: string;
    private displayDuration: string;
    private rangeMax: number;
    private relativeTime: number;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayerWav) {
        console.log('constructor():AudioPlayer');
        this.player = player;
        // player starts at hidden state
        this.hidden = false;
        this.time = 0;
        this.relativeTime = 0;
        this.displayTime = formatTime(0, this.duration);
        this.rangeMax = RANGE_MAX;
    }

    /**
     * Show audio player
     * @returns {void}
     */
    public show(): void {
        this.hidden = false;
    }

    /**
     * Hide audio player
     * @returns {void}
     */
    public hide(): void {
        this.hidden = true;
    }

    public getTime(): string {
        const time: number = this.player.getTime();
        if (time !== this.time) {
            this.time = time;
            this.displayTime = formatTime(time, this.duration);
        }
        return this.displayTime;
    }

    public onRangePositionChange(position: number): void {
        if (position / RANGE_MAX === this.relativeTime) {
            // prevent calling player multiple times in
            // immediate succession if nothing's changed
            return;
        }
        this.relativeTime = position / RANGE_MAX;
        this.time = this.relativeTime * this.duration;
        this.displayTime = formatTime(this.time, this.duration);
        // console.log('onRangePositionChange(' +
        //     this.relativeTime.toFixed(2) + ')');
        this.player.timeSeek(this.time);
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     * @returns {void}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['recordingInfo']) {
            console.log('AudioPlayer:ngOnChanges(): [recordingInfo] = ' +
                objectInspector(this.recordingInfo));
            this.player.setRecordingInfo(this.recordingInfo);
            this.duration = this.recordingInfo.nSamples /
                this.recordingInfo.sampleRate;
            this.displayTime = formatTime(this.time, this.duration);
            this.displayDuration = formatTime(this.duration, this.duration);
        }
    }
}

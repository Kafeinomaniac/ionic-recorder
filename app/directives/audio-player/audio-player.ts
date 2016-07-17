// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

import {
    Range
} from 'ionic-angular';

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
    providers: [WebAudioPlayerWav],
    directives: [Range]
})
export class AudioPlayer implements OnChanges {
    @Input() private recordingInfo: RecordingInfo;
    private player: WebAudioPlayerWav;
    private hidden: boolean;
    private time: number;
    // private duration: number;
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
        this.displayTime = formatTime(0, this.player.getDuration());
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

    public getRangeValueFromTime(): number {
        return RANGE_MAX * this.player.time / this.player.duration;
    }

    public onRangeValueChange(position: number): void {
        if (position / RANGE_MAX === this.relativeTime) {
            // prevent calling player multiple times in
            // immediate succession if nothing's changed
            return;
        }
        this.relativeTime = position / RANGE_MAX;
        const duration: number = this.player.duration,
            seekTime: number = this.relativeTime * duration;
        console.log('::::: relativeTime ::::::: ' + this.relativeTime);
        console.log('::::: duration ::::::: ' + duration);
        console.log('::::: seekTime ::::::: ' + seekTime);
        this.displayTime = formatTime(seekTime, duration);
        this.player.timeSeek(seekTime);
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
            // this.duration = this.recordingInfo.nSamples /
            //     this.recordingInfo.sampleRate;
            const duration: number = this.player.getDuration();
            this.displayTime = formatTime(this.time, duration);
            this.displayDuration = formatTime(duration, duration);
        }
    }
}

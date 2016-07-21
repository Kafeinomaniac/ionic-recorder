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

// import {
//     Range
// } from 'ionic-angular';

import {
    ProgressSlider
} from '../progress-slider/progress-slider';

// const RANGE_MAX: number = 200;

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
    // directives: [Range]
    directives: [ProgressSlider]
})
export class AudioPlayer implements OnChanges {
    @Input() private recordingInfo: RecordingInfo;
    private player: WebAudioPlayerWav;
    private hidden: boolean;
    // private rangeMax: number;
    // private relativeTime: number;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayerWav) {
        console.log('constructor():AudioPlayer');
        this.player = player;
        // player starts at hidden state
        this.hidden = false;
        // this.relativeTime = 0;
        // this.rangeMax = RANGE_MAX;
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

    // public getRangeValueFromTime(): number {
    //     return RANGE_MAX * this.player.time / this.player.duration;
    // }

    // public onRangeValueChange(position: number): void {
    //     console.log('onRangeValueChange(): ' + position);
    //     if (position / RANGE_MAX === this.relativeTime) {
    //         // prevent calling player multiple times in
    //         // immediate succession if nothing's changed
    //         return;
    //     }
    //     this.relativeTime = position / RANGE_MAX;
    //     const seekTime: number = this.relativeTime * this.player.duration;
    //     this.player.timeSeek(seekTime);
    // }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     * @returns {void}
     */
    public ngOnChanges(
        changeRecord: { [propertyName: string]: SimpleChange }
    ): void {
        if (changeRecord['recordingInfo'] && this.recordingInfo) {
            console.log('AudioPlayer:ngOnChanges(): [recordingInfo]: ' +
                this.recordingInfo);
            this.player.setRecordingInfo(this.recordingInfo);
        }
    }

    public ionViewDidEnter(): void {
        console.log('RecordPage:ionViewDidEnter()');
        this.player.startMonitoring();
    }

    public ionViewDidLeave(): void {
        console.log('RecordPage:ionViewDidLeave()');
        this.player.stopMonitoring();
    }
}

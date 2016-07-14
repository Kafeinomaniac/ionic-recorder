// Copyright (c) 2016 Tracktunes Inc

import {
    Component,
    Input,
    OnChanges,
    SimpleChange
} from '@angular/core';

// import {
//     IONIC_DIRECTIVES
// } from 'ionic-angular';

import {
    WebAudioPlayer
} from '../../providers/web-audio/web-audio-player';

import {
    RecordingInfo
} from '../../providers/web-audio/web-audio-recorder';

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
    templateUrl: 'build/components/audio-player/audio-player.html',
    providers: [WebAudioPlayer] // ,
    // directives: [IONIC_DIRECTIVES]
})
export class AudioPlayer implements OnChanges {
    @Input() private recordingInfo: RecordingInfo;
    private player: WebAudioPlayer;
    private hidden: boolean;
    private time: number;
    private duration: number;
    private displayTime: string;
    private displayDuration: string;
    private rangeMax: number;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayer) {
        console.log('constructor():AudioPlayer');
        this.player = player;
        // player starts at hidden state
        this.hidden = false;
        this.time = 0;
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

    public onPositionChange(position: number): void {
        console.log('onPositionChange(' + position + ')');
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
            this.duration = this.recordingInfo.nSamples /
                this.recordingInfo.sampleRate;
            this.displayTime = formatTime(this.time, this.duration);
            this.displayDuration = formatTime(this.duration, this.duration);
        }
    }
}

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
    ProgressSlider
} from '../progress-slider/progress-slider';

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
    directives: [ProgressSlider]
})
export class AudioPlayer implements OnChanges {
    @Input() private recordingInfo: RecordingInfo;
    private player: WebAudioPlayerWav;
    private hidden: boolean;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayerWav) {
        console.log('constructor():AudioPlayer');
        this.player = player;
        this.hidden = false;
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

    public ngOnInit(): void {
        console.log('AudioPlayer:ngOnInit()');
        // TODO: this maintains monitoring throughout app, you
        // can do this better by stopping to monitor when going to
        // another page but then there will need to be communication
        // between the track page and this directive to tell the
        // directive to start/stop monitoring, perhaps we can do
        // this via show() and hide(). Ideally, we can start monitoring
        // upon player.relativeTimeSeek() and stop monitoring upon
        // player.pause() or player.stop() - but right now that does
        // not work due to race conditions (perhaps add a setTimeout()
        // to delay the stop monitoring command?)
        // this.player.startMonitoring();
    }

    public ngOnDestroy(): void {
        console.log('AudioPlayer:ngOnDestroy()');
        this.player.stopMonitoring();
    }
}

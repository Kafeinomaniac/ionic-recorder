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

/**
 * @name AudioPlayer
 * @description
 * An toolbar-like (row on the screen) audio player for controlling
 * blob playback.
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'audio-player.html'
})
export class AudioPlayer implements OnChanges {
    @Input() public recordingInfo: RecordingInfo;
    public player: WebAudioPlayerWav;

    /**
     * @constructor
     */
    constructor(player: WebAudioPlayerWav) {
        console.log('constructor():AudioPlayer');
        this.player = player;
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
        // directive to start/stop monitoring. We can start monitoring
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

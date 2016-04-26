// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {WebAudioPlayer} from '../../providers/web-audio/web-audio';
import {formatTime} from '../../providers/utils/format-time';
import {ProgressSlider} from '../progress-slider/progress-slider';


/**
 * @name AudioPlayer
 * @description
 * An LED lights display. LEDs are displayed either dark (off) or lit up
 * (on), depending on where 'value' is in the interval ['min', 'max'].
 */
@Component({
    selector: 'audio-player',
    templateUrl: 'build/components/audio-player/audio-player.html',
    directives: [IONIC_DIRECTIVES, ProgressSlider]
})
export class AudioPlayer implements OnChanges {
    @Input() private title: string;
    @Input() private blob: Blob;
    private player: WebAudioPlayer = WebAudioPlayer.Instance;
    private hidden: boolean = true;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():AudioPlayer');
    }

    /**
     * Show audio player
     * @returns {void}
     */
    show() {
        this.hidden = false;
    }

    /**
     * Hide audio player
     * @returns {void}
     */
    hide() {
        this.hidden = true;
    }

    /**
     * Handle changes (play new song) when a new song (url) is loaded
     * @returns {void}
     */
    ngOnChanges(changeRecord: { [propertyName: string]: SimpleChange }) {
        if (changeRecord['title']) {
            console.log('AudioPlayer:ngOnChanges(): title: ' + this.title);
            if (this.title !== undefined) {
                this.show();
            }
        }
        if (changeRecord['blob']) {
            console.log('AudioPlayer:ngOnChanges(): blob: ' + this.blob);
            if (this.blob !== undefined) {
                this.player.loadAndDecode(this.blob, true,
                    (duration: number) => { },
                    () => {
                        alert('FileReader error: could not load blob');
                    },
                    () => {
                        alert([
                            'Your browser had recorded the audio file you are ',
                            'playing and then it saved it to a local file on ',
                            'your device, but it now reports that it cannot ',
                            'play that audio file  We expect this problem to ',
                            'be fixed soon as more audio file formats get ',
                            'handled by modern browsers but we are looking for ',
                            'alternative playback solutions. In the meantime, ',
                            'you can share the fles you want to play to your ',
                            'device and play them with any music player on your ',
                            'device. But oops, sorry, we will implement sharing ',
                            'soon!'
                        ].join(''));
                    });
            }
        }
    }
}

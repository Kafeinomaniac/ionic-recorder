// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {WebAudioPlayer} from '../../providers/web-audio/web-audio';
import {formatTime} from '../../providers/utils/format-time';
import {ProgressSlider} from '../progress-slider/progress-slider';


const PLAY_ICON: string = 'play';
const PAUSE_ICON: string = 'pause';


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
    private webAudioPlayer: WebAudioPlayer = WebAudioPlayer.Instance;
    private hidden: boolean = true;
    // referred-to in the template
    private playPauseIcon: string = PLAY_ICON;
    private duration: number = 0;
    private displayDuration: string = formatTime(0, 0);
    private progress: number = 0;

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
     * UI callback: either play or pause audio on button click
     * (similar to record.ts pattern for the same button)
     * @returns {void}
     */
    onClickPlayPauseButton() {
        console.log('onClickPlayPauseButton()');
        if (this.webAudioPlayer.isPlaying) {
            this.webAudioPlayer.pause();
            this.playPauseIcon = PLAY_ICON;
        }
        else {
            this.hidden = false;
            this.webAudioPlayer.play();
            this.playPauseIcon = PAUSE_ICON;
        }
    }

    /**
     * Stops playback and hides audio player
     * @returns {void}
     */
    onClickCloseButton() {
        this.hide();
    }

    getTime(): string {
        let time: number = this.webAudioPlayer.getTime();
        if (time > this.duration) {
            this.webAudioPlayer.stop();
            this.playPauseIcon = PLAY_ICON;
            time = 0;
        }
        this.progress = time / this.duration;
        return formatTime(time, this.duration);
    }

    onSeek(progress: number) {
        this.webAudioPlayer.seek(progress * this.duration);
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
                this.webAudioPlayer.loadAndDecode(this.blob,
                    (duration: number) => {
                        this.duration = duration;
                        this.displayDuration = formatTime(duration, duration);
                        this.webAudioPlayer.stop();
                        this.onClickPlayPauseButton();
                    },
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

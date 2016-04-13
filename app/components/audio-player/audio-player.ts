// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {MasterClock} from '../../providers/master-clock/master-clock';
import {WebAudio} from '../../providers/web-audio/web-audio';
import {msec2time} from '../../providers/utils/utils';
import {ProgressSlider} from '../progress-slider/progress-slider';


const AUDIO_PLAYER_CLOCK_FUNCTION = 'audio-player-clock-function';


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
    private hidden: boolean = true;

    private duration: number;
    private startTime: number;
    private currentTime: number;
    private totalPauseTime: number;
    private fractionalTime: number = 0.8;
    private sampleRate: number;
    private playPauseButtonIcon: string = 'play';
    private audioElement: HTMLAudioElement;


    private webAudio: WebAudio = WebAudio.Instance;
    private masterClock: MasterClock = MasterClock.Instance;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():AudioPlayer');

        this.webAudio.onStartPlayback = () => {
            this.duration = this.webAudio.playbackAudioBuffer.duration *
                1000.0;
            this.sampleRate = this.webAudio.playbackAudioBuffer.sampleRate;
            this.masterClock.addFunction(AUDIO_PLAYER_CLOCK_FUNCTION, () => {
                this.currentTime = Date.now() - this.startTime -
                    this.totalPauseTime;
                this.fractionalTime = this.currentTime / this.duration;
            });
        };

        this.webAudio.onStopPlayback = () => {
            this.masterClock.removeFunction(AUDIO_PLAYER_CLOCK_FUNCTION);
            this.currentTime = this.duration;
            this.fractionalTime = 1.0;
            this.playPauseButtonIcon = 'play';
        }
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
     * Formats time, given as a number in miliseconds, to a string
     * @returns {string} the formatted time
     */
    formatTime(time: number) {
        if (time === undefined) {
            return '00:00';
        }
        return msec2time(time).replace('00:00:', '').replace('00:', '');
    }

    /**
     *
     * Start playing audio
     * @returns {void}
     */
    play() {
        console.log('AudioPlayer:play()');
        if (!this.blob) {
            alert('no blob!');
        }
        this.webAudio.startPlayback(this.blob);
        this.playPauseButtonIcon = 'pause';
    }

    /**
     * Pause playback
     * @returns {void}
     */
    pause() {
        this.webAudio.pausePlayback();
        this.masterClock.removeFunction(AUDIO_PLAYER_CLOCK_FUNCTION);
        this.playPauseButtonIcon = 'play';
    }

    /**
     * UI callback: either play or pause audio on button click
     * @returns {void}
     */
    onClickPlayPauseButton() {
        console.log('onClickPlayPauseButton()');

        if (this.playPauseButtonIcon === 'play') {
            this.play();
        }
        else {
            this.pause();
        }
    }

    /**
     * Stops playback and hides audio player
     * @returns {void}
     */
    onClickCloseButton() {
        // next line is the trick discussed here
        // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/ ...
        //     ... Using_HTML5_audio_and_video
        this.masterClock.removeFunction(AUDIO_PLAYER_CLOCK_FUNCTION);
        this.audioElement.src = '';
        this.hide();
    }

    onSeek(position: number) {
        console.log('on seek!!!!!!!!!!!!!!!!!!!! ' + position);
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
                this.play();
            }
        }
    }
}

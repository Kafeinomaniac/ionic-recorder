// Copyright (c) 2016 Tracktunes Inc

import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';
import {BrowserDomAdapter} from 'angular2/platform/browser';
import {IONIC_DIRECTIVES} from 'ionic-angular';
import {msec2time} from '../../providers/utils/utils';
import {MasterClock} from '../../providers/master-clock/master-clock';
import {ProgressSlider} from '../progress-slider/progress-slider';


const AUDIO_PLAYER_CLOCK_FUNCTION = 'audio-player-clock-function';
const EMPTY_WAV_URL = 'empty.wav';


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
    @Input() private url: string = EMPTY_WAV_URL;
    @Input() private duration: number;
    private time: number;
    private hidden: boolean = true;
    private playPauseButtonIcon: string = 'play';
    private audioElement: HTMLAudioElement;
    private masterClock: MasterClock = MasterClock.Instance;
    private progressMax: number = 0;
    private progressValue: number = 0;

    private DOM;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():AudioPlayer');
        // this.DOM = new BrowserDomAdapter();
        this.audioElement = document.createElement('audio');
        // this.audioElement.autoplay = true;

        this.audioElement.preload = 'metadata';

        this.audioElement.addEventListener('canplay', () => {
            console.warn('oncanplay!');
        });
        this.audioElement.addEventListener('loadstart', () => {
           console.warn('loadstart!');
        });
        this.audioElement.addEventListener('error', (error: any) => {
           console.warn('audio error!');
           console.dir(error);
           console.warn('audio src: ' + this.audioElement.src);
        });
        this.audioElement.addEventListener('loadedmetadata', () => {
           console.warn('loadedmetadata! duration = ' + this.audioElement.duration);
        });

        this.audioElement.addEventListener('canplay', () => {
           this.onAudioCanPlay();
        });
        this.audioElement.addEventListener('ended', () => {
           this.onAudioEnded();
        });
}

    /**
     * Setup when component first loaded into DOM
     * @returns {void}
     */
    ngOnInit() {
        /*
        this.audioElement = this.DOM.query('#audio-player-audio-tag');
        console.log('ngOnInit() this.audioElement = ' + this.audioElement);
        // this.audioElement.autoplay = true;
        this.audioElement.addEventListener('canplay', () => {
           this.onAudioCanPlay();
        });
        this.audioElement.addEventListener('ended', () => {
           this.onAudioEnded();
        });
        */
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

    onAudioEnded() {
        console.warn('onAudioEnded~!');
        this.playPauseButtonIcon = 'play';
        this.masterClock.removeFunction(AUDIO_PLAYER_CLOCK_FUNCTION);
        this.time = this.audioElement.duration * 1000;
        this.duration = this.audioElement.duration * 1000;
        this.progressValue = this.duration;
        this.progressMax = this.duration;

        if (!isFinite(this.duration)) {
            alert('infinite duration detected!');
        }

        if (isNaN(this.duration)) {
            alert('NaN duration!');
        }
    }

    onAudioCanPlay() {
        console.warn('onCanPlay(' + this.url + ')');
        this.audioElement.play();
        console.log('audioElement.duration: ' + this.audioElement.duration);

        this.masterClock.addFunction(AUDIO_PLAYER_CLOCK_FUNCTION, () => {
            this.time = this.audioElement.currentTime * 1000.0;
            this.progressValue = this.time;
        });

        this.playPauseButtonIcon = 'pause';
    }

    /**
     *
     * Start playing audio
     * @returns {void}
     */
    play() {
        if (!this.audioElement) {
            alert('no audio element!');
        }
        this.audioElement.play();
        console.log('play() audioElement: ' + this.audioElement);
        console.dir(this.audioElement);

        this.masterClock.addFunction(AUDIO_PLAYER_CLOCK_FUNCTION, () => {
            this.time = this.audioElement.currentTime * 1000.0;
            this.progressValue = this.time;
        });

        this.playPauseButtonIcon = 'pause';
    }

    /**
     * Pause playback
     * @returns {void}
     */
    pause() {
        this.audioElement.pause();
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
        this.url = '';
        this.audioElement.src = '';
        this.hide();
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
        if (changeRecord['url']) {
            console.log('AudioPlayer:ngOnChanges(): url: ' + this.url);
            if (this.url !== undefined) {
                if (this.audioElement !== undefined) {
                    this.audioElement.src = this.url;
                    // this.audioElement.load();
                    this.audioElement.play();
                }
            }
            else {
                this.url = EMPTY_WAV_URL;
            }
        }
        if (changeRecord['duration']) {
            console.log('AudioPlayer:ngOnChanges(): duration: ' +
                this.duration);
            if (this.duration !== undefined) {
                this.progressMax = this.duration;
            }
            else {
                this.progressMax = 0;
            }
        }
    }
}

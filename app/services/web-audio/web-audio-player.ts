// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    AUDIO_CONTEXT
} from './web-audio-common';

import {
    formatTime
} from '../utils/time-utils';

///////////////////////////////////////////////////////////////////////////////
// PLAYER
///////////////////////////////////////////////////////////////////////////////

function setString(dataView: DataView, offset: number, str: string): void {
    'use strict';
    let len: number = str.length, i: number;
    for (i = 0; i < len; i++) {
        dataView.setUint8(offset + i, str.charCodeAt(i));
    }
}

export function uint16ArrayToBlobWAV(uint16Array: Uint16Array): Blob {
    'use strict';
    let arrayByteLength: number = uint16Array.byteLength,
        headerView: DataView = new DataView(new ArrayBuffer(44));
    setString(headerView, 0, 'RIFF');
    headerView.setUint32(4, 36 + arrayByteLength);
    setString(headerView, 8, 'WAVE');
    setString(headerView, 12, 'fmt ');
    headerView.setUint32(16, 16, true);
    headerView.setUint16(20, 1, true);
    headerView.setUint16(22, this.numChannels, true);
    headerView.setUint32(24, this.sampleRate, true);
    headerView.setUint32(28, this.sampleRate * 4, true);
    headerView.setUint16(32, this.numChannels * 2, true);
    headerView.setUint16(34, 16, true);
    setString(headerView, 36, 'data');
    headerView.setUint32(40, arrayByteLength, true);
    return new Blob([headerView, uint16Array], { type: 'audio/wav' });
}

/**
 * @name WebAudioPlayer
 * @description
 * Audio Player functions based on WebAudio. Originally based on
 * code by Ian McGregor: http://codepen.io/ianmcgregor/pen/EjdJZZ
 */
@Injectable()
export class WebAudioPlayer {
    private audioBuffer: AudioBuffer;
    private sourceNode: AudioBufferSourceNode;
    private startedAt: number;
    private pausedAt: number;
    public duration: number;
    public displayDuration: string;
    public isPlaying: boolean;
    private fileReader: FileReader;

    constructor() {
        console.log('constructor():WebAudioPlayer');
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.fileReader = new FileReader();
    }

    /**
     * Returns current playback time - position in song
     * @returns {number}
     */
    private getTime(): number {
        let res: number = 0;
        if (this.pausedAt) {
            res = this.pausedAt;
        }
        if (this.startedAt) {
            res = AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        if (res >= this.duration) {
            console.log('res: ' + res + ', dur: ' + this.duration);
            // res = this.duration;
            this.stop();
            res = 0;
        }
        return res;
    }

    /**
     * Returns a string representation of current time no longer than the
     * string representation of current duration.
     * @returns {string}
     */
    public getDisplayTime(): string {
        return formatTime(this.getTime(), this.duration);
    }

    /**
     * Returns a number in [0, 1] denoting relative location in song
     * @returns {number}
     */
    public getProgress(): number {
        // console.log(this.getTime() / this.duration);
        return this.getTime() / this.duration;
    }

    /**
     * Load a blob and decode data in it, optionally playing it.
     * @returns {void}
     */
    public loadAndDecode(
        blob: Blob,
        playOnLoad: boolean,
        loadErrorCB: () => void,
        decodeErrorCB: () => void
    ): void {
        this.fileReader.onerror = loadErrorCB;
        this.fileReader.onload = () => {
            console.log('fileReader.onload()');
            AUDIO_CONTEXT.decodeAudioData(
                this.fileReader.result,
                (audioBuffer: AudioBuffer) => {
                    this.audioBuffer = audioBuffer;
                    this.duration = audioBuffer.duration;
                    this.displayDuration = formatTime(
                        this.duration,
                        this.duration
                    );
                    console.log('loaded and duration is: ' + this.duration);
                    if (playOnLoad) {
                        this.stop();
                        this.play();
                    }
                },
                decodeErrorCB);
        };
        this.fileReader.readAsArrayBuffer(blob);
    }

    /**
     * Set this.isPlaying and force-fire angular2 change detection (a hack)
     * @returns {void}
     */
    private setPlaying(state: boolean): void {
        // TODO: the setTimeout() call below is a terrible hack to prevent
        // angular change detection exceptions
        setTimeout(() => { this.isPlaying = state; }, 1);
    }

    /**
     * Play
     * @returns {void}
     */
    public play(): void {
        let offset: number = this.pausedAt;
        this.sourceNode = AUDIO_CONTEXT.createBufferSource();
        this.sourceNode.connect(AUDIO_CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;
        // this.sourceNode.onended = () => {
        //     console.log('onended!');
        // }
        this.sourceNode.start(0, offset);
        this.startedAt = AUDIO_CONTEXT.currentTime - offset;
        this.pausedAt = 0;
        this.setPlaying(true);
    }

    /**
     * Pause
     * @returns {void}
     */
    public pause(): void {
        let elapsed: number = AUDIO_CONTEXT.currentTime - this.startedAt;
        this.stop();
        this.pausedAt = elapsed;
    }

    /**
     * Toggle state between play and pause
     * @returns {void}
     */
    public togglePlayPause(): void {
        // play if !isPlaying or (isPlaying && pausedAt)
        if (!this.isPlaying) {
            this.play();
        }
        else {
            this.pause();
            console.log('at: ' + this.pausedAt + ', p: ' + this.getProgress());
        }
    }

    /**
     * Stop playback
     * @returns {void}
     */
    public stop(): void {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop(0);
            this.sourceNode = null;
        }
        this.startedAt = 0;
        this.pausedAt = 0;
        this.setPlaying(false);
    }

    /**
     * Seek playback to a specific time, retaining playing state (or not)
     * @returns {void}
     */
    private timeSeek(time: number): void {
        let isPlaying: boolean = this.isPlaying;
        this.setPlaying(false);
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode.stop(0);
            this.sourceNode = null;
        }
        this.sourceNode = AUDIO_CONTEXT.createBufferSource();
        this.sourceNode.connect(AUDIO_CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;
        if (isPlaying) {
            this.sourceNode.start(0, time);
            this.startedAt = AUDIO_CONTEXT.currentTime - time;
            this.pausedAt = 0;
        }
        this.setPlaying(isPlaying);
    }

    /**
     * Seek playback to a relative position, retaining playing state (or not)
     * @returns {void}
     */
    public positionSeek(position: number): void {
        this.timeSeek(position * this.duration);
    }
}

// Copyright (c) 2016 Tracktunes Inc

import { Injectable } from '@angular/core';
import { formatTime } from '../utils/format-time';

const CONTEXT: AudioContext = new (AudioContext || webkitAudioContext)();

///////////////////////////////////////////////////////////////////////////////
// PLAYER
///////////////////////////////////////////////////////////////////////////////

/**
 * @name WebAudioPlayer
 * @description
 * Audio Player functions based on WebAudio. Originally based on
 * code by Ian McGregor: http://codepen.io/ianmcgregor/pen/EjdJZZ
 */
@Injectable()
export class WebAudioPlayer {
    private fileReader: FileReader = new FileReader();
    private audioBuffer: AudioBuffer;
    private sourceNode: AudioBufferSourceNode = null;
    private startedAt: number = 0;
    private pausedAt: number = 0;
    public duration: number;
    public displayDuration: string;
    public isPlaying: boolean = false;

    constructor() {
        console.log('constructor():WebAudioPlayer');
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
            res = CONTEXT.currentTime - this.startedAt;
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
            CONTEXT.decodeAudioData(
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
        // angular change detection exceptions - can we do this better?
        setTimeout(() => { this.isPlaying = state; }, 1);
    }

    /**
     * Play
     * @returns {void}
     */
    public play(): void {
        let offset: number = this.pausedAt;
        this.sourceNode = CONTEXT.createBufferSource();
        this.sourceNode.connect(CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;
        // this.sourceNode.onended = () => {
        //     console.log('onended!');
        // }
        this.sourceNode.start(0, offset);
        this.startedAt = CONTEXT.currentTime - offset;
        this.pausedAt = 0;
        this.setPlaying(true);
    }

    /**
     * Pause
     * @returns {void}
     */
    public pause(): void {
        let elapsed: number = CONTEXT.currentTime - this.startedAt;
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
        this.sourceNode = CONTEXT.createBufferSource();
        this.sourceNode.connect(CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;
        if (isPlaying) {
            this.sourceNode.start(0, time);
            this.startedAt = CONTEXT.currentTime - time;
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

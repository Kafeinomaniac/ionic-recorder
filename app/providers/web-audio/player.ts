// Copyright (c) 2016 Tracktunes Inc

// single blob playback blass - i.e. this class is not dealing
// with audio stored as multi-blob, it only knows a single blob.
// so duration for this class is the duration of the blob's audio.
// db-free and file-free code - blob input is loaded from db
// outside of (before) this class

import {
    Injectable
} from '@angular/core';

import {
    AUDIO_CONTEXT
} from './common';

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
    protected pausedAt: number;
    public isPlaying: boolean;

    constructor() {
        console.log('constructor():WebAudioPlayer');

        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
    }

    /**
     * Returns current playback time - position in song
     * @returns {number}
     */
    public getTime(): number {
        let res: number = 0;
        if (this.pausedAt) {
            res = this.pausedAt;
        }
        else if (this.startedAt) {
            // not paused, and we have started, so playing now
            res = AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        if (res >= this.audioBuffer.duration) {
            // console.log('res: ' + res + ', dur: ' + this.duration);
            // res = this.duration;
            this.stop();
            res = 0;
        }
        if (res > this.audioBuffer.duration) {
            res = this.audioBuffer.duration;
        }
        return res;
    }

    /**
     * Set a new audio buffer.  We'd have to stop current playback first.
     * @returns {void}
     */
    public setAudioBuffer(audioBuffer: AudioBuffer): void {
        this.stop();
        this.audioBuffer = audioBuffer;
    }

    public getDuration(): number {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }

    /**
     * Set this.isPlaying and force-fire angular2 change detection (a hack)
     * @returns {void}
     */
    private setPlaying(state: boolean): void {
        // TODO: the setTimeout() call below is a terrible hack to prevent
        // angular change detection exceptions
        setTimeout(() => { this.isPlaying = state; }, 0);
    }

    /**
     * Play
     * @returns {void}
     */
    public play(
        when: number = 0,
        startAt?: number,
        onEnded?: () => void): void {
        this.sourceNode = AUDIO_CONTEXT.createBufferSource();
        this.sourceNode.connect(AUDIO_CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;

        if (onEnded) {
            onEnded();
        }

        let offset: number = startAt ? startAt : this.pausedAt;
        this.sourceNode.start(when, offset);
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
        if (!this.isPlaying) {
            this.play();
        }
        else {
            this.pause();
            console.log('paused at: ' + this.pausedAt);
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
    public timeSeek(time: number): void {
        this.stop();
        this.pausedAt = time;
        this.play();
    }
}

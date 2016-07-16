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

import {
    prependArray // ,
    // isUndefined
} from '../../services/utils/utils';

/**
 * @name WebAudioPlayer
 * @description
 * Audio Player functions based on WebAudio. Originally based on
 * code by Ian McGregor: http://codepen.io/ianmcgregor/pen/EjdJZZ
 */
@Injectable()
export class WebAudioPlayer {
    private audioBuffer: AudioBuffer;
    protected sourceNode: AudioBufferSourceNode;
    private scheduledSourceNodes: AudioBufferSourceNode[];
    protected startedAt: number;
    protected pausedAt: number;
    public isPlaying: boolean;

    constructor() {
        console.log('constructor():WebAudioPlayer');

        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];
    }

    /**
     * Returns current playback time - position in song
     * @returns {number}
     */
    public getTime(): number {
        let res: number;
        if (this.pausedAt) {
            res = this.pausedAt;
        }
        else if (this.startedAt) {
            // not paused, and we have started, so playing now
            res = AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        // if (res >= this.audioBuffer.duration) {
        //     // res = this.audioBuffer.duration;
        //     this.stop();
        //     res = 0;
        // }
        return res;
    }

    /**
     * Set a new audio buffer.  We'd have to stop current playback first.
     * @returns {void}
     */
    // public setAudioBuffer(audioBuffer: AudioBuffer): void {
    //     this.stop();
    //     this.audioBuffer = audioBuffer;
    // }

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

    private resetSourceNode(): void {
        if (this.sourceNode) {
            this.sourceNode.stop(0);
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }
    }

    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number,
        startTime: number = 0,
        onEnded?: () => void
    ): void {
        console.log('schedulePlay(AudioBuffer, ' + when + ', ' +
            startTime + ', onEnded())');
        let sourceNode: AudioBufferSourceNode =
            AUDIO_CONTEXT.createBufferSource();

        sourceNode.connect(AUDIO_CONTEXT.destination);
        sourceNode.buffer = audioBuffer;

        sourceNode.onended = () => {
            // const nextNode: AudioBufferSourceNode =
            //     this.scheduledSourceNodes.pop();
            // console.log('schedulePlay:sourceNode.onended() nextNode: ' +
            //     nextNode);

            // if (isUndefined(nextNode)) {
            //     this.resetSourceNode();
            // }
            // else {
            //     this.sourceNode = nextNode;
            // }

            if (onEnded) {
                onEnded();
            }
        };

        if (when === 0) {
            // start now
            const offset: number = startTime ? startTime : this.pausedAt;
            this.sourceNode = sourceNode;
            // this.startedAt = AUDIO_CONTEXT.currentTime - offset;
            // console.log('this.starteAt: ' + this.startedAt);
            console.log('====> this.starteAt 0: ' +
                (AUDIO_CONTEXT.currentTime - offset));
            sourceNode.start(0, offset);
            this.startedAt = AUDIO_CONTEXT.currentTime - offset;
            console.log('====> this.starteAt 1: ' + this.startedAt);
            this.pausedAt = 0;
            this.setPlaying(true);

        }
        else {
            // start later (when)
            // sourceNode.start(when, startTime);
            sourceNode.start(when, 0);
            // we save the scheduled source nodes in an array to avoid them 
            // being garbage collected while they wait to be played.
            // TODO: this array needs to be cleaned up when used - in onended?
            // this.scheduledSourceNodes.push(sourceNode);
            this.scheduledSourceNodes = prependArray(
                sourceNode,
                this.scheduledSourceNodes
            );
        }
    }

    /**
     * Play
     * @returns {void}
     */
    public play(
        startTime?: number,
        onEnded?: () => void
    ): void {
        this.sourceNode = AUDIO_CONTEXT.createBufferSource();
        this.sourceNode.connect(AUDIO_CONTEXT.destination);
        this.sourceNode.buffer = this.audioBuffer;

        const offset: number = startTime ? startTime : this.pausedAt;

        this.startedAt = AUDIO_CONTEXT.currentTime - offset;
        this.sourceNode.start(0, offset);
        // this.startedAt = AUDIO_CONTEXT.currentTime - offset;
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
        console.log('stop()');
        this.resetSourceNode();
        this.startedAt = 0;
        this.pausedAt = 0;
        this.setPlaying(false);
    }

}

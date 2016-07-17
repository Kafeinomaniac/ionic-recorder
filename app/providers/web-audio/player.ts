// Copyright (c) 2016 Tracktunes Inc

// Lowest-level audio-buffer Web Audio Api playback class.
// This class only deals with a single audio-buffer, it
// knows nothing about multi-buffer streams. These are 
// implemented in files with name player-X.ts, e.g.
// in player-wav.ts and are responsible for dealing
// with multiple-chunk files stored via indexedDB - these
// extension classes use this base class for single
// buffer operations.

import {
    Injectable
} from '@angular/core';

import {
    AUDIO_CONTEXT
} from './common';

import {
    prependArray,
    isUndefined
} from '../../services/utils/utils';

// sets the frame-rate at which we monitor time
// is updated when it changes on the screen.
const MONITOR_REFRESH_RATE_HZ: number = 24;

// MONITOR_REFRESH_INTERVAL is derived from MONITOR_REFRESH_RATE_HZ
const MONITOR_REFRESH_INTERVAL: number = 1000 / MONITOR_REFRESH_RATE_HZ;

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
    private intervalId: NodeJS.Timer;

    constructor() {
        console.log('constructor():WebAudioPlayer');

        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];
        this.intervalId = null;
    }

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     * @returns {void}
     */
    public startMonitoring(): void {
        this.intervalId = setInterval(
            // the monitoring actions are in the following function:
            () => {
                // // update currentTime property
                // this.currentTime = formatTime(
                //     this.nBuffersToSeconds(this.nRecordedProcessingBuffers));

                // // update currentVolume property
                // this.nPeakMeasurements += 1;
                // if (this.currentVolume > this.maxVolumeSinceReset) {
                //     // on new maximum, re-start counting peaks
                //     this.resetPeaks();
                //     this.maxVolumeSinceReset = this.currentVolume;
                // }
                // else if (this.currentVolume === this.maxVolumeSinceReset) {
                //     this.nPeaksAtMax += 1;
                // }

                // // update percentPeaksAtMax property
                // this.percentPeaksAtMax =
                //     (100 * this.nPeaksAtMax / this.nPeakMeasurements)
                //         .toFixed(1);
            },
            MONITOR_REFRESH_INTERVAL);
    }

    /**
     * Stops monitoring (stops change detection)
     * @returns {void}
     */
    public stopMonitoring(): void {
        if (this.intervalId) {
            console.log('clearing interval: ' + this.intervalId);
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
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
        // if (res >= this.getDuration()) {
        //     // res = this.audioBuffer.duration;
        //     this.stop();
        //     res = 0;
        // }
        return res;
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
        setTimeout(() => { this.isPlaying = state; });
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
        when: number = 0,
        startTime: number = 0,
        onEnded?: () => void
    ): void {
        console.log('schedulePlay(AudioBuffer, ' + when + ', ' +
            startTime + ', onEnded())');
        this.audioBuffer = audioBuffer;
        let sourceNode: AudioBufferSourceNode =
            AUDIO_CONTEXT.createBufferSource();

        sourceNode.connect(AUDIO_CONTEXT.destination);
        sourceNode.buffer = audioBuffer;

        sourceNode.onended = () => {
            console.log('onended: nScheduled: ' +
                this.scheduledSourceNodes.length);
            const nextNode: AudioBufferSourceNode =
                this.scheduledSourceNodes.pop();
            console.log('schedulePlay:sourceNode.onended() nextNode: ' +
                nextNode);

            if (isUndefined(nextNode)) {
                this.resetSourceNode();
            }
            else {
                this.sourceNode = nextNode;
            }

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
            this.schedulePlay(this.audioBuffer);
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

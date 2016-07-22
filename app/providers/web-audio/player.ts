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

import {
    MasterClock
} from '../master-clock/master-clock';

import {
    formatTime
} from '../../services/utils/utils';

// the name of the function we give to master clock to run
const CLOCK_FUNCTION_NAME: string = 'player';

/**
 * @name WebAudioPlayer
 * @description
 * Audio Player functions based on WebAudio. Originally based on
 * code by Ian McGregor: http://codepen.io/ianmcgregor/pen/EjdJZZ
 */
@Injectable()
export class WebAudioPlayer {
    private masterClock: MasterClock;
    private audioBuffer: AudioBuffer;
    protected sourceNode: AudioBufferSourceNode;
    private scheduledSourceNodes: AudioBufferSourceNode[];
    protected startedAt: number;
    protected pausedAt: number;
    public isPlaying: boolean;
    private intervalId: NodeJS.Timer;
    public time: number;
    public relativeTime: number;
    public duration: number;
    public displayTime: string;
    public displayDuration: string;

    constructor(masterClock: MasterClock) {
        console.log('constructor():WebAudioPlayer');

        this.masterClock = masterClock;

        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];
        this.intervalId = null;

        this.time = 0;
        this.relativeTime = 0;
        this.duration = 0;
        this.displayTime = formatTime(0, 0);
        this.displayDuration = this.displayTime;
    }

    private resetSourceNode(sourceNode: AudioBufferSourceNode): void {
        if (sourceNode) {
            const idx: number = this.scheduledSourceNodes.indexOf(sourceNode);
            if (idx !== -1) {
                delete this.scheduledSourceNodes[idx];
            }
            sourceNode.disconnect();
            sourceNode.stop(0);
            sourceNode = null;
        }
    }

    public getTime(): number {
        if (this.pausedAt) {
            return this.pausedAt;
        }
        else if (this.startedAt) {
            return AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        return 0;
    }

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     * @returns {void}
     */
    public startMonitoring(): void {
        // console.log('PLAYER: startMonitoring()');
        this.masterClock.addFunction(
            CLOCK_FUNCTION_NAME,
            // the monitoring actions are in the following function:
            () => {
                let time: number = this.getTime();

                if (time > this.duration) {
                    time = this.duration;
                    this.stop();
                }

                if (this.time !== time) {
                    // change detected
                    this.time = time;
                    this.relativeTime = time / this.duration;
                    this.displayTime = formatTime(time, this.duration);
                }

                const duration: number = this.getDuration();
                if (this.duration !== duration) {
                    // change detected
                    this.duration = duration;
                    this.displayDuration = formatTime(duration, duration);
                }
                // console.log(this.displayTime + '/' + this.displayDuration);
            });
    }

    /**
     * Stops monitoring (stops change detection)
     * @returns {void}
     */
    public stopMonitoring(): void {
        // console.log('PLAYER: stopMonitoring()');
        this.masterClock.removeFunction(CLOCK_FUNCTION_NAME);
    }

    public getDuration(): number {
        if (this.duration) {
            return this.duration;
        }
        else if (this.audioBuffer) {
            return this.audioBuffer.duration;
        }
        else {
            return 0;
        }
    }

    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number = 0,
        offset: number = 0,
        startOffset: number = 0,
        onEnded?: () => void
    ): void {
        console.log('schedulePlay(AudioBuffer, ' +
            when.toFixed(2) + ', ' +
            offset.toFixed(2) + ', ' +
            startOffset.toFixed(2) + ')');
        this.audioBuffer = audioBuffer;

        let sourceNode: AudioBufferSourceNode =
            AUDIO_CONTEXT.createBufferSource();

        sourceNode.connect(AUDIO_CONTEXT.destination);
        sourceNode.buffer = audioBuffer;
        if (onEnded) {
            sourceNode.onended = onEnded;
        }

        if (when === 0) {
            // start now
            if (this.pausedAt) {
                offset = this.pausedAt;
                startOffset = 0;
            }
            this.sourceNode = sourceNode;
            // this.startedAt = AUDIO_CONTEXT.currentTime - offset;
            // console.log('this.starteAt: ' + this.startedAt);
            // console.log('====> this.starteAt 0: ' +
            //     (AUDIO_CONTEXT.currentTime - offset));
            sourceNode.start(0, offset);
            this.startedAt = AUDIO_CONTEXT.currentTime - offset - startOffset;
            console.log('====> this.starteAt = ' + this.startedAt.toFixed(2));
            sourceNode.stop(this.startedAt + this.audioBuffer.duration);
            this.pausedAt = 0;
            // this.setPlaying(true);
            this.isPlaying = true;
            // only when you start do you start monitoring
            // this.startMonitoring();
        }
        else {
            // start later (when)
            // sourceNode.start(when, offset);
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
        // this.stopMonitoring();
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

    public cancelScheduled(): void {
        for (let i in this.scheduledSourceNodes) {
            console.log('resetting scheduled: ' + i);
            this.resetSourceNode(this.scheduledSourceNodes[i]);
        }
    }

    /**
     * Stop playback
     * @returns {void}
     */
    public stop(): void {
        console.log('stop()');
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.startedAt = 0;
        this.pausedAt = 0;
        // this.setPlaying(false);
        this.isPlaying = false;
        // this.stopMonitoring();
    }
}

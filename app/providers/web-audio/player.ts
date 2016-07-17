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
    private time: number;
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
        this.duration = 0;
        this.displayTime = formatTime(0, 0);
        this.displayDuration = this.displayTime;
    }

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     * @returns {void}
     */
    public startMonitoring(): void {
        console.log('PLAYER: startMonitoring()');
        this.masterClock.addFunction(
            CLOCK_FUNCTION_NAME,
            // the monitoring actions are in the following function:
            () => {
                let time: number = 0;
                if (this.pausedAt) {
                    time = this.pausedAt;
                }
                else if (this.startedAt) {
                    // not paused, and we have started, so playing now
                    time = AUDIO_CONTEXT.currentTime - this.startedAt;
                }

                if (time > this.duration) {
                    time = this.duration;
                    this.stop();
                }

                if (this.time !== time) {
                    // change detected
                    this.time = time;
                    this.displayTime = formatTime(time, this.duration);
                }

                const duration: number = this.getDuration();
                if (this.duration !== duration) {
                    // change detected
                    this.duration = duration;
                    this.displayDuration = formatTime(duration, duration);
                }
                console.log(this.displayTime + ' / ' + this.displayDuration);
            });
    }

    /**
     * Stops monitoring (stops change detection)
     * @returns {void}
     */
    public stopMonitoring(): void {
        console.log('PLAYER: stopMonitoring()');
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
                console.log('DONE! nScheduledSourceNodes = ' +
                    this.scheduledSourceNodes.length);
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
            // only when you start do you start monitoring
            this.startMonitoring();
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
        this.stopMonitoring();
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
        // this.stopMonitoring();
    }

}

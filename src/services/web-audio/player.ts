// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT, Heartbeat } from '../../services';
import { formatTime } from '../../models';

/** @const {string} Heartbeat clock's ID of function to run periodically */
const PLAYER_CLOCK_FUNCTION_ID: string = 'player';

/**
 * Loads and plays audio files (using the Web Audio API and HTML5
 * FileSystem API). Playback part inspired by by Ian McGregor's code here:
 * http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WebAudioPlayer
 */
@Injectable()
export abstract class WebAudioPlayer {
    public isPlaying: boolean;
    public time: number;
    public duration: number;
    public displayTime: string;
    public displayDuration: string;
    public progress: number;

    protected sourceNode: AudioBufferSourceNode;
    // When playing, not paused, (AUDIO_CONTEXT.currentTime - this.startedAt)
    // is the current time, in seconds, into the playback, from the start of
    // the file we're playing.
    protected startedAt: number;
    // When paused, this.pausedAt is the AUDIO_CONTEXT.currentTime time at
    // which we paused
    protected pausedAt: number;
    protected sourceNodes: { [id: number]: AudioBufferSourceNode };

    private heartbeat: Heartbeat;

    /**
     * @constructor
     * @param {Heartbeat} heartbeat - used for regular updates of properties.
     */
    constructor(heartbeat: Heartbeat) {
        console.log('constructor()');
        this.heartbeat = heartbeat;
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        // this.sourceNodes = [];
        this.sourceNodes = {};
        this.time = 0;
        this.duration = 0;
        this.displayTime = formatTime(0, 0);
        this.displayDuration = this.displayTime;
        this.progress = 0;
    }

    /**
     * Abstract method
     */
    public abstract setSourceFile(filePath: string): void;

    /**
     * Abstract method
     */
    public abstract jumpToPosition(position: number): void;

    /**
     * Abstract method
     */
    public abstract playFrom(position: number): void;

    /**
     * Abstract method
     */
    public abstract pauseAt(position: number): void;

    private playerClockCallback() {
        let time: number = this.getTime();
        if (time >= this.duration) {
            this.stop();
            time = 0;
        }
        if (this.time !== time) {
            // change detected
            // console.log('playerClockCallback(): time change detected');
            this.time = time;
            this.progress = time / this.duration;
            this.displayTime = formatTime(time, this.duration);
        }
    }

    /**
     * Ensures change detection every GRAPHICS_REFRESH_INTERVAL
     */
    public startMonitoring(): void {
        console.log('startMonitoring()');
        this.playerClockCallback();
        this.heartbeat.addFunction(
            PLAYER_CLOCK_FUNCTION_ID,
            () => { this.playerClockCallback(); }
        );
    }

    /**
     * Ensure source node stops playback. This does the reset part (stopping
     * playback) only as far as AudioBufferSourceNode is concerned, not fully
     * resetting everything in this function, for that see this.stop(), which
     * calls this function.
     */
    public stopMonitoring(): void {
        console.log('stopMonitoring()');
        this.heartbeat.removeFunction(PLAYER_CLOCK_FUNCTION_ID);
        this.playerClockCallback();
    }

    /**
     * Ensure source node stops playback. This does the reset part (stopping
     * playback) only as far as AudioBufferSourceNode is concerned, not fully
     * resetting everything in this function, for that see this.stop(), which
     * calls this function.
     */
    protected resetSourceNode(sourceNode: AudioBufferSourceNode): void {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
        }
    }

    /**
     * Get the current playback (or paused-at) time.
     */
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
     * Play (now or later) an audio buffer.
     */
    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number = 0,
        startSample: number = 0,
        timeOffset: number = 0,
        onEnded: () => void
    ): void {
        const bufferDuration: number = audioBuffer.duration,
              sourceNode: AudioBufferSourceNode =
              AUDIO_CONTEXT.createBufferSource();

        this.sourceNodes[startSample] = sourceNode;

        console.log('schedulePlay(when: ' +
                    (when === 0 ?
                     AUDIO_CONTEXT.currentTime - timeOffset :
                     when.toFixed(2)) +
                    ', startSample: ' + startSample +
                    ', timeOffset: ' + timeOffset.toFixed(2) +
                    ', startedAt: ' + this.startedAt.toFixed(2) +
                    ', bufferDuration: ' + bufferDuration.toFixed(2) +
                    '): ' + Object.keys(this.sourceNodes).length);

        sourceNode.onended = onEnded;
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(AUDIO_CONTEXT.destination);

        if (when === 0) {
            // start now
            if (this.pausedAt) {
                throw Error('this.pausedAt non zero in schedulePlay()');
            }
            this.sourceNode = sourceNode;
            sourceNode.start(0, 0, bufferDuration);
            this.startedAt = AUDIO_CONTEXT.currentTime - timeOffset;
            this.pausedAt = 0;
            this.isPlaying = true;
            console.log('====> START PLAY AT = ' + this.startedAt.toFixed(2));
        }
        else {
            // start later (when)
            sourceNode.start(when, 0, when + bufferDuration);
            // sourceNode.start(when, 0);
            // we save the scheduled source nodes in an array to avoid them
            // being garbage collected while they wait to be played.
            // this.sourceNodes =
            //     prependArray(sourceNode, this.sourceNodes);
        }
    }

    /**
     * Pause playback - assumes we are playing.
     */
    public pause(elapsed: number = -1): void {
        if (elapsed < 0) {
            elapsed = AUDIO_CONTEXT.currentTime - this.startedAt;
        }
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.pausedAt = elapsed;
        this.isPlaying = false;
        this.stopMonitoring;
    }

    /**
     * Toggle state between play and pause
     */
    public togglePlayPause(): void {
        if (this.isPlaying) {
            this.pause();
            console.log('togglePlayPause(): pausing at: ' +
                        this.pausedAt.toFixed(2));
        }
        else {
            this.startMonitoring();
            console.log('togglePlayPause(): playing from: ' +
                        this.pausedAt.toFixed(2));
            this.playFrom(this.progress);
        }
    }

    /**
     * If any audio buffer source nodes are in the scheduling queue to be
     * played, cancel them all.
     */
    public cancelScheduled(): void {
        console.log('*** resetting ' + Object.keys(this.sourceNodes).length +
                    ' scheduled ***');
        for (let key in this.sourceNodes) {
            this.resetSourceNode(this.sourceNodes[key]);
            delete this.sourceNodes[key];
        }
    }

    /**
     * Stop playback. If an argument is supplied it is where you want
     * to remain paused at after stopping. If not supplied, the default
     * is that you are stopped and paused at the very start (time=0).
     * @param {number} The time you want to be paused at after stopping.
     */
    // public stop(pausedAt: number = 0): void {
    public stop(): void {
        console.log('stop()');
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.stopMonitoring();
    }
}

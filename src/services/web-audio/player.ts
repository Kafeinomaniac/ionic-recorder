// Copyright (c) 2017 Tracktunes Inc

// Lowest-level audio-buffer Web Audio Api playback class.
// This class only deals with a single audio-buffer, it
// knows nothing about multi-buffer streams or encodings.
// Plays for various encodings are in files with name player-X.ts
// (where 'X' is, e.g, 'wav' or 'webm') in play-wav.ts and are
// responsible for dealing with multiple-chunk files stored via indexedDB -
// these extension classes use this base class for single buffer operations.

import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT } from './common';
import { prependArray } from '../../models/utils';

/**
 * Audio playback from an AudioBuffer (not from file, for playback from file,
 * see the classes that extend this one, e.g. wav-player.ts. Based on Web
 * Audio API. Originally this was based on code by Ian McGregor here:
 * http://codepen.io/ianmcgregor/pen/EjdJZZ
 *
 * @class WebAudioPlayer
 */
@Injectable()
export class WebAudioPlayer {
    public isPlaying: boolean;

    protected sourceNode: AudioBufferSourceNode;
    protected startedAt: number;
    protected pausedAt: number;
    protected duration: number;

    private audioBuffer: AudioBuffer;
    private scheduledSourceNodes: AudioBufferSourceNode[];

    /**
     *
     */
    constructor() {
        console.log('WebAudioPlayer:constructor()');
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
        this.scheduledSourceNodes = [];
        this.duration = 0;
    }

    /**
     * Ensure source node stops playback. This does the reset part (stopping
     * playback) only as far as AudioBufferSourceNode is concerned, not fully
     * resetting everything in this function, for that see this.stop(), which
     * calls this function.
     */
    private resetSourceNode(sourceNode: AudioBufferSourceNode): void {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
            const idx: number = this.scheduledSourceNodes.indexOf(sourceNode);
            if (idx !== -1) {
                delete this.scheduledSourceNodes[idx];
            }
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
     * Returns duration of the current file we're playing from - even if
     * the played back file is chunked, we want this to be the total duration,
     * of all chunks.
     */
    public getDuration(): number {
        return this.duration;
    }

    /**
     * Play (now or later) an audio buffer.
     */
    public schedulePlay(
        audioBuffer: AudioBuffer,
        when: number = 0,
        offset: number = 0,
        startOffset: number = 0,
        onEnded?: () => void
    ): void {
        console.log('====> schedulePlay(when: ' + when.toFixed(2) +
                    ', offset: ' + offset.toFixed(2) +
                    ', startOffset: ' + startOffset.toFixed(2) +
                    ', startedAt: ' + this.startedAt.toFixed(2) + ')');

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
            const startedAtOffset: number = offset + startOffset;
            this.sourceNode = sourceNode;

            sourceNode.start(0, offset);

            this.startedAt = AUDIO_CONTEXT.currentTime - startedAtOffset;

            console.log('====> this.starteAt = ' + this.startedAt.toFixed(2) +
                        ', stopping at: ' +
                        (this.startedAt + startedAtOffset +
                         this.audioBuffer.duration).toFixed(2));

            // not sure if this next line is necessary but it makes sure
            // that as soon as the audio is done it's done...
            sourceNode.stop(this.startedAt + startedAtOffset +
                            this.audioBuffer.duration);
            this.pausedAt = 0;
            this.isPlaying = true;
        }
        else {
            // start later (when)
            sourceNode.start(when, 0);
            // we save the scheduled source nodes in an array to avoid them
            // being garbage collected while they wait to be played.
            this.scheduledSourceNodes =
                prependArray(sourceNode, this.scheduledSourceNodes);
        }
    }

    /**
     * Pause playback - assumes we are playing.
     */
    public pause(): void {
        let elapsed: number = AUDIO_CONTEXT.currentTime - this.startedAt;
        this.stop();
        this.pausedAt = elapsed;
    }

    /**
     * Toggle state between play and pause
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
     * If any audio buffer source nodes are in the scheduling queue to be
     * played, cancel them all.
     */
    public cancelScheduled(): void {
        console.log('*** resetting ' + this.scheduledSourceNodes.length +
                    ' scheduled ***');
        let node: AudioBufferSourceNode = this.scheduledSourceNodes.pop();
        while (node) {
            console.log('.');
            this.resetSourceNode(node);
            node = this.scheduledSourceNodes.pop();
        }
    }

    /**
     * Stop playback.
     */
    public stop(): void {
        console.log('stop()');
        this.resetSourceNode(this.sourceNode);
        this.cancelScheduled();
        this.startedAt = 0;
        this.pausedAt = 0;
        this.isPlaying = false;
    }
}

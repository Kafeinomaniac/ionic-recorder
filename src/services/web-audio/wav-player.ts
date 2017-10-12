// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { formatTime, WavFile, WavInfo } from '../../models';
import { MasterClock } from '../../services';

/** @constant {number} Number of samples in the playback memory buffer. */
// const N_BUFFER_SAMPLES: number = 44100;
const N_BUFFER_SAMPLES: number = 88200;

/**
 * Audio Play functions based on WebAudio, originally based on code
 * of Ian McGregor here: http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WavPlayer
 */
@Injectable()
export class WavPlayer extends WebAudioPlayer {
    // current file's info
    private filePath: string;
    private sampleRate: number;
    private nSamples: number;

    /**
     *
     */
    constructor(masterClock: MasterClock) {
        console.log('WavPlayer:constructor()');
        super(masterClock);
        this.filePath = null;
        this.sampleRate = null;
        this.nSamples = 0;
        this.displayDuration = formatTime(0, 0);
    }

    /**
     *
     */
    public setSourceFile(filePath: string): void {
        WavFile.readWavFileHeader(filePath).subscribe(
            (wavInfo: WavInfo) => {
                this.filePath = filePath;
                this.nSamples = wavInfo.nSamples;
                this.sampleRate = wavInfo.sampleRate;
                this.duration = this.nSamples / this.sampleRate;
                this.displayDuration = formatTime(this.duration, this.duration);
                console.log('setSourceFile(' + filePath +
                            ') - nSamples: ' + this.nSamples +
                            ', sampleRate: ' + this.sampleRate +
                            ', duration: ' + this.duration.toFixed(2) +
                            ', displayDuration: ' + this.displayDuration);
            }
        );
    }

    /**
     * Start playing from a relative time point (a relative time point is
     * time, in units of total duration, so relative time always starts at 0
     * and ends at 1).
     */
    public playFromRelativeTime(relativeTime: number): void {
        const startSample1: number = Math.floor(relativeTime * this.nSamples),
              tmp1: number = startSample1 + N_BUFFER_SAMPLES,
              endSample1: number = tmp1 > this.nSamples ? this.nSamples : tmp1,
              startTime1: number = startSample1 / this.sampleRate;

        if (!this.isPlaying) {
            console.log('playFromRelativeTime(' + relativeTime.toFixed(2) +
                        ') - PAUSED AT ' + startTime1);
            this.pausedAt = startTime1;
            // this.time = this.pausedAt;
            this.progress = this.pausedAt / this.duration;
            this.displayTime = formatTime(this.pausedAt, this.duration);
            return;
        }
        console.log('playFromRelativeTime(' +
                    relativeTime.toFixed(2) + ') - PLAYING');

        WavFile.readWavFileAudio(
            this.filePath,
            startSample1,
            endSample1
        ).subscribe(
            (audioBuffer1: AudioBuffer) => {
                this.schedulePlay(audioBuffer1,
                                  0,
                                  0,
                                  startTime1,
                                  () => {
                                      console.log('play ended cb1');
                                  });
            },
            (err1: any) => {
                alert(err1);
            }
        );

    }

}

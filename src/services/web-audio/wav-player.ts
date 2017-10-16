// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    ChangeDetectorRef,
    /* tslint:enable */
    Injectable
} from '@angular/core';
import { WebAudioPlayer } from './player';
import { formatTime, WavFile, WavInfo } from '../../models';
import { MasterClock } from '../../services';

/** @constant {number} Number of samples in the playback memory buffer. */
// const N_BUFFER_SAMPLES: number = 44100;
const N_BUFFER_SAMPLES: number = 40000;

/**
 * Audio Play functions based on WebAudio, originally based on code
 * of Ian McGregor here: http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WavPlayer
 */
@Injectable()
export class WavPlayer extends WebAudioPlayer {
    private changeDetectorRef: ChangeDetectorRef;
    // current file's info
    private filePath: string;
    private sampleRate: number;
    private nSamples: number;

    /**
     *
     */
    constructor(
        masterClock: MasterClock,
        changeDetectorRef: ChangeDetectorRef
    ) {
        console.log('WavPlayer:constructor()');
        super(masterClock);
        this.changeDetectorRef = changeDetectorRef;
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
                            ', duration: ' + this.displayDuration);
            }
        );
    }

    /**
     *
     */
    public jumpToPosition(position: number = null): void {
        console.log('jumpToPosition(' + position + ')');
        if (position) {
            this.progress = position;
        }

        if (this.isPlaying) {
            this.playFrom(position);
        }
        else {
            this.pauseAt(position);
        }
    }

    /**
     *
     */
    private pauseAt(position: number): void {
        const startSample1: number = Math.floor(position * this.nSamples),
              startTime1: number = startSample1 / this.sampleRate;
        console.log('jumpToPosition(' + position.toFixed(2) +
                    ') - PAUSED AT TIME: ' + startTime1.toFixed(2));
        this.pausedAt = startTime1;
        this.displayTime = formatTime(this.pausedAt, this.duration);
    }

    /**
     * Start playing from a relative time point (a relative time point is
     * time, in units of total duration, so relative time always starts at 0
     * and ends at 1).
     */
    private playFrom(position: number): void {
        const nSamples = this.nSamples,
              startSample1: number = Math.floor(position * nSamples),
              t1: number = startSample1 + N_BUFFER_SAMPLES,
              endSample1: number = t1 > nSamples ? nSamples : t1,
              startTime1: number = startSample1 / this.sampleRate;

        WavFile.readWavFileAudio(
            this.filePath,
            startSample1,
            endSample1
        ).subscribe(
            (audioBuffer1: AudioBuffer) => {
                // this.audioBuffer = audioBuffer1;
                console.log('jumpToPosition(' + position.toFixed(2) +
                            ') - PLAYING FROM ' + startTime1.toFixed(2));
                const playFirstBuffer: () => void =  () => {
                    this.schedulePlay(
                        audioBuffer1,
                        0,
                        0,
                        startTime1,
                        this.getOnEndedCB(startSample1)
                    );
                };
                if (endSample1 < nSamples) {
                    // INV: startSample2 = endSample1
                    const t2: number = endSample1 + N_BUFFER_SAMPLES,
                          startSample2: number = endSample1,
                          endSample2: number = t2 > nSamples ? nSamples : t2,
                          startTime2: number = startSample2 / this.sampleRate;
                    WavFile.readWavFileAudio(
                        this.filePath,
                        startSample2,
                        endSample2
                    ).subscribe(
                        (audioBuffer2: AudioBuffer) => {
                            playFirstBuffer();
                            this.schedulePlay(
                                audioBuffer2,
                                this.getChunkPlayTime(startSample2),
                                0,
                                0,
                                this.getOnEndedCB(startSample2)
                            );
                            
                        },
                        (err2: any) => {
                            alert(err2);
                        }
                    );
                } // if (endSample1 < nSamples) {
                else {
                    // no 2nd buffer
                    playFirstBuffer();
                }
            },
            (err1: any) => {
                alert(err1);
            }
        );
    }

    /**
     *
     */
    private getChunkPlayTime(startSample: number): void {
        if (startSample >= this.nSamples) {
            throw Error('startSample >= this.nSamples');
        }
        return this.startedAt + startSample / this.sampleRate;
    }

    /**
     *
     */
    private getOnEndedCB(startSample: number): () => void {
        const nextStartSample: number = startSample + 2 * N_BUFFER_SAMPLES;
        
        if (nextStartSample >= this.nSamples) {
            return () => {
                console.log('====> onEndedCB(' + startSample +
                            ') - reached last chunk');
            };
        }
        return () => {
            const when: number = this.getChunkPlayTime(nextStartSample),
                  tmp: number = nextStartSample + N_BUFFER_SAMPLES,
                  endSample: number = tmp > this.nSamples ? this.nSamples : tmp;

            console.log('====> onEndedCB(' + startSample + '), time = ' +
                        this.getTime().toFixed(2) + ', when: ' +
                        (when - this.startedAt).toFixed(2));
            WavFile.readWavFileAudio(
                this.filePath,
                nextStartSample,
                endSample
            ).subscribe(
                (audioBuffer: AudioBuffer) => {
                    this.schedulePlay(
                        audioBuffer,
                        when,
                        0,
                        0,
                        this.getOnEndedCB(nextStartSample)
                    );
                },
                (err: any) => {
                    throw err;
                }
            );
        }
    }

}

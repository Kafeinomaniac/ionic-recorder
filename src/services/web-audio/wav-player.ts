// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { formatTime, WavFile, WavInfo } from '../../models';
import { Heartbeat } from '../../services';

/** @constant {number} Number of samples in the playback memory buffer. */
// const N_BUFFER_SAMPLES: number = 44100;
const N_BUFFER_SAMPLES: number = 40000.0;

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
    constructor(
        heartbeat: Heartbeat
    ) {
        console.log('constructor()');
        super(heartbeat);
        this.filePath = null;
        this.sampleRate = null;
        this.nSamples = 0;
        this.displayDuration = formatTime(0, 0);
    }

    /**
     *
     */
    public setSourceFile(filePath: string): void {
        WavFile.readWavFileInfo(filePath).subscribe(
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
        console.log('jumpToPosition(' + position.toFixed(2) + ')');
        if (position) {
            // a non-zero, non-null position has been provided as an argument
            this.progress = position;
        }

        if (this.isPlaying) {
            // TODO: next two lines sort of solve the double node playback
            // issue but they do not solve it completely. the other problem
            // that we see with this approach is that there is some jumpiness
            // in the progress handle when we jump-play in the middle of play
            // this.pause();
            // this.stop();
            this.playFrom(position);
        }
        else {
            this.pauseAt(position);
        }
    }

    /**
     *
     */
    public pauseAt(position: number): void {
        const startSample: number = Math.floor(position * this.nSamples),
              startTime: number = startSample / this.sampleRate;
        console.log('pauseAt(' + position.toFixed(2) + ') - time: ' +
                    startTime.toFixed(2));
        this.pausedAt = startTime;
        this.displayTime = formatTime(this.pausedAt, this.duration);
    }

    /**
     * Start playing from a relative time point (a relative time point is
     * time, in units of total duration, so relative time always starts at 0
     * and ends at 1).
     */
    public playFrom(position: number): void {
        const nSamples: number = this.nSamples,
              startSample1: number = Math.floor(position * nSamples),
              t1: number = startSample1 + N_BUFFER_SAMPLES,
              endSample1: number = t1 > nSamples ? nSamples : t1;

        console.log('playFrom(position=' + position + '): ' +
                    'startSample1=' + startSample1 + ', endSample1=' +
                    ', nSamples=' + nSamples);

        WavFile.readWavFileAudio(
            this.filePath,
            startSample1,
            endSample1
        ).subscribe(
            (audioBuffer1: AudioBuffer) => {
                const playFirstBuffer: () => void =  () => {
                    console.log('playFirstBuffer');
                    this.schedulePlay(audioBuffer1, 0, 0,
                                      startSample1 / this.sampleRate,
                                      this.getOnEndedCB(startSample1));
                };
                if (endSample1 < nSamples) {
                    // INV: startSample2 = endSample1
                    const startSample2: number = endSample1,
                          t2: number = startSample2 + N_BUFFER_SAMPLES,
                          endSample2: number = t2 > nSamples ? nSamples : t2;
                    WavFile.readWavFileAudio(
                        this.filePath,
                        startSample2,
                        endSample2
                    ).subscribe(
                        (audioBuffer2: AudioBuffer) => {
                            playFirstBuffer();
                            this.schedulePlay(audioBuffer2,
                                              this.getChunkTime(startSample2),
                                              startSample2, 0,
                                              this.getOnEndedCB(startSample2));
                        },
                        (err2: any) => {
                            alert(err2);
                        }
                    );
                } // if (endSample1 < nSamples) {
                else {
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
    private getOnEndedCB(startSample: number): () => void {
        const nSamples: number = this.nSamples,
              nextStartSample: number = startSample + 2 * N_BUFFER_SAMPLES,
              destroyMe: (i: number) => void = (i: number) => {
                  console.log('destroyMe(' + i + ') - ' +
                              Object.keys(this.sourceNodes).length);
                  const sourceNode: AudioBufferSourceNode = this.sourceNodes[i];
                  if (sourceNode) {
                      this.resetSourceNode(sourceNode);
                      delete this.sourceNodes[i];
                  }
              };

        console.log('getOnEndedCB(' + startSample + ') - startSample: ' +
                    startSample  + ', nextStartSample: ' +
                    nextStartSample + ', nSamples: ' + nSamples);

        if (nextStartSample >= nSamples) {
            return () => {
                destroyMe(startSample);
                console.log('onEndedCB(' + startSample +
                            ') - reached last chunk');
            };
        }
        return () => {
            destroyMe(startSample);
            const when: number = this.getChunkTime(nextStartSample),
                  tmp: number = nextStartSample + N_BUFFER_SAMPLES,
                  endSample: number = tmp > nSamples ? nSamples : tmp;
            console.log('onEndedCB(' + startSample + '), time = ' +
                        this.getTime().toFixed(2) + ', when: ' +
                        (when - this.startedAt).toFixed(2) +
                        ', nextStartSample: ' + nextStartSample +
                        ', endSample: ' + endSample);
            WavFile.readWavFileAudio(
                this.filePath,
                nextStartSample,
                endSample
            ).subscribe(
                (audioBuffer: AudioBuffer) => {
                    // console.log('+++++++++++++++ ' + audioBuffer.length);
                    // console.log('+++++++++++++++ ' + when);
                    this.schedulePlay(
                        audioBuffer,
                        when,
                        nextStartSample,
                        0,
                        this.getOnEndedCB(nextStartSample)
                    );
                },
                (err: any) => {
                    console.log('THIS IS WHERE ERR IS: ' + err);
                    throw err;
                }
            );
        };
    }

    /**
     *
     */
    private getChunkTime(startSample: number): number {
        console.log('getChunkTime(startSample: ' + startSample + ') = ' +
                    (this.startedAt + startSample / this.sampleRate)
                    .toFixed(2));
        if (startSample >= this.nSamples) {
            throw Error('startSample >= this.nSamples');
        }
        return this.startedAt + startSample / this.sampleRate;
    }

}

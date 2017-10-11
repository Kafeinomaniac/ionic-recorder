// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { WavFile, WavInfo } from '../../models';

/** @constant {number} */
const N_BUFFER_SAMPLES: number = 44100;

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
    constructor() {
        console.log('WavPlayer:constructor()');
        super();
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
                console.log('setSourceFile(' + filePath +
                            ') - Got: nSamples = ' + this.nSamples +
                            ', sampleRate = ' + this.sampleRate +
                            ', duration = ' + this.duration);
            }
        );
    }

    /**
     *
     */
    public jumpToRatio(ratio: number): void {
        if (!this.nSamples || !this.sampleRate) {
            alert('jumpTo(): !this.nSamples || !this.sampleRate');
        }
        // Compute startSample1, startSample2 and endSample1, endSample2 - the
        // start/end of the first two chunks.
        const startSample1: number = Math.floor(ratio * this.nSamples),
              tmp1: number = startSample1 + N_BUFFER_SAMPLES,
              endSample1: number = tmp1 > this.nSamples ? this.nSamples : tmp1,
              startSample2: number = endSample1,
              tmp2: number = startSample2 + N_BUFFER_SAMPLES,
              endSample2: number = tmp2 > this.nSamples ? this.nSamples : tmp2,
              startTime1: number = startSample1 / this.sampleRate,
              startTime2: number = startSample2 / this.sampleRate,
              when2: number = N_BUFFER_SAMPLES / this.sampleRate,
              zeroOffset: number = 0;

        console.log('jumpTo(' + ratio.toFixed(2) +
                    '): startSample1: ' + startSample1.toFixed(2) +
                    ', endSample1: ' + endSample1.toFixed(2) + 
                    ', startSample2: ' + startSample2.toFixed(2) + 
                    ', endSample2: ' + endSample2.toFixed(2) +
                    ', startTime1: ' + startTime1.toFixed(2) + 
                    ', startTime2: ' + startTime2.toFixed(2));
        
        if (this.startedAt) {
            // we're in the midst of playing
            alert('already started, playing now...');
        }
        else {
            // we're either paused somewhere (this.pausedAt > 0) or
            // we haven't even started (this.pausedAt === 0)
            console.log('PRE-JUMP PAUSED AT: ' + this.pausedAt);
            this.pausedAt = startTime1;
            console.log('POST-JUMP PAUSED AT: ' + this.pausedAt);

            WavFile.readWavFileAudio(
                this.filePath,
                startSample1,
                endSample1
            ).subscribe(
                (audioBuffer1: AudioBuffer) => {
                    this.schedulePlay(audioBuffer1,
                                      0,
                                      zeroOffset,
                                      startTime1,
                                      () => {
                                          console.log('play ended cb1');
                                      });
                    WavFile.readWavFileAudio(
                        this.filePath,
                        startSample2,
                        endSample2
                    ).subscribe(
                        (audioBuffer2: AudioBuffer) => {
                            this.schedulePlay(audioBuffer2,
                                              when2,
                                              zeroOffset,
                                              startTime2,
                                              () => {
                                                  console.log('play ended cb2');
                                              });
                        },
                        (err1: any) => {
                            alert(err1);
                            console.dir(err1);
                        }
                    );
                },
                (err2: any) => {
                    alert(err2);
                    console.dir(err2);
                }
            ); // WavFile.readWavFileAduio(..).subscribe(
        }
    }

}

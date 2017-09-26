// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT, SAMPLE_RATE, WAV_MIME_TYPE } from './common';
import { WAV_CHUNK_LENGTH } from './record-wav';
import { WebAudioPlay } from './play';
import { isOdd, formatTime } from '../../models/utils/utils';
import { MasterClock } from '../master-clock/master-clock';
import { makeWavBlobHeaderView } from '../../models/utils/wav';
import { AppFilesystem } from '../../services';

const AUDIO_BUFFER_SAMPLES: number = 128000;

/**
 * Audio Play functions based on WebAudio, originally based on code
 * of Ian McGregor here: http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WebAudioPlay
 */
@Injectable()
export class WebAudioWavPlayer extends WebAudioPlayer {
    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;
    private appFilesystem: AppFilesystem;

    constructor(masterClock: MasterClock, appFilesystem: AppFilesystem) {
        console.log('WebAudioWavPlayer.constructor()');
        super(masterClock);
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        this.appFilesystem = appFilesystem;
    }

    public setSourceFile(filePath: string): void {
        console.log('WebAudioWavPlayer.setFileName()');
        // load file header for this
        // set this.filePath
        // set this.nSamples
        // set this.duration
        // grab sampleRate FROM FILE
        // compute start byte and end byte (file-size)
    }

    /**
     * 
     */
    public relativeTimeSeek(relativeTime: number): void {
        const startSample: number = Math.floor(relativeTime * this.nSamples),
              startTime: number = startSample / this.sampleRate,
              endSample: number = startSample + AUDIO_BUFFER_SAMPLES;

        if (this.pausedAt) {
            this.pausedAt = startTime;
        }
        else {
            if (this.startedAt) {
                // time: AUDIO_CONTEXT.currentTime - this.startedAt;
            }
            else {
                return 0;
            }



        // E.g. say AUDIO_BUFFER_SAMPLES is 10, then:
        //     0,1,2,..,9,10,..,20,..
        //     s          es    es
        //    startSample2: number = endSample1,
        //    endSample2: number = startSample2 + AUDIO_BUFFER_SAMPLES;
        let startSample1: number = Math.floor(relativeTime * this.nSamples),
            startTime1: number = startSample / this.sampleRate,
            endSample1: number = startSample + AUDIO_BUFFER_SAMPLES;

        if (startSample >= this.nSamples) {
            console.log('WARNING: startSample >= this.nSamples');
            return;
        }

        if (endSample1 > this.nSamples) {
            // we've reached the end at the first chunk
            endSample1 = this.nSamples;
        }

        this.appFilesystem.readFromFile(
            this.filePath, 
            startSample1,
            endSample1
        ).subscribe(
            (audioBuffer1: AudioBuffer) => {

                this.schedulePlay(
                    audioBuffer1,
                    0,
                    0,
                    startTime1,
                    this.getOnEndedCB());

                const startSample2: number = endSample1,
                      startTime2: number = startSample2 / this.sampleRate,
                      endSample2: number = startSample2 + AUDIO_BUFFER_SAMPLES;

                if (startSample2 < this.nSamples) {
                    // we haven't reached the end in chunk1 so go on to chunk2

                    if (endSample2 > this.nSamples) {
                        endSample2 = this.nSamples;
                    }

                    this.appFilesystem.readFromFile(
                        this.filePath, 
                        startSample2,
                        endSample2
                    ).subscribe(
                        (audioBuffer2: AudioBuffer) => {

                            // schedule to play 2nd buffer at startTime2
                            // the start
                            this.schedulePlay(
                                audioBuffer2,
                                startTime2,,
                                0,
                                startTime2,
                                this.getOnEndedCB());

                        },
                        (err2: any) => {
                            alert(err2);
                        }
                    );
                } // if (startSample < this.nSamples) {
            },
            (err1: any) => {
                alert(err1);
            }
        );
    }

    public stop(stopMonitoring: boolean = true): void {
        super.stop(stopMonitoring);
    }

    public togglePlayPause(): void {
        if (!this.isPlaying) {
            console.log('play from: ' + this.pausedAt);
            this.play();
        }
        else {
            this.pause();
            console.log('pause at: ' + this.pausedAt);
        }
    }
}

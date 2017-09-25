// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AUDIO_CONTEXT, SAMPLE_RATE, WAV_MIME_TYPE } from './common';
import { WAV_CHUNK_LENGTH } from './record-wav';
import { WebAudioPlay } from './play';
import { isOdd, formatTime } from '../../models/utils/utils';
import { MasterClock } from '../master-clock/master-clock';
import { makeWavBlobHeaderView } from '../../models/utils/wav';
import { AppFS } from '../../services';

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
    private appFS: AppFS;

    constructor(masterClock: MasterClock, appFS: AppFS) {
        console.log('WebAudioWavPlayer.constructor()');
        super(masterClock);
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        this.appFS = appFS;
    }

    public setSource(filePath: string): void {
        console.log('WebAudioWavPlayer.setFileName()');
        // load file header for this
        // set this.filePath
        // set this.nSamples
        // grab sampleRate FROM FILE
        // compute start byte and end byte (file-size)
    }

    public relativeTimeSeek(relativeTime: number): void {
        // E.g. say AUDIO_BUFFER_SAMPLES is 10, then:
        //     0,1,2,..,9,10,..,20,..
        //     s          es    es
        //    startSample2: number = endSample1,
        //    endSample2: number = startSample2 + AUDIO_BUFFER_SAMPLES;
        let startSample: number = Math.floor(relativeTime * this.nSamples),
            endSample: number = startSample + AUDIO_BUFFER_SAMPLES;
        if (endSample > this.nSamples) {
            endSample = this.nSamples;
        }

        this.appFS.readFromFile(
            this.filePath, 
            startSample,
            endSample
        ).subscribe(
            (audioBuffer1: AudioBuffer) => {
                startSample = endSample;
                endSample += AUDIO_BUFFER_SAMPLES;
                if (endSample > this.nSamples) {
                    endSample = this.nSamples;
                }
                this.appFS.readFromFile(
                    this.filePath, 
                    startSample,
                    endSample
                ).subscribe(
                    (audioBuffer2: AudioBuffer) => {
                    },
                    (err2: any) => {
                        alert(err2);
                    }
                );
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

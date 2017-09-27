// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { MasterClock } from '../master-clock/master-clock';
import { AppFilesystem } from '../../services';

// const AUDIO_BUFFER_SAMPLES: number = 128000;

/**
 * Audio Play functions based on WebAudio, originally based on code
 * of Ian McGregor here: http://codepen.io/ianmcgregor/pen/EjdJZZ
 * @class WavPlayer
 */
@Injectable()
export class WavPlayer extends WebAudioPlayer {
    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;
    private appFilesystem: AppFilesystem;

    // current file info
    private filePath: string;
    private sampleRate: number;
    private nSamples: number;
    private chunkAudioBuffer: AudioBuffer;

    constructor(masterClock: MasterClock, appFilesystem: AppFilesystem) {
        console.log('WavPlayer.constructor()');
        super(masterClock);
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        this.appFilesystem = appFilesystem;
    }

    public setSourceFile(filePath: string): void {
        console.log('WavPlayer.setSourceFile(' + filePath + ')');
        this.appFilesystem.readWavFileHeader(filePath).subscribe(
            (wavHeaderInfo: Object) => {
                this.filePath = filePath;
                this.nSamples = wavHeaderInfo.nSamples;
                this.sampleRate = wavHeaderInfo.sampleRate;
            }
        );

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
              startTime: number = startSample / this.sampleRate;

        if (this.pausedAt) {
            this.pausedAt = startTime;
        }
        else if (this.startedAt) {
            // time: AUDIO_CONTEXT.currentTime - this.startedAt;
        }
    }

    public stop(stopMonitoring: boolean = true): void {
        super.stop(stopMonitoring);
    }

    public togglePlayPause(): void {
        if (!this.isPlaying) {
            console.log('play from: ' + this.pausedAt);
            this.schedulePlay(this.chunkAudioBuffer);
        }
        else {
            this.pause();
            console.log('pause at: ' + this.pausedAt);
        }
    }
}

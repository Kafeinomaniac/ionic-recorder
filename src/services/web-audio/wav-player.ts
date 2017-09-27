// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { MasterClock } from '../master-clock/master-clock';
import { AppFilesystem, WavInfo } from '../../services';

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

    /**
     *
     */
    constructor(masterClock: MasterClock, appFilesystem: AppFilesystem) {
        console.log('WavPlayer.constructor()');
        super(masterClock);
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        this.appFilesystem = appFilesystem;
    }

    /**
     *
     */
    public setSourceFile(filePath: string): void {
        this.appFilesystem.readWavFileHeader(filePath).subscribe(
            (wavHeaderInfo: WavInfo) => {
                this.filePath = filePath;
                this.nSamples = wavHeaderInfo.nSamples;
                this.sampleRate = wavHeaderInfo.sampleRate;
                console.log('WavPlayer.setSourceFile(' + filePath + 
                            ') - Got: nSamples = ' + this.nSamples +
                            ', sampleRate = ' + this.sampleRate);
            }
        );
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

    /**
     *
     */
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

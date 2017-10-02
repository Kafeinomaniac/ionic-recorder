// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { WebAudioPlayer } from './player';
import { AppFilesystem, WavInfo } from '../../services';
// import { formatSecondsTime } from '../../models/utils';

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
    // private chunkAudioBuffer: AudioBuffer;

    /**
     *
     */
    constructor(appFilesystem: AppFilesystem) {
        console.log('WavPlayer.constructor()');
        super();
        this.appFilesystem = appFilesystem;
        // this.relativeTime = 0;
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
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
                this.duration = this.nSamples / this.sampleRate;
                console.log('WavPlayer.setSourceFile(' + filePath +
                            ') - Got: nSamples = ' + this.nSamples +
                            ', sampleRate = ' + this.sampleRate +
                            ', duration = ' + this.duration);
            }
        );
    }

    /**
     * Return the Ionicons icon name for visualizing current play status.
     * @return {string} - the Ionicons icon name to show current play status
     */
    public statusIcon(): string {
        // console.log('statusIcon(): ' + (this.isPlaying ? "pause" : "play"));
        return this.isPlaying ? 'pause' : 'play';
    }

    /**
     *
     */
    public jumpTo(progress: number): void {
        console.log('WavPlayer.jumpTo(' + progress + ')');
        if (!this.nSamples || !this.sampleRate) {
            alert('WavPlayer.jumpTo(): !this.nSamples || !this.sampleRate');
        }
        const startSample: number = Math.floor(progress * this.nSamples),
              startTime: number = startSample / this.sampleRate;

        console.log('WavPlayer.jumpTo(' + progress + '): startSample: '
                    + startSample + ', startTime: ' + startTime);

        if (this.startedAt) {
            // we're in the midst of playing
        }
        else {
            console.log('NOT STARTED-AT!!!!!!!!!!!!!!!!!!!!!!!');
            // we're either paused somewhere (this.pausedAt > 0) or
            // we haven't even started (this.pausedAt === 0)
            // console.log('PRE-JUMP PAUSED AT: ' + this.pausedAt);
            this.pausedAt = startTime;
            // console.log('POST-JUMP PAUSED AT: ' + this.pausedAt);
        }
    }

    // this.relativeTime = (this.pausedAt - this.startedAt) *
    //     this.sampleRate / this.nSamples;
    // this.relativeTimeSeek(this.relativeTime);

    /**
     * Change play status. If not playing, play. Otherwise, pause.
     */
    public togglePlayPause(): void {
        console.log('WavPlayer.togglePlayPause()');
        if (!this.isPlaying) {
            // this.play();
        }
        else {
            this.pause();
            console.log('pause at: ' + this.pausedAt);
        }
    }

}

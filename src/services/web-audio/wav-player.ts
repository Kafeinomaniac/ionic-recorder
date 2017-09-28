// Copyright (c) 2017 Tracktunes Inc

import {
    /* tslint:disable */
    ChangeDetectorRef,
    /* tslint:enable */
    Injectable
} from '@angular/core';
import { WebAudioPlayer } from './player';
import { AppFilesystem, MasterClock, WavInfo } from '../../services';
import { formatSecondsTime } from '../../models/utils';

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
    private changeDetectorRef: ChangeDetectorRef;

    // current file info
    private filePath: string;
    private sampleRate: number;
    private nSamples: number;
    // private chunkAudioBuffer: AudioBuffer;

    /**
     *
     */
    constructor(
        masterClock: MasterClock,
        appFilesystem: AppFilesystem,
        changeDetectorRef: ChangeDetectorRef
    ) {
        console.log('WavPlayer.constructor()');
        super(masterClock);
        this.appFilesystem = appFilesystem;
        this.changeDetectorRef = changeDetectorRef;
        this.relativeTime = 0;
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
                this.displayDuration = formatSecondsTime(this.duration,
                                                         this.duration);

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
    public jumpTo(relativeTime: number): void {
        console.log('WavPlayer.jumpTo(' + relativeTime + ')');
        if (!this.nSamples || !this.sampleRate) {
            alert('WavPlayer.jumpTo(): !this.nSamples || !this.sampleRate');
        }
        const startSample: number = Math.floor(relativeTime * this.nSamples),
              startTime: number = startSample / this.sampleRate;

        console.log('WavPlayer.relativeTimeSeek(' + relativeTime +
                    '): startSample: ' + startSample + ', startTime: ' +
                    startTime);

        if (this.startedAt) {
            // we're in the midst of playing
        }
        else {
            // we're either paused somewhere (this.pausedAt > 0) or
            // we haven't even started (this.pausedAt === 0)
            // console.log('PRE-JUMP PAUSED AT: ' + this.pausedAt);
            this.pausedAt = startTime;
            // console.log('POST-JUMP PAUSED AT: ' + this.pausedAt);
            this.detectChanges();
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

    private detectChanges(): void {
        setTimeout(
            () => {
                this.changeDetectorRef.detectChanges();
            },
            0
        );
    }

}

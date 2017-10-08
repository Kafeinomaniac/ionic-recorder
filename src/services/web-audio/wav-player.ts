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
    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;

    // current file info
    private filePath: string;
    private fileSystem: FileSystem;
    private sampleRate: number;
    private nSamples: number;

    /**
     *
     */
    constructor() {
        console.log('constructor()');
        super();
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
    }

    /**
     *
     */
    public setSourceFile(fileSystem: FileSystem, filePath: string): void {
        WavFile.readWavFileHeader(fileSystem, filePath).subscribe(
            (wavInfo: WavInfo) => {
                this.filePath = filePath;
                this.fileSystem = fileSystem;
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
    public jumpTo(progress: number): void {
        if (!this.nSamples || !this.sampleRate) {
            alert('jumpTo(): !this.nSamples || !this.sampleRate');
        }
        const startSample: number = Math.floor(progress * this.nSamples),
              tmp: number = startSample + N_BUFFER_SAMPLES,
              endSample: number = tmp > this.nSamples ? this.nSamples : tmp,
              startTime: number = startSample / this.sampleRate;

        console.log('jumpTo(' + progress + '): startSample: ' +
                    startSample + ', endSample: ' + endSample +
                    ', startTime: ' + startTime);

        if (this.startedAt) {
            // we're in the midst of playing
            alert('already started, playing now...');
        }
        else {
            // we're either paused somewhere (this.pausedAt > 0) or
            // we haven't even started (this.pausedAt === 0)
            console.log('PRE-JUMP PAUSED AT: ' + this.pausedAt);
            this.pausedAt = startTime;
            console.log('POST-JUMP PAUSED AT: ' + this.pausedAt);

            WavFile.readWavFileAudio(
                this.fileSystem,
                this.filePath,
                startSample,
                endSample
            ).subscribe(
                (audioBuffer: AudioBuffer) => {
                    console.log('Just read wav file audio successfully!!!');
                    this.schedulePlay(audioBuffer, 0, 0, 0, () => {
                        alert('play ended cb');
                    });
                },
                (err: any) => {
                    alert('Error: ' + err);
                    console.dir(err);
                }
            ); // WavFile.readWavFileAduio(..).subscribe(
        }
    }

}

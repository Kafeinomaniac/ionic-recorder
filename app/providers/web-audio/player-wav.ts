// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    AUDIO_CONTEXT,
    RecordingInfo
} from './common';

import {
    DB_CHUNK_LENGTH
} from './recorder-wav';

import {
    WebAudioPlayer
} from './player';

import {
    formatTime
} from '../../services/utils/utils';

import {
    IdbAppData
} from '../idb-app-data/idb-app-data';

function uint16ArrayToWavBlob(uint16Array: Uint16Array): Blob {
    'use strict';
    let arrayByteLength: number = uint16Array.byteLength,
        headerView: DataView = new DataView(new ArrayBuffer(44)),
        setString:
            (dv: DataView, offset: number, str: string) => void =
            (dv: DataView, offset: number, str: string) => {
                let len: number = str.length, i: number;
                for (i = 0; i < len; i++) {
                    dv.setUint8(offset + i, str.charCodeAt(i));
                }
            },
        nChannels: number = 1;
    setString(headerView, 0, 'RIFF');
    headerView.setUint32(4, 36 + arrayByteLength);
    setString(headerView, 8, 'WAVE');
    setString(headerView, 12, 'fmt ');
    headerView.setUint32(16, 16, true);
    headerView.setUint16(20, 1, true);
    headerView.setUint16(22, nChannels, true);
    headerView.setUint32(24, AUDIO_CONTEXT.sampleRate, true);
    headerView.setUint32(28, AUDIO_CONTEXT.sampleRate * 4, true);
    headerView.setUint16(32, nChannels * 2, true);
    headerView.setUint16(34, 16, true);
    setString(headerView, 36, 'data');
    headerView.setUint32(40, arrayByteLength, true);
    return new Blob([headerView, uint16Array], { type: 'audio/wav' });
}

/**
 * @name WebAudioPlayer
 * @description
 * Audio Player functions based on WebAudio. Originally based on
 * code by Ian McGregor: http://codepen.io/ianmcgregor/pen/EjdJZZ
 */
@Injectable()
export class WebAudioPlayerWav extends WebAudioPlayer {
    private idb: IdbAppData;
    private recordingInfo: RecordingInfo;
    private fileReader: FileReader;

    constructor(idb: IdbAppData) {
        super();
        console.log('constructor():WebAudioPlayer');
        this.idb = idb;
        if (!this.idb) {
            throw Error('WebAudioPlayerWav:constructor(): db unavailable.');
        }
        this.fileReader = new FileReader();
    }

    public setRecordingInfo(recordingInfo: RecordingInfo): void {
        this.recordingInfo = recordingInfo;
    }

    /**
     * Returns current playback time - position in song
     * @returns {number}
     */
    public getTime(): number {
        let res: number = 0;
        return res;
    }

    /**
     * Returns a string representation of current time no longer than the
     * string representation of current duration.
     * @returns {string}
     */
    public getDisplayTime(): string {
        return formatTime(this.getTime(), this.getDuration());
    }

    /**
     * Returns a number in [0, 1] denoting relative location in song
     * @returns {number}
     */
    public getProgress(): number {
        // console.log(this.getTime() / this.duration);
        return this.getTime() / this.getDuration();
    }

    /**
     * Pause
     * @returns {void}
     */
    public pause(): void {
        console.log('pause');
    }

    /**
     * Stop playback
     * @returns {void}
     */
    public stop(): void {
        console.log('stop');
    }

    private loadDecodeAndPlay(startKey: number) {

    }

    /**
     * Seek playback to a specific time, retaining playing state (or not)
     * @returns {void}
     */
    public timeSeek(time: number): void {
        console.log('skipToTime(' + time.toFixed(2) + ')');
        const
            duration: number =
                this.recordingInfo.nSamples / this.recordingInfo.sampleRate,
            relativeTime: number =
                time / duration,
            sampleToSkipTo: number =
                Math.floor(relativeTime * this.recordingInfo.nSamples),
            relativeSampleToSkipTo: number =
                sampleToSkipTo % DB_CHUNK_LENGTH,
            key: number =
                this.recordingInfo.dbStartKey +
                Math.floor(sampleToSkipTo / DB_CHUNK_LENGTH),
            chunkRelativeTime: number =
                relativeSampleToSkipTo / DB_CHUNK_LENGTH,
            chunkDuration: number =
                DB_CHUNK_LENGTH / this.recordingInfo.sampleRate,
            chunkStartTime: number = chunkRelativeTime * chunkDuration;

        console.log('duration: ' + duration + ', ' +
            'relativeTime: ' + relativeTime + ', ' +
            'sampleToSkipTo: ' + sampleToSkipTo + ', ' +
            'key: ' + key + ', ');

        this.idb.readChunk(key).subscribe(
            (wavArray: Uint16Array) => {
                console.log('got chunk ' + key + ' from db!');
                this.fileReader.onerror = () => {
                    throw Error('FileReader error: ' + this.fileReader.error);
                };
                this.fileReader.onload = () => {
                    AUDIO_CONTEXT.decodeAudioData(
                        this.fileReader.result,
                        (audioBuffer: AudioBuffer) => {
                            console.log('decoded! duration: ' +
                                audioBuffer.duration);
                            this.setAudioBuffer(audioBuffer);
                            // setting this.pausedAt causes this.play() to skip to 
                            // chunkTime within the chunk it is currently playing
                            this.play(0, chunkStartTime);
                        },
                        () => {
                            throw Error('decodeAudioData() error');
                        }
                    );
                };
                // this.loadAndDecode(blob, true, null, null);
                this.fileReader.readAsArrayBuffer(
                    uint16ArrayToWavBlob(wavArray)
                );
            }); // this.idb.readChunk(key).subscribe(
    } // public timeSeek(time: number): void {

}

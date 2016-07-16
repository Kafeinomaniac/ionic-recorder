// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

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
    formatTime,
    isOdd
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
    private duration: number;
    private chunkDuration: number;
    private dbStartKey: number;
    private nSamples: number;
    private lastKey: number;
    private chunkStartTime: number;
    private startKey: number;

    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;

    constructor(idb: IdbAppData) {
        super();
        console.log('constructor():WebAudioPlayer');
        this.idb = idb;
        if (!this.idb) {
            throw Error('WebAudioPlayerWav:constructor(): db unavailable.');
        }
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
    }

    public setRecordingInfo(recordingInfo: RecordingInfo): void {
        this.recordingInfo = recordingInfo;
        this.nSamples = this.recordingInfo.nSamples;
        this.dbStartKey = this.recordingInfo.dbStartKey;
        this.duration =
            this.nSamples / this.recordingInfo.sampleRate;
        this.chunkDuration =
            DB_CHUNK_LENGTH / this.recordingInfo.sampleRate;
        this.startKey = this.dbStartKey;
        this.lastKey =
            this.dbStartKey + Math.floor(this.nSamples / DB_CHUNK_LENGTH);
    }

    /**
     * Returns current playback time - position in song
     * @returns {number}
     */
    // public getTime(): number {
    //     let res: number = 0;
    //     return res;
    // }

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

    private getFileReader(key: number): FileReader {
        console.log('getFileReader(' + key + ') -> ' +
            (isOdd(key) ? 'ODD' : 'EVEN'));
        return isOdd(key) ? this.oddKeyFileReader : this.evenKeyFileReader;
    }

    private getOnEndedCB(key: number, startTime: number): () => void {
        key += 2;
        if (key > this.lastKey) {
            return () => {
                console.log('onEnded() - reached last chunk - nextNode: ' +
                    this.sourceNode);
            };
        }
        else {
            return () => {
                // this.startedAt + chunkStartTime + chunkDuration
                console.log('onEnded() - scheduling key: ' + key +
                    ' - nextNode: ' + this.sourceNode + ', when: ' +
                    this.getChunkScheduleTime(key));
                this.scheduleChunk(key, this.getChunkScheduleTime(key))
                    .subscribe(
                    null,
                    (error) => {
                        throw Error('getOnEndedCB(): ' + error);
                    });
            };
        }
    }

    private getChunkScheduleTime(key: number): number {
        const deltaKey: number = key - this.startKey;
        if (key > this.lastKey) {
            throw Error('key > lastKey');
        }
        if (deltaKey === 0) {
            throw Error('Do not schedule the now for later!');
        }
        // if (this.startedAt === 0) {
        //     throw Error('this.startedAt === 0!');
        // }
        else {
            console.log('getScheduleTime(' + key + ') returned ' +
                (this.startedAt + deltaKey * this.chunkDuration) +
                ', startedAt: ' + this.startedAt
            );
            return this.startedAt + deltaKey * this.chunkDuration;
        }
    }

    private scheduleChunk(
        key: number,
        when: number = 0,
        startTime: number = 0
    ): Observable<void> {
        console.log('scheduleChunk(' + key + ', ' + when +
            ', ' + startTime + ')');
        let obs: Observable<void> = Observable.create((observer) => {
            const fileReader: FileReader = this.getFileReader(key);
            this.idb.readChunk(key).subscribe(
                (wavArray: Uint16Array) => {
                    console.log('got chunk ' + key + ' from db!');
                    fileReader.onerror = () => {
                        throw Error('FileReader error: ' + fileReader.error);
                    };
                    fileReader.onload = () => {
                        AUDIO_CONTEXT.decodeAudioData(
                            fileReader.result,
                            (audioBuffer: AudioBuffer) => {
                                console.log('decoded! duration: ' +
                                    audioBuffer.duration);
                                // this.setAudioBuffer(audioBuffer);
                                // this.play(chunkStartTime);
                                this.schedulePlay(
                                    audioBuffer,
                                    when,
                                    startTime,
                                    this.getOnEndedCB(key, startTime)
                                );
                                observer.next();
                                observer.complete();
                            },
                            () => {
                                observer.error('decodeAudioData() error');
                            }
                        );
                    };
                    // this.loadAndDecode(blob, true, null, null);
                    fileReader.readAsArrayBuffer(
                        uint16ArrayToWavBlob(wavArray)
                    );
                }); // this.idb.readChunk(key).subscribe(

        });
        return obs;
    }

    /**
     * Seek playback to a specific time, retaining playing state (or not)
     * @returns {void}
     */
    public timeSeek(time: number): void {
        console.log('skipToTime(' + time.toFixed(2) + ')');
        const
            relativeTime: number =
                time / this.duration,
            absoluteSampleToSkipTo: number =
                Math.floor(relativeTime * this.recordingInfo.nSamples),
            relativeSampleToSkipTo: number =
                absoluteSampleToSkipTo % DB_CHUNK_LENGTH,
            startKey: number =
                this.recordingInfo.dbStartKey +
                Math.floor(absoluteSampleToSkipTo / DB_CHUNK_LENGTH),
            chunkRelativeTime: number =
                relativeSampleToSkipTo / DB_CHUNK_LENGTH;
        this.startKey = startKey;
        this.chunkStartTime = chunkRelativeTime * this.chunkDuration;
        console.log('duration: ' + this.duration + ', ' +
            'relativeTime: ' + relativeTime + ', ' +
            'absoluteSampleToSkipTo: ' + absoluteSampleToSkipTo + ', ' +
            'startKey: ' + startKey + ', ' +
            'lastKey: ' + this.lastKey);

        this.scheduleChunk(startKey, 0, this.chunkStartTime).subscribe(
            () => {
                console.log('----> this.startedAt: ' + this.startedAt);
                if (startKey + 1 <= this.lastKey) {
                    this.scheduleChunk(
                        startKey + 1,
                        this.getChunkScheduleTime(startKey + 1)
                    ).subscribe(
                        null,
                        (error) => {
                            throw Error('timeSeek-2: ' + error);
                        });
                }
            },
            (error) => {
                throw Error('timeSeek-1: ' + error);
            }
        );
    } // public timeSeek(time: number): void {

}

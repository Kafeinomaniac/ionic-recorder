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
    isOdd,
    formatTime
} from '../../services/utils/utils';

import {
    IdbAppData
} from '../idb-app-data/idb-app-data';

import {
    MasterClock
} from '../master-clock/master-clock';

// see: http://soundfile.sapp.org/doc/WaveFormat/
function int16ArrayToWavBlob(int16Array: Int16Array): Blob {
    'use strict';
    let arrayByteLength: number = int16Array.byteLength,
        headerView: DataView = new DataView(new ArrayBuffer(44)),
        setString:
            (dv: DataView, offset: number, str: string) => void =
            (dv: DataView, offset: number, str: string) => {
                let len: number = str.length, i: number;
                for (i = 0; i < len; i++) {
                    dv.setUint8(offset + i, str.charCodeAt(i));
                }
            };
    // 0-4:   ChunkId
    setString(headerView, 0, 'RIFF');
    // 4-8:   ChunkSize
    headerView.setUint32(4, 36 + arrayByteLength * 2);
    // 8-12:  Format
    setString(headerView, 8, 'WAVE');
    // 12-16: Subchunk1ID
    setString(headerView, 12, 'fmt ');
    // 16-20: Subchunk1Size
    headerView.setUint32(16, 16, true);
    // 20-22: AudioFormat
    headerView.setUint16(20, 1, true);
    // 22-24: NumChannels
    headerView.setUint16(22, 1, true);
    // 24-28: SampleRate
    headerView.setUint32(24, AUDIO_CONTEXT.sampleRate, true);
    // 28-32: ByteRate
    headerView.setUint32(28, AUDIO_CONTEXT.sampleRate * 2, true);
    // 32-34: BlockAlign
    headerView.setUint16(32, 2, true);
    // 34-36: BitsPerSample
    headerView.setUint16(34, 16, true);
    // 36-40: Subchunk2ID
    setString(headerView, 36, 'data');
    // 40-44: Subchunk2Size
    headerView.setUint32(40, arrayByteLength * 2, true);
    // now attach data and convert to blob
    return new Blob([headerView, int16Array], { type: 'audio/wav' });
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
    private chunkDuration: number;
    private dbStartKey: number;
    private nSamples: number;
    private lastKey: number;
    private chunkStartTime: number;
    private startKey: number;
    private totalDuration: number;
    private oddKeyFileReader: FileReader;
    private evenKeyFileReader: FileReader;

    constructor(masterClock: MasterClock, idb: IdbAppData) {
        super(masterClock);
        console.log('constructor():WebAudioPlayerWav');
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
        this.totalDuration =
            this.nSamples / this.recordingInfo.sampleRate;
        this.duration = this.totalDuration;
        this.displayDuration = formatTime(this.duration, this.duration);
        this.chunkDuration =
            DB_CHUNK_LENGTH / this.recordingInfo.sampleRate;
        this.startKey = this.dbStartKey;
        this.lastKey =
            this.dbStartKey + Math.floor(this.nSamples / DB_CHUNK_LENGTH);
    }

    private getFileReader(key: number): FileReader {
        console.log('getFileReader(' + key + ') -> ' +
            (isOdd(key) ? 'ODD' : 'EVEN'));
        return isOdd(key) ? this.oddKeyFileReader : this.evenKeyFileReader;
    }

    private getOnEndedCB(key: number): () => void {
        key += 2;
        if (key > this.lastKey) {
            return () => {
                console.log('onEnded(' + key +
                    ') - reached last chunk - nextNode: ' +
                    this.sourceNode);
            };
        }
        else {
            console.log('getOnEndedCB(' + (key - 2) + '), scheduling key ' +
                key + ' to start at ' + this.getChunkScheduleTime(key));
            return () => {
                // this.startedAt + chunkStartTime + chunkDuration
                console.log('onEndedCB(' + (key - 2) + ')' +
                    ', sched key: ' + key + ', when: ' +
                    this.getChunkScheduleTime(key));
                this.scheduleChunk(key, this.getChunkScheduleTime(key))
                    .subscribe(
                    null,
                    (error) => {
                        throw Error('onEndedCB(): ' + error);
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
            console.log('getChunkScheduleTime(' + key + ') returned ' +
                (this.startedAt + deltaKey * this.chunkDuration));
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
                (wavArray: Int16Array) => {
                    console.log('got chunk ' + key + ' from db!');
                    fileReader.onerror = () => {
                        throw Error('FileReader error: ' + fileReader.error);
                    };
                    fileReader.onload = () => {
                        AUDIO_CONTEXT.decodeAudioData(
                            fileReader.result,
                            (audioBuffer: AudioBuffer) => {
                                console.log('decoded! duration: ' +
                                    audioBuffer.duration + ', key: ' + key);
                                // this.setAudioBuffer(audioBuffer);
                                // this.play(chunkStartTime);
                                this.schedulePlay(
                                    audioBuffer,
                                    when,
                                    startTime,
                                    this.getOnEndedCB(key)
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
                        int16ArrayToWavBlob(wavArray)
                    );
                }); // this.idb.readChunk(key).subscribe(

        });
        return obs;
    }

    /**
     * Seek playback to a specific time, retaining playing state (or not)
     * @returns {void}
     */
    // public timeSeek(time: number): void {
    //     console.log('skipToTime(' + time.toFixed(2) + ')');
    //     // this.stop();
    //     const
    //         relativeTime: number =
    //             time / this.totalDuration,
    //         absoluteSampleToSkipTo: number =
    //             Math.floor(relativeTime * this.recordingInfo.nSamples),
    //         relativeSampleToSkipTo: number =
    //             absoluteSampleToSkipTo % DB_CHUNK_LENGTH,
    //         startKey: number =
    //             this.recordingInfo.dbStartKey +
    //             Math.floor(absoluteSampleToSkipTo / DB_CHUNK_LENGTH),
    //         chunkRelativeTime: number =
    //             relativeSampleToSkipTo / DB_CHUNK_LENGTH;
    //     this.startKey = startKey;
    //     this.chunkStartTime = chunkRelativeTime * this.chunkDuration;
    //     console.log(
    //         'seekTime: ' + time + ', ' +
    //         'duration: ' + this.totalDuration + ', ' +
    //         'relativeTime: ' + relativeTime + ', ' +
    //         'absoluteSampleToSkipTo: ' + absoluteSampleToSkipTo + ', ' +
    //         'nSamples: ' + this.recordingInfo.nSamples + ', ' +
    //         'startKey: ' + startKey + ', ' +
    //         'lastKey: ' + this.lastKey);

    //     this.scheduleChunk(startKey, 0, this.chunkStartTime).subscribe(
    //         () => {
    //             if (startKey + 1 <= this.lastKey) {
    //                 this.scheduleChunk(
    //                     startKey + 1,
    //                     this.getChunkScheduleTime(startKey + 1)
    //                 ).subscribe(
    //                     null,
    //                     (error) => {
    //                         throw Error('timeSeek-2: ' + error);
    //                     });
    //             }
    //         },
    //         (error) => {
    //             throw Error('timeSeek-1: ' + error);
    //         }
    //     );
    // } // public timeSeek(time: number): void {

    private loadAndDecodeChunk(key: number): Observable<AudioBuffer> {
        let obs: Observable<AudioBuffer> = Observable.create((observer) => {
            const fileReader: FileReader = this.getFileReader(key);
            this.idb.readChunk(key).subscribe(
                (wavArray: Int16Array) => {
                    console.log('idb.readChunk(): got chunk ' + key);
                    fileReader.onerror = () => {
                        observer.error('FileReader error: ' +
                            fileReader.error);
                    };
                    fileReader.onload = () => {
                        AUDIO_CONTEXT.decodeAudioData(
                            fileReader.result,
                            (audioBuffer: AudioBuffer) => {
                                observer.next(audioBuffer);
                                observer.complete();
                            });
                    };
                    fileReader.readAsArrayBuffer(
                        int16ArrayToWavBlob(wavArray)
                    );
                });
        });
        return obs;
    }

    public relativeTimeSeek(relativeTime: number): void {
        console.log('relativeTimeSeek(' + relativeTime.toFixed(2) + ')');
        this.stop();
        const
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
        console.log(
            'seek relativeTime: ' + relativeTime + ', ' +
            'duration: ' + this.totalDuration + ', ' +
            'relativeTime: ' + relativeTime + ', ' +
            'absoluteSampleToSkipTo: ' + absoluteSampleToSkipTo + ', ' +
            'nSamples: ' + this.recordingInfo.nSamples + ', ' +
            'startKey: ' + startKey + ', ' +
            'lastKey: ' + this.lastKey);
        this.loadAndDecodeChunk(startKey).subscribe(
            (audioBuffer1: AudioBuffer) => {
                if (this.startKey < this.lastKey) {
                    this.loadAndDecodeChunk(startKey + 1).subscribe(
                        (audioBuffer2: AudioBuffer) => {
                            this.schedulePlay(
                                audioBuffer1,
                                0,
                                this.chunkStartTime
                            );
                            this.schedulePlay(
                                audioBuffer2,
                                this.startedAt + this.chunkDuration
                            );
                        });
                }
            }
        );
    } // public timeSeek(time: number): void {


    public togglePlayPause(): void {
        if (!this.isPlaying) {
            this.relativeTimeSeek(
                (this.pausedAt - this.startedAt) / this.duration);
        }
        else {
            this.pause();
            console.log('paused at: ' + this.pausedAt);
        }
    }
}

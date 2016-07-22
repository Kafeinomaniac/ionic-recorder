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
    formatTime,
    has
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
    private onEndeds: { [id: string]: number };
    constructor(masterClock: MasterClock, idb: IdbAppData) {
        super(masterClock);
        console.log('constructor():WebAudioPlayerWav');
        this.idb = idb;
        if (!this.idb) {
            throw Error('WebAudioPlayerWav:constructor(): db unavailable.');
        }
        this.oddKeyFileReader = new FileReader();
        this.evenKeyFileReader = new FileReader();
        this.onEndeds = {};
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
        const nextKey: number = key + 2;

        console.log('getOnEndedCB(' + key + '), scheduling key ' +
            nextKey);

        if (nextKey > this.lastKey) {
            return () => {
                console.log('onEnded(' + nextKey +
                    ') - reached last chunk - nextNode: ' +
                    this.sourceNode);
            };
        }
        else {
            return () => {
                const dictKey: string = nextKey.toString(),
                    when: number = this.getChunkWhenTime(nextKey);

                if (has(this.onEndeds, dictKey)) {
                    // prevents calling onEnded() twice in succession as
                    // happens in chrome/chromium when you don't start at 0
                    return;
                }
                else {
                    this.onEndeds[dictKey] = when;
                }

                console.log('onEndedCB(' + key + '), time = ' +
                    this.getTime() +
                    ', sched key: ' + nextKey + ', when: ' + when.toFixed(2));

                this.loadAndDecodeChunk(nextKey).subscribe(
                    (audioBuffer: AudioBuffer) => {
                        this.schedulePlay(
                            audioBuffer,
                            when,
                            0,
                            this.getOnEndedCB(nextKey)
                        );
                    });

            };
        }
    }

    private getChunkWhenTime(key: number): number {
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
            console.log('getChunkWhenTime(' + key + ') returned ' +
                (this.startedAt + deltaKey * this.chunkDuration));
            return this.startedAt + deltaKey * this.chunkDuration;
        }
    }

    private loadAndDecodeChunk(key: number): Observable<AudioBuffer> {
        console.log('loadAndDecodeChunk(' + key + ')');
        // if (key === 3) {
        //     debugger;
        // }

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
                    console.log('READING FILE!');
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
                                this.chunkStartTime,
                                this.getOnEndedCB(this.startKey)
                            );
                            this.schedulePlay(
                                audioBuffer2,
                                this.startedAt + this.chunkDuration,
                                0,
                                this.getOnEndedCB(this.startKey + 1)
                            );
                        });
                }
            }
        );
    } // public timeSeek(time: number): void {

    public stop(): void {
        super.stop();
        this.onEndeds = {};
    }

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

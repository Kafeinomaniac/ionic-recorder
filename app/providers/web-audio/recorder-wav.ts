// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

import {
    Injectable
} from '@angular/core';

import {
    IdbAppData
} from '../idb-app-data/idb-app-data';

import {
    RecordingInfo
} from './common';

import {
    DoubleBufferSetter
} from '../../services/utils/double-buffer';

import {
    WebAudioRecorder
} from './recorder';

// make this a multiple of PROCESSING_BUFFER_LENGTH
// 256 x PROCESSING_BUFFER_LENGTH = 65536 and since it's WAV,
// it will be 2 bytes each
export const DB_CHUNK_LENGTH: number = 65536;

// pre-allocate the double chunk buffers used for saving to DB
const DB_CHUNK1: Uint16Array = new Uint16Array(DB_CHUNK_LENGTH);
const DB_CHUNK2: Uint16Array = new Uint16Array(DB_CHUNK_LENGTH);

/**
 * @name WebAudioRecorder
 * @description
 * Audio Recorder functions based on WebAudio.
 */
@Injectable()
export class WebAudioRecorderWav extends WebAudioRecorder {
    private idb: IdbAppData;
    private dbStartKey: number;
    private setter: DoubleBufferSetter;

    // this is how we signal
    constructor(idb: IdbAppData) {
        super();

        console.log('constructor():WebAudioRecorderWav');

        this.idb = idb;
        this.dbStartKey = -1;

        if (!this.idb) {
            throw Error('WebAudioRecorderWav:constructor(): no db');
        }

        this.setter = new DoubleBufferSetter(DB_CHUNK1, DB_CHUNK2, () => {
            this.idb.createChunk(this.setter.activeBuffer).subscribe(
                (key: number) => {
                    if (this.dbStartKey < 0) {
                        // first key encountered
                        console.log('setting dbStartKey to key');
                        this.dbStartKey = key;
                    }
                    // increment the buffers-saved counter
                    // this.dbKeys.push(key);
                    // console.log('saved chunk ' + this.dbKeys.length);
                    console.log('saved chunk ' + key);
                });
        });

        this.valueCB = (pcm: number) => {
            this.setter.setNext(pcm * 0x7FFF);
            return 1;
        };
    }

    /**
     * Stop recording
     * @returns {void}
     */
    public stop(): Observable<RecordingInfo> {
        let obs: Observable<RecordingInfo> = Observable.create((observer) => {
            this.stop().subscribe(
                (recordingInfo: RecordingInfo) => {
                    recordingInfo.dbStartKey = this.dbStartKey;
                    if (this.setter.bufferIndex === 0) {
                        // no leftovers: rare we get here due to no leftovers
                        // but we also reach here during the constructor call
                        observer.next(recordingInfo);
                        observer.complete();
                    }
                    // save leftover partial buffer
                    this.idb.createChunk(this.setter.activeBuffer.subarray(
                        0,
                        this.setter.bufferIndex)
                    ).subscribe(
                        (key: number) => {
                            console.log('saved final chunk ' + key);
                            observer.next(recordingInfo);
                            observer.complete();
                        },
                        (error) => {
                            throw Error('WebAudioRecorderWav:stop() ' + error);
                        });
                },
                (error) => {
                    throw Error('WebAudioRecorderWav:stop() ' + error);
                });
        });
        return obs;
    }
}

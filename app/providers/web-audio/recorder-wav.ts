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

import {
    MasterClock
} from '../master-clock/master-clock';

import {
    MAX,
    MIN
} from '../../services/utils/utils';

// make this a multiple of PROCESSING_BUFFER_LENGTH
export const DB_CHUNK_LENGTH: number = 131072;

// pre-allocate the double chunk buffers used for saving to DB
const DB_CHUNK1: Int16Array = new Int16Array(DB_CHUNK_LENGTH);
const DB_CHUNK2: Int16Array = new Int16Array(DB_CHUNK_LENGTH);

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
    constructor(masterClock: MasterClock, idb: IdbAppData) {
        super(masterClock);

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
                        console.log('setting dbStartKey to key: ' + key);
                        this.dbStartKey = key;
                    }
                    // increment the buffers-saved counter
                    // this.dbKeys.push(key);
                    // console.log('saved chunk ' + this.dbKeys.length);
                    console.log('saved chunk ' + key);
                });
        });

        // see:
        // https://github.com/dorontal/Recorderjs/blob/master/dist/recorder.js
        this.valueCB = (rawFloat: number) => {
            const clipped: number = MAX(-1, MIN(1, rawFloat));
            this.setter.setNext(
                clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff);
        };
    }

    /**
     * Stop recording
     * @returns {void}
     */
    public stop(): Observable<RecordingInfo> {
        console.log('WebAudioRecorderWav:stop()');
        let obs: Observable<RecordingInfo> = Observable.create((observer) => {
            super.stop().subscribe(
                (recordingInfo: RecordingInfo) => {
                    recordingInfo.encoding = 'audio/wav';

                    recordingInfo.dbStartKey = this.dbStartKey;
                    // we need to reset the db start key so that the next time
                    // we record we know that we need to set it again to the 
                    // next start key
                    this.dbStartKey = -1;

                    if (this.setter.bufferIndex === 0) {
                        // no leftovers: rare we get here due to no leftovers
                        // but we also reach here during the constructor call

                        if (this.dbStartKey < 0) {
                            // NB: It is not possible that we have not yet set
                            // this.dbStartKey.
                            throw Error('something very wrong happened');
                        }

                        observer.next(recordingInfo);
                        observer.complete();
                    }
                    else {
                        // save leftover partial buffer
                        this.idb.createChunk(this.setter.activeBuffer.subarray(
                            0,
                            this.setter.bufferIndex)
                        ).subscribe(
                            (key: number) => {
                                console.log('saved final chunk ' + key);
                                if (recordingInfo.dbStartKey < 0) {
                                    recordingInfo.dbStartKey = key;
                                    console.log('saved final chunk / start ' +
                                        recordingInfo.dbStartKey);
                                }
                                observer.next(recordingInfo);
                                observer.complete();
                            },
                            (error) => {
                                throw Error('WebAudioRecorderWav:stop() ' +
                                    error);
                            });

                    }
                },
                (error) => {
                    throw Error('WebAudioRecorderWav:stop() ' + error);
                });
        });
        return obs;
    }
}

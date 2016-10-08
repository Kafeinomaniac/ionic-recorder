// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    WAV_MIME_TYPE,
    RecordingInfo
} from './common';

import {
    DB_CHUNK_LENGTH
} from './recorder-wav';

import {
    IdbAppData
} from '../idb-app-data/idb-app-data';

import {
    makeWavBlobHeaderView,
    downloadBlob
} from '../../services/utils/wav';

@Injectable()
export class WebAudioSaverWav {
    private idb: IdbAppData;
    private blob: Blob;
    private keyOffset: number;
    private lastKeyOffset: number;

    constructor(idb: IdbAppData) {
        this.idb = idb;
        this.blob = null;
        this.keyOffset = 0;
        this.lastKeyOffset = 0;
    }

    public save(recordingInfo: RecordingInfo, fileName: string): void {
        console.log('WebAudioSaverWav:save(' +
            recordingInfo.dbStartKey + this.keyOffset + ')');
        this.idb.readChunk(
            recordingInfo.dbStartKey +
            this.keyOffset
        ).subscribe(
            (wavArray: Int16Array) => {
                if (this.blob) {
                    // blob already exists, append to it
                    console.log('START size: ' + this.blob.size);
                    // this.blob = new Blob(
                    //     [
                    //         this.blob,
                    //         int16ArrayToWavBlob(wavArray)
                    //     ],
                    //     { type: WAV_MIME_TYPE }
                    // );
                    this.blob = new Blob(
                        [ this.blob, wavArray],
                        { type: WAV_MIME_TYPE }
                    );
                    console.log('END size: ' + this.blob.size);
                }
                else {
                    // no blob initialized yet, create it and init members
                    this.keyOffset = 0;
                    this.lastKeyOffset =
                        Math.floor(recordingInfo.nSamples / DB_CHUNK_LENGTH);

                    const headerView: DataView =
                        makeWavBlobHeaderView(
                            recordingInfo.nSamples,
                            recordingInfo.sampleRate
                        );
                    // this.blob = new Blob(
                    //     [int16ArrayToWavBlob(wavArray)],
                    //     { type: WAV_MIME_TYPE }
                    // );
                    this.blob = new Blob(
                        [ headerView, wavArray ],
                        { type: WAV_MIME_TYPE }
                    );
                }
                if (this.keyOffset === this.lastKeyOffset) {
                    // base case: we're at the end of the recursion
                    console.log('saving done!');
                    console.dir(this.blob);
                    // debugger;
                    downloadBlob(this.blob, fileName);
                    this.blob = null;
                }
                else {
                    // not done, recurse
                    this.keyOffset++;
                    this.save(recordingInfo, fileName);
                }
            }
            );
    }
}

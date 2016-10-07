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
    int16ArrayToWavBlob
} from './player-wav';

// save data into a local file
function saveBlob(blob: Blob) {
    'use strict';
    const url: string = window.URL.createObjectURL(blob);
    let anchorElement: HTMLAnchorElement = document.createElement('a');
    anchorElement.style.display = 'none';
    anchorElement.href = url;
    anchorElement.setAttribute('download', 'attempt0.wav');
    document.body.appendChild(anchorElement);
    anchorElement.click();
    setTimeout(() => {
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(url);
    }, 100);
    console.log('saveBlob(): finished!');
}

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

    public save(recordingInfo: RecordingInfo): void {
        console.log('WebAudioSaverWav:save(' +
            recordingInfo.dbStartKey + this.keyOffset + ')');
        this.idb.readChunk(
            recordingInfo.dbStartKey +
            this.keyOffset
        ).subscribe(
            (wavArray: Int16Array) => {
                if (this.blob) {
                    // blob already exists, append to it
                    this.blob = new Blob(
                        [
                            this.blob,
                            int16ArrayToWavBlob(wavArray)
                        ],
                        { type: WAV_MIME_TYPE }
                    );
                }
                else {
                    // no blob initialized yet, create it
                    this.blob = new Blob(
                        [int16ArrayToWavBlob(wavArray)],
                        { type: WAV_MIME_TYPE }
                    );
                    this.keyOffset = 0;
                    this.lastKeyOffset =
                        Math.floor(recordingInfo.nSamples / DB_CHUNK_LENGTH);
                }
                if (this.keyOffset === this.lastKeyOffset) {
                    // base case: we're at the end of the recursion
                    console.log('saving done!');
                    console.dir(this.blob);
                    saveBlob(this.blob);
                    this.blob = null;
                }
                else {
                    // not done, recurse
                    this.keyOffset++;
                    this.save(recordingInfo);
                }
            }
            );
    }

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

function makeWavBlobHeaderView(
    nSamples: number,
    sampleRate: number
): DataView {
    'use strict';
    const arrayByteLength: number = nSamples * 2,
        headerView: DataView = new DataView(new ArrayBuffer(44)),
        writeAscii:
            (dataView: DataView, offset: number, text: string) => void =
            (dataView: DataView, offset: number, text: string) => {
                const len: number = text.length;
                for (let i: number = 0; i < len; i++) {
                    dataView.setUint8(offset + i, text.charCodeAt(i));
                }
            };
    //
    // NB: this is single-channel (mono)
    //

    //   0-4: ChunkId
    writeAscii(headerView, 0, 'RIFF');
    //   4-8: ChunkSize
    headerView.setUint32(4, 36 + arrayByteLength, true);
    //  8-12: Format
    writeAscii(headerView, 8, 'WAVE');
    // 12-16: Subchunk1ID
    writeAscii(headerView, 12, 'fmt ');
    // 16-20: Subchunk1Size
    headerView.setUint32(16, 16, true);
    // 20-22: AudioFormat
    headerView.setUint16(20, 1, true);
    // 22-24: NumChannels
    headerView.setUint16(22, 1, true);
    // 24-28: SampleRate
    headerView.setUint32(24, sampleRate, true);
    // 28-32: ByteRate
    headerView.setUint32(28, sampleRate * 2, true);
    // 32-34: BlockAlign
    headerView.setUint16(32, 2, true);
    // 34-36: BitsPerSample
    headerView.setUint16(34, 16, true);
    // 36-40: Subchunk2ID
    writeAscii(headerView, 36, 'data');
    // 40-44: Subchunk2Size
    headerView.setUint32(40, arrayByteLength, true);

    return headerView;
}

// save data into a local file
function downloadBlob(blob: Blob, name: string): void {
    'use strict';
    const url: string = window.URL.createObjectURL(blob);
    let anchorElement: HTMLAnchorElement = document.createElement('a');
    anchorElement.style.display = 'none';
    anchorElement.href = url;
    anchorElement.setAttribute('download', name);
    document.body.appendChild(anchorElement);
    anchorElement.click();
    setTimeout(
        () => {
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(url);
        },
        100);
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

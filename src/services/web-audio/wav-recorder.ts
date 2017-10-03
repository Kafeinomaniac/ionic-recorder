// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { DoubleBufferSetter } from '../../models/utils/double-buffer';
import { formatUnixTimestamp } from '../../models/utils/utils';
import { WebAudioRecorder } from './recorder';
import { MasterClock } from '../master-clock/master-clock';
import { MAX, MIN } from '../../models/utils/utils';
import { AppFilesystem } from '../../services';

// make this a multiple of PROCESSING_BUFFER_LENGTH (from record.ts)
export const WAV_CHUNK_LENGTH: number = 131072;

// pre-allocate the double chunk buffers used for saving to DB
const WAV_CHUNK1: Int16Array = new Int16Array(WAV_CHUNK_LENGTH);
const WAV_CHUNK2: Int16Array = new Int16Array(WAV_CHUNK_LENGTH);

/**
 * Audio Record functions based on WebAudio.
 * @class WebAudioRecorder
 */
@Injectable()
export class WavRecorder extends WebAudioRecorder {
    private setter: DoubleBufferSetter;
    private appFilesystem: AppFilesystem;
    private nChunksSaved: number;
    private filePath: string;

    // this is how we signal
    constructor(masterClock: MasterClock, appFilesystem: AppFilesystem) {
        super(masterClock);

        console.log('constructor()');

        this.appFilesystem = appFilesystem;
        this.setter = new DoubleBufferSetter(WAV_CHUNK1, WAV_CHUNK2, () => {
            this.saveWavFileChunk(this.setter.activeBuffer).subscribe(
                null,
                (err: any) => {
                    alert('Error in RecordWav.setter(): ' + err);
                }
            );
        });
        this.nChunksSaved = 0;
    }

    // see: https://github.com/dorontal/Recordjs/blob/master/dist/record.js
    protected valueCB(pcm: number): void {
        // console.log('valueCB()');
        const clipped: number = MAX(-1, MIN(1, pcm));
        this.setter.setNext(
            clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff);
    }

    /**
     *
     */
    public getFilePath(): string {
        return this.filePath;
    }

    /**
     * Save the next wav file chunk
     * @returns {Observable<void>}
     */
    private saveWavFileChunk(arr: Int16Array): Observable<void> {
        console.log('saveWavFileChunk(arr.size=' + arr.length +')');
        let obs: Observable<void> = Observable.create((observer) => {
            if (this.nChunksSaved === 0) {
                this.appFilesystem.createWavFile(
                    this.filePath,
                    arr
                ).subscribe(
                    () => {
                        this.nChunksSaved++;
                        observer.next();
                        observer.complete();
                    },
                    (err1: any) => {
                        observer.error(err1);
                    }
                );
            }
            else {
                this.appFilesystem.appendToWavFile(
                    this.filePath,
                    arr
                ).subscribe(
                    () => {
                        this.nChunksSaved++;
                        observer.next();
                        observer.complete();
                    },
                    (err1: any) => {
                        observer.error(err1);
                    }
                );
            }
        });
        return obs;
    }

    /**
     * Start recording
     */
    public start(): void {
        super.start();
        const dateCreated: number = Date.now(),
              displayDateCreated: string = formatUnixTimestamp(dateCreated),
              filePath: string = '/Unfiled/' + displayDateCreated;
        console.log('start() - ' + filePath);
        this.filePath = filePath;
    }

    /**
     * Stop recording and save the last chunk.
     * Precondition: called start() already
     * @returns {Observable<void>}
     */
    public stop(): Observable<void> {
        console.log('WavRecorder:stop() @ ' + this.setter.bufferIndex);
        this.reset();
        let obs: Observable<void> = Observable.create((observer) => {
            this.saveWavFileChunk(
                this.setter.activeBuffer.subarray(0, this.setter.bufferIndex)
            ).subscribe(
                () => {
                    this.nChunksSaved = 0;
                    observer.next();
                    observer.complete();
                },
                (err: any) => {
                    observer.error(err);
                }
            );
        });

        return obs;
    }
}

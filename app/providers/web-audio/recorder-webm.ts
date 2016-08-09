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
    AUDIO_CONTEXT,
    RecordingInfo,
    mediaRecordedTypesSupported
} from './common';

import {
    WebAudioRecorder
} from './recorder';

import {
    MasterClock
} from '../master-clock/master-clock';

const WEBM_MIME_TYPE: string = 'audio/webm';

/**
 * @name WebAudioRecorder
 * @description
 * Audio Recorder functions based on WebAudio.
 */
@Injectable()
export class WebAudioRecorderWebm extends WebAudioRecorder {
    private idb: IdbAppData;
    private dbKey: number;
    private mediaRecorder: MediaRecorder;
    private startedAt: number;
    private pausedAt: number;
    private blobChunks: Blob[];
    private isReady: boolean;

    // this is how we signal
    constructor(masterClock: MasterClock, idb: IdbAppData) {
        super(masterClock);
        console.log('constructor():WebAudioRecorderWav');

        this.idb = idb;
        this.dbKey = -1;
        this.startedAt = 0;
        this.pausedAt = 0;
        this.blobChunks = [];
        this.isReady = false;

        this.valueCB = null;

        if (!this.idb) {
            throw Error('WebAudioRecorderWav:constructor(): no db');
        }
        this.initMediaRecorder();
    }
    /**
     * Create new MediaRecorder and set up its callbacks
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    private initMediaRecorder(): void {

        if (!MediaRecorder) {
            const msg: string = [
                'Your browser does not support the MediaRecorder object ',
                'used for recording audio, please upgrade to one of the ',
                'browsers supported by this app. Until you do so ',
                'you will not be able to use the recording part of ',
                'this app, but you will be able to play back audio.'
            ].join('');
            alert('MediaRecorder not available! \n' + msg);
        }

        // TODO: verify this.mediaStream here

        const typesSupported: string[] = mediaRecordedTypesSupported(),
            iWebm: number = typesSupported.indexOf(WEBM_MIME_TYPE);

        if (iWebm === -1) {
            throw Error('MediaRecorder/webm not available');
        }

        this.mediaRecorder = new MediaRecorder(this.mediaStream, {
            mimeType: WEBM_MIME_TYPE
        });
        console.log('MediaRecorder = ' + this.mediaRecorder);

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            // console.log('ondataavailable()');
            this.blobChunks.push(event.data);
        };

        // finally let users of this class know it's ready
        this.isReady = true;
        console.log('WebAudioRecorder: READY');
    }

    /**
     * Start recording
     * @returns {void}
     */
    public start(): void {
        console.log('record:start');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (1)');
        }
        // TODO: play around with putting the next line
        // either immediately below or immediately above the
        // start() call
        this.mediaRecorder.start();
        this.startedAt = AUDIO_CONTEXT.currentTime;
        this.pausedAt = 0;
    }

    /**
     * Pause recording
     * @returns {void}
     */
    public pause(): void {
        console.log('record:pause');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (2)');
        }
        this.mediaRecorder.pause();
        this.pausedAt = AUDIO_CONTEXT.currentTime - this.startedAt;
    }

    /**
     * Resume recording
     * @returns {void}
     */
    public resume(): void {
        console.log('record:resume');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (3)');
        }
        this.mediaRecorder.resume();
        this.pausedAt = 0;
    }

    /**
     * Stop recording
     * @returns {void}
     */
    public stop(): Observable<RecordingInfo> {
        console.log('WebAudioRecorderWav:stop()');
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (4)');
        }
        let obs: Observable<RecordingInfo> = Observable.create((observer) => {
            this.mediaRecorder.onstop = (event: Event) => {
                console.log('mediaRecorder.onStop() Got ' +
                    this.blobChunks.length + ' chunks');

                const blob: Blob = new Blob(this.blobChunks, {
                    type: WEBM_MIME_TYPE
                });

                this.blobChunks = [];

                super.stop().subscribe(
                    (recordingInfo: RecordingInfo) => {
                        // TODO: save to db the blob and set key in
                        // recordingInfo, which you next()
                        // TODO: fix nSamples and duration acc to 
                        // webm file blob properties
                        this.startedAt = 0;
                        this.pausedAt = 0;

                        recordingInfo.encoding = WEBM_MIME_TYPE;
                        recordingInfo.dbStartKey = this.dbKey;
                        recordingInfo.size = blob.size;

                        observer.next(recordingInfo);
                        observer.complete();
                    },
                    (error) => {
                        observer.error('WebAudioRecorderWav:stop() ' + error);
                    });
            };
        });
        return obs;
    }
}

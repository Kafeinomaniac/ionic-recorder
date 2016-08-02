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
    WebAudioRecorder
} from './recorder';

import {
    MasterClock
} from '../master-clock/master-clock';

/**
 * @name WebAudioRecorder
 * @description
 * Audio Recorder functions based on WebAudio.
 */
@Injectable()
export class WebAudioRecorderWebm extends WebAudioRecorder {
    private idb: IdbAppData;
    private dbKey: number;

    // this is how we signal
    constructor(masterClock: MasterClock, idb: IdbAppData) {
        super(masterClock);

        console.log('constructor():WebAudioRecorderWav');

        this.idb = idb;
        this.dbKey = -1;

        if (!this.idb) {
            throw Error('WebAudioRecorderWav:constructor(): no db');
        }

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
                    recordingInfo.encoding = 'audio/webm';
                    // TODO: save to db the blob and set key in
                    // recordingInfo, which you next()
                },
                (error) => {
                    throw Error('WebAudioRecorderWav:stop() ' + error);
                });
        });
        return obs;
    }
}

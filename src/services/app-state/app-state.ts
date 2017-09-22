// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { RecordingInfo } from '../web-audio/common';

export interface GainState {
    factor: number;
    maxFactor: number;
}

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    lastRecordingInfo: RecordingInfo;
    gain: GainState;
}

const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 2,
    lastRecordingInfo: null,
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @class AppState
 */
@Injectable()
export class AppState {
    private storage: Storage;

    /**
     * @constructor
     */
    constructor(storage: Storage) {
        console.log('constructor():AppState');
        this.storage = storage;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (key in DEFAULT_STATE) {
                // TODO: if key is not stored yet then we want to store
                // it in storage, as taken from DEFAULT_STATE
                this.storage.get(key).then((value: any) => {
                    // if (value === null) {
                    if ((typeof value === 'undefined') || value === null) {
                        console.log('get(' + key + ') VALUE NOT IN STORAGE!');
                        console.dir(value);
                        value = DEFAULT_STATE[key];
                        this.set(key, value);
                    }
                    else {
                        console.log('get(' + key +
                                    ') VALUE IN STORAGE=' + value);
                    }
                    resolve(value);
                }); // this.storage.get(key).then((value: any) => {
            } // if (key in DEFAULT_STATE) {
        });
    }

    /**
     * Sets a state property (in DB if necessary)
     */
    public set(key: string, value: any): void {
        if (key in DEFAULT_STATE) {
            console.log('=====> APP STATE UPDATE <======= key:' +
                        key + ', value:' + value);
            this.storage.set(key, value);
        }
        else {
            throw Error('Wrong key used in set()');
        }
    }
}

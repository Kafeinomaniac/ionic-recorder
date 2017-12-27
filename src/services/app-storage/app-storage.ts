// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

export interface GainState {
    factor: number;
    maxFactor: number;
}

interface State {
    lastTabIndex: number;
    gain: GainState;
}

const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @class AppStorage
 */
@Injectable()
export class AppStorage {
    private storage: Storage;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor()');
        // this.storage = storage;
        this.storage = new Storage({});
    }

    /**
     * Gets a state property (from DB if necessary)
     * @return {Promise<any>} Promise of property-value obtained
     */
    public get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (key in DEFAULT_STATE) {
                // TODO: if key is not stored yet then we want to store
                // it in storage, as taken from DEFAULT_STATE
                this.storage.get(key).then((value: any) => {
                    if (value) {
                        console.log('get(' + key + '): ' + value);
                    }
                    else {
                        // (typeof value === 'undefined') || (value === null)
                        console.log('get(' + key + ') NOT FOUND!');
                        value = DEFAULT_STATE[key];
                        this.set(key, value);
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

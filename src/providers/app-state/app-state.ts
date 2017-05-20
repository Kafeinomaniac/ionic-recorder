// Copyright (c) 2017 Tracktunes Inc

import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { KeyDict } from '../../models/idb/idb-fs';

export interface GainState {
    factor: number;
    maxFactor: number;
}

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    selectedNodes: KeyDict;
    gain: GainState;
}

const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 2,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @name AppState
 * @description
 */
@Injectable()
export class AppState {
    public isReady: boolean;
    private cachedState: Object;
    private storage: Storage;

    /**
     * @constructor
     */
    constructor(storage: Storage) {
        console.log('constructor():AppState');
        this.cachedState = DEFAULT_STATE;
        this.storage = storage;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(key: string): Promise<any> {
        // TODO: verify key
        return this.storage.get(key);
    }

    /**
     * Sets a state property (in DB if necessary)
     * @returns {Observable<boolean>} Emits after either we establish that
     * there is no need for an update (emits false in that case) or after we
     * have made the update in the DB (emits true in that case)
     */
    public updateProperty(key: string, value: any): Promise<any> {
        // TODO: verify key
        return this.storage.set(key, value);
    }
}

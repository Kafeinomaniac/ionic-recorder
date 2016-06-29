// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

import {
    IdbDict
} from '../idb/idb-dict';

const DB_NAME: string = 'appStateIdbDict';
const DB_VERSION: number = 1;

export interface GainState {
    factor: number;
    maxFactor: number;
}

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    unfiledFolderKey: number;
    selectedNodes: { [id: string]: boolean };
    gain: GainState;
}

const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 0,
    unfiledFolderKey: 2,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @name AppState
 * @description
 */
@Injectable()
export class AppState extends IdbDict {
    private cachedState: Object = DEFAULT_STATE;

    /**
     * @constructor
     */
    constructor(dbName: string = DB_NAME, dbVersion: number = DB_VERSION) {
        super(dbName, dbVersion);
        console.log('constructor():AppState');
        this.loadFromDb();
    }

    private loadFromDb(): void {
        for (let key in DEFAULT_STATE) {
            let value: any = DEFAULT_STATE[key];
            this.getOrAddValue(key, value).subscribe(
                (dbValue: any) => {
                    if (dbValue !== value) {
                        console.log('loadFromDb():dbValue: ' + dbValue);
                        this.cachedState[key] = dbValue;
                    }
                },
                (error) => {
                    throw Error('loadFromDb():getOrAddValue(): ' + error);
                }
            );
        }
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(key: string): any {
        return this.cachedState[key];
    }

    /**
     * Sets a state property (in DB if necessary)
     * @returns {Observable<boolean>} Emits after either we establish that
     * there is no need for an update (emits false in that case) or after we
     * have made the update in the DB (emits true in that case)
     */
    public updateProperty(key: string, value: any): void {
        if (this.cachedState[key] === value) {
            return;
        }
        else {
            this.cachedState[key] = value;
            this.updateValue(key, value).subscribe(
                null,
                (error) => {
                    throw Error('updateProperty(): ' + error);
                });
        }
    }
}

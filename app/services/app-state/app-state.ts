// Copyright (c) 2016 Tracktunes Inc

import {
    Injectable
} from '@angular/core';

// import {
//     Observable
// } from 'rxjs/Rx';

import {
    IdbDict
} from '../idb/idb-dict';

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
    unfiledFolderKey: 0,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};

/**
 * @name AppState
 * @description
 */
@Injectable()
export class AppState {
    private idbDict: IdbDict;
    private cachedState: Object = DEFAULT_STATE;

    /**
     * @constructor
     */
    constructor(idbDict: IdbDict) {
        console.log('constructor():AppState');
        this.idbDict = idbDict;
        this.loadFromDb();
    }

    private loadFromDb(): void {
        for (let key in DEFAULT_STATE) {
            let value: any = DEFAULT_STATE[key];
            this.idbDict.getOrAddValue(key, value).subscribe(
                (dbValue: any) => {
                    if (dbValue !== value) {
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
            this.idbDict.updateValue(key, value).subscribe(
                null,
                (error) => {
                    throw Error('updateProperty(): ' + error);
                });
        }
    }
}

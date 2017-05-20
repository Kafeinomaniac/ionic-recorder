// Copyright (c) 2017 Tracktunes Inc

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { KeyDict } from '../../models/idb/idb-fs';

export const DB_NAME: string = 'AppState';
const DB_VERSION: number = 1;
const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 2,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};
const WAIT_MSEC: number = 50;

interface State {
    lastTabIndex: number;
    lastViewedFolderKey: number;
    selectedNodes: KeyDict;
    gain: GainState;
}

export interface GainState {
    factor: number;
    maxFactor: number;
}

/**
 * @name AppState
 * @description
 */
@Injectable()
export class AppState {
    public isReady: boolean;
    private cachedState: Object;

    /**
     * @constructor
     */
    constructor() {
        console.log('constructor():AppState');
        this.cachedState = DEFAULT_STATE;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(key: string): Observable<any> {
        // TODO: check that key is allowed and if not throw exception
        // return this.cachedState[key];
        // NOTE:this loop should only repeat a handful of times or so
        let source: Observable<any> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    observer.next(this.cachedState[key]);
                    observer.complete();
                },
                (error) => {
                    observer.error('getProperty(): waitForAppState(): ' +
                        error);
                });
        });
        return source;
    }

    /**
     * Sets a state property (in DB if necessary)
     * @returns {Observable<boolean>} Emits after either we establish that
     * there is no need for an update (emits false in that case) or after we
     * have made the update in the DB (emits true in that case)
     */
    public updateProperty(key: string, value: any): Observable<boolean> {
        let source: Observable<boolean> = Observable.create((observer) => {
            this.waitForAppState().subscribe(
                () => {
                    if (this.cachedState[key] === value) {
                        observer.next(false);
                        observer.complete();
                    }
                    else {
                        this.cachedState[key] = value;
                        this.updateValue(key, value).subscribe(
                            () => {
                                observer.next(true);
                                observer.complete();
                            },
                            (error) => {
                                observer.error('updateProperty():' +
                                    'waitForAppState():updateValue()' + error);
                            });
                    }
                },
                (error) => {
                    observer.error('updateProperty():waitForAppState(): ' +
                        error);
                });
        });
        return source;
    }

}

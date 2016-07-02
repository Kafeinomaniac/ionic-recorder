// Copyright (c) 2016 Tracktunes Inc

import {
    Observable
} from 'rxjs/Rx';

import {
    Injectable
} from '@angular/core';

import {
    IdbDict
} from '../../services/idb/idb-dict';

import {
    KeyDict
} from '../../services/idb/idb-fs';

const WAIT_MSEC: number = 50;
const DB_NAME: string = 'IdbAppState';
const DB_VERSION: number = 1;
const DEFAULT_STATE: State = {
    lastTabIndex: 1,
    lastViewedFolderKey: 2,
    selectedNodes: {},
    gain: { factor: 1.0, maxFactor: 2.0 }
};

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
 * @name IdbAppState
 * @description
 */
@Injectable()
export class IdbAppState extends IdbDict {
    public isReady: boolean;
    private cachedState: Object = DEFAULT_STATE;

    /**
     * @constructor
     */
    constructor() {
        super(DB_NAME, DB_VERSION);
        console.log('constructor():IdbAppState');
        this.isReady = false;
        this.loadFromDb().subscribe(
            () => {
                this.isReady = true;
            }
        );
    }

    /**
     * Wait indefinitely until AppState is ready for use
     * @returns {Observable<void>} Observable that emits when AppState
     * is ready for use (has been initialized from db)
     */
    private waitForAppState(): Observable<IDBDatabase> {
        // NOTE:this loop should only repeat a handful of times or so
        let source: Observable<IDBDatabase> = Observable.create((observer) => {
            let repeat: () => void = () => {
                if (this.isReady) {
                    observer.next();
                    observer.complete();
                }
                else {
                    setTimeout(repeat, WAIT_MSEC);
                }
            };
            repeat();
        });
        return source;
    }

    /**
     * Gets a state property (from DB if necessary)
     * @returns {Observable<any>} Observable of value of property obtained
     */
    public getProperty(key: string): Observable<any> {
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
                        observer.continue();
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
                                    'waitForAppState()+updateValue()' + error);
                            });
                    }
                },
                (error) => {
                    observer.error('updateProperty(): waitForAppState(): ' +
                        error);
                });
        });
        return source;
    }

    /**
     * load all stat variables from db into memory
     * @returns {Observable<void>} Emits after memory is loaded from db
     */
    private loadFromDb(): Observable<void> {
        let source: Observable<void> = Observable.create((observer) => {
            this.waitForDB().subscribe(
                () => {
                    let keys: string[] = Object.keys(DEFAULT_STATE),
                        key: string,
                        value: any,
                        nKeys: number = keys.length,
                        i: number,
                        nLoaded: number = 0;
                    for (i = 0; i < nKeys; i++) {
                        key = keys[i];
                        value = DEFAULT_STATE[key];
                        this.cachedState[key] = value;
                        this.getOrAddValue(key, value).subscribe(
                            (dbValue: any) => {
                                if (dbValue !== value) {
                                    this.cachedState[key] = dbValue;
                                }
                                nLoaded++;
                                if (nLoaded === nKeys) {
                                    observer.next();
                                    observer.complete();
                                }
                            },
                            (error) => {
                                observer.error('loadFromDB():waitForDB():' +
                                    'getOrAddValue(): ' + error);
                            });
                    }
                },
                (error) => {
                    observer.error('loadFromDB():waitForDB(): ' + error);
                });
        });
        return source;
    }
}
